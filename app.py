"""
app.py — the THREAD API. Serves the couture graph from Neo4j as JSON that the
front-end can render directly ({nodes, links}).

Run:
    pip install fastapi uvicorn neo4j
    uvicorn app:app --reload --port 8000

Then (Codespaces will offer to forward port 8000) open:
    /health            → is it up, is Neo4j connected
    /houses            → the eight houses (for search / seeding)
    /house/Vionnet     → Vionnet's world: garments + the source-worlds that
                         inspired her + those sources' artworks (with images)
    /source/Ancient%20Greek%20sculpture → a source-world and everything it feeds
"""

import os
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from neo4j import GraphDatabase

# --- house colours, mirrored from the graph so the API is self-describing ---
HOUSE_COLORS = {
    "Vionnet": "#d98a8a", "Grès": "#7fa8c9", "Chanel": "#c9b98a",
    "Lanvin": "#6f7fd9", "McCardell": "#9caf88", "Charles James": "#9a7fae",
    "Schiaparelli": "#e368a6", "Balenciaga": "#9a4b57",
}
GOLD = "#c9a24b"
MARBLE = "#d8cdb8"

STATIC_DATA_PATH = Path("docs/data.json")


def load_static_data():
    if not STATIC_DATA_PATH.exists():
        return None

    with STATIC_DATA_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)


STATIC_DATA = load_static_data()

RAW_MET_PATH = Path("data/objects.json")


def load_raw_met_objects():
    if not RAW_MET_PATH.exists():
        return {}

    with RAW_MET_PATH.open("r", encoding="utf-8") as f:
        objects = json.load(f)

    return {
        str(obj.get("objectID")): obj
        for obj in objects
        if obj.get("objectID") is not None
    }


RAW_MET_OBJECTS = load_raw_met_objects()


def enrich_static_graph(graph):
    if not graph:
        return graph

    for node in graph.get("nodes", []):
        if node.get("type") not in {"garment", "artwork"}:
            continue

        _, _, object_id = node.get("id", "").partition(":")

        raw = RAW_MET_OBJECTS.get(object_id)

        if not raw:
            continue

        node["medium"] = raw.get("medium") or ""
        node["dimensions"] = raw.get("dimensions") or ""
        node["classification"] = raw.get("classification") or ""

        if not node.get("culture"):
            node["culture"] = raw.get("culture") or ""

    return graph


def load_env():
    env = Path(".env")
    if not env.exists():
        return
    for line in env.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())


load_env()
URI = os.environ.get("NEO4J_URI")
USER = os.environ.get("NEO4J_USER", "neo4j")
PWD = os.environ.get("NEO4J_PASSWORD")
driver = GraphDatabase.driver(URI, auth=(USER, PWD)) if (URI and PWD) else None
if driver:
    try:
        with driver.session() as _s:
            _s.run("CREATE CONSTRAINT exhibition_id IF NOT EXISTS "
                   "FOR (e:Exhibition) REQUIRE e.id IS UNIQUE")
    except Exception:
        pass

app = FastAPI(title="THREAD — an inspiration atlas")
# open CORS so the mockup (opened as a local file) can call this API
app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])


def _require_db():
    if driver is None:
        raise HTTPException(503, "No Neo4j connection — is .env set and the DB running?")


def node_id(n):
    lab = list(n.labels)[0]
    key = {"Designer": "name", "Garment": "id", "SourceWorld": "name",
           "Artwork": "id", "Year": "value", "Category": "name",
           "Country": "name"}.get(lab, "name")
    return f"{lab.lower()}:{n.get(key)}"


def to_node(n):
    lab = list(n.labels)[0]
    out = {"id": node_id(n), "type": lab.lower()}
    if lab == "Designer":
        out.update(label=n.get("name"), color=HOUSE_COLORS.get(n.get("name"), "#cccccc"))
    elif lab == "Garment":
        out.update(label=n.get("title") or "Garment", color="#8a8792",
                   image=n.get("image") or "", url=n.get("url") or "",
                   date=n.get("date") or "", description=n.get("description") or "")
    elif lab == "SourceWorld":
        out.update(label=n.get("name"), color=GOLD)
    elif lab == "Artwork":
        out.update(label=n.get("title") or "Artwork", color=MARBLE,
                   image=n.get("image") or "", url=n.get("url") or "",
                   culture=n.get("culture") or "", description=n.get("description") or "")
    else:
        out.update(label=str(n.get("name") or n.get("value")))
    return out


@app.get("/")
def index():
    return FileResponse("thread.html")


@app.get("/health")
def health():
    neo4j_connected = False

    if driver:
        try:
            driver.verify_connectivity()
            neo4j_connected = True
        except Exception:
            neo4j_connected = False

    return {
        "ok": True,
        "neo4j_configured": driver is not None,
        "neo4j_connected": neo4j_connected,
        "static_data_available": STATIC_DATA is not None,
    }


@app.get("/houses")
def houses():
    if driver:
        try:
            with driver.session() as s:
                rows = s.run(
                    "MATCH (d:Designer) "
                    "RETURN d.name AS name "
                    "ORDER BY name"
                )

                return [
                    {
                        "id": f"designer:{r['name']}",
                        "label": r["name"],
                        "color": HOUSE_COLORS.get(
                            r["name"],
                            "#cccccc",
                        ),
                    }
                    for r in rows
                ]
        except Exception:
            pass

    if STATIC_DATA:
        return STATIC_DATA["houses"]

    raise HTTPException(
        503,
        "Neither Neo4j nor static graph data is available.",
    )


HOUSE_Q = """
MATCH (d:Designer {name: $name})
OPTIONAL MATCH (d)-[:CREATED]->(g:Garment)
WITH d, collect(DISTINCT g)[..60] AS garments
OPTIONAL MATCH (sw:SourceWorld)-[:INSPIRED]->(d)
OPTIONAL MATCH (a:Artwork)-[:EXAMPLE_OF]->(sw)
WITH d, garments, sw, collect(DISTINCT a)[..40] AS arts
RETURN d AS designer, garments, collect({sw: sw, arts: arts}) AS sourceGroups
"""


@app.get("/house/{name}")
def house(name: str):
    if driver:
        try:
            with driver.session() as s:
                rec = s.run(HOUSE_Q, name=name).single()

            if rec and rec["designer"] is not None:
                d = rec["designer"]

                nodes = {
                    node_id(d): to_node(d)
                }

                links = []

                for g in rec["garments"]:
                    nodes[node_id(g)] = to_node(g)

                    links.append({
                        "source": node_id(d),
                        "target": node_id(g),
                        "kind": "created",
                    })

                for grp in rec["sourceGroups"]:
                    sw = grp.get("sw")

                    if not sw:
                        continue

                    nodes[node_id(sw)] = to_node(sw)

                    links.append({
                        "source": node_id(sw),
                        "target": node_id(d),
                        "kind": "inspired",
                    })

                    for a in grp.get("arts") or []:
                        nodes[node_id(a)] = to_node(a)

                        links.append({
                            "source": node_id(a),
                            "target": node_id(sw),
                            "kind": "example_of",
                        })

                return {
                    "nodes": list(nodes.values()),
                    "links": links,
                }

        except Exception:
            pass

    if STATIC_DATA:
        static_house = STATIC_DATA["house"].get(name)

        if static_house:
            return enrich_static_graph(static_house)

    raise HTTPException(
        404,
        f"No house named '{name}'",
    )

SOURCE_Q = """
MATCH (sw:SourceWorld {name: $name})
OPTIONAL MATCH (a:Artwork)-[:EXAMPLE_OF]->(sw)
WITH sw, collect(DISTINCT a)[..60] AS arts
OPTIONAL MATCH (sw)-[:INSPIRED]->(d:Designer)
RETURN sw AS source, arts, collect(DISTINCT d) AS designers
"""


@app.get("/source/{name}")
def source(name: str):
    if driver:
        try:
            with driver.session() as s:
                rec = s.run(SOURCE_Q, name=name).single()

            if rec and rec["source"] is not None:
                sw = rec["source"]

                nodes = {
                    node_id(sw): to_node(sw)
                }

                links = []

                for a in rec["arts"]:
                    nodes[node_id(a)] = to_node(a)

                    links.append({
                        "source": node_id(a),
                        "target": node_id(sw),
                        "kind": "example_of",
                    })

                for d in rec["designers"]:
                    nodes[node_id(d)] = to_node(d)

                    links.append({
                        "source": node_id(sw),
                        "target": node_id(d),
                        "kind": "inspired",
                    })

                return {
                    "nodes": list(nodes.values()),
                    "links": links,
                }

        except Exception:
            pass

    if STATIC_DATA:
        static_source = STATIC_DATA["source"].get(name)

        if static_source:
            return enrich_static_graph(static_source)

    raise HTTPException(
        404,
        f"No source-world named '{name}'",
    )

# ---------- exhibitions: Create / Read / Update / Delete ----------
# A saved show. Its items are stored as a JSON blob (label, image, url, type...)
# so the diaporama is self-contained. Reloading the couture graph does NOT touch
# exhibitions — the CLEAR in load_neo4j.py leaves :Exhibition alone.

class Item(BaseModel):
    id: str
    label: str = ""
    type: str = ""
    image: str | None = None
    url: str | None = None
    description: str | None = None   # authored: text-card + alt + audio


class ExhibitionIn(BaseModel):
    title: str = "Untitled exhibition"
    items: list[Item] = []


def _exhib_out(e):
    return {"id": e["id"], "title": e["title"],
            "items": json.loads(e.get("items") or "[]"),
            "updated": e.get("updated")}


@app.post("/exhibitions")
def create_exhibition(ex: ExhibitionIn):
    _require_db()
    eid = uuid.uuid4().hex[:12]
    now = datetime.now(timezone.utc).isoformat()
    with driver.session() as s:
        s.run("CREATE (e:Exhibition {id:$id, title:$title, items:$items, updated:$updated})",
              id=eid, title=ex.title, items=json.dumps([i.model_dump() for i in ex.items]), updated=now)
    return {"id": eid, "title": ex.title, "items": ex.items, "updated": now}


@app.get("/exhibitions")
def list_exhibitions():
    _require_db()
    with driver.session() as s:
        rows = s.run("MATCH (e:Exhibition) RETURN e ORDER BY e.updated DESC")
        out = []
        for r in rows:
            e = r["e"]
            out.append({"id": e["id"], "title": e["title"],
                        "count": len(json.loads(e.get("items") or "[]")),
                        "updated": e.get("updated")})
        return out


@app.get("/exhibitions/{eid}")
def get_exhibition(eid: str):
    _require_db()
    with driver.session() as s:
        r = s.run("MATCH (e:Exhibition {id:$id}) RETURN e", id=eid).single()
    if not r:
        raise HTTPException(404, f"No exhibition '{eid}'")
    return _exhib_out(r["e"])


@app.put("/exhibitions/{eid}")
def update_exhibition(eid: str, ex: ExhibitionIn):
    _require_db()
    now = datetime.now(timezone.utc).isoformat()
    with driver.session() as s:
        r = s.run("MATCH (e:Exhibition {id:$id}) "
                  "SET e.title=$title, e.items=$items, e.updated=$updated RETURN e",
                  id=eid, title=ex.title, items=json.dumps([i.model_dump() for i in ex.items]), updated=now).single()
    if not r:
        raise HTTPException(404, f"No exhibition '{eid}'")
    return {"id": eid, "title": ex.title, "items": ex.items, "updated": now}


@app.delete("/exhibitions/{eid}")
def delete_exhibition(eid: str):
    _require_db()
    with driver.session() as s:
        r = s.run("MATCH (e:Exhibition {id:$id}) WITH e, e.id AS existed "
                  "DETACH DELETE e RETURN existed", id=eid).single()
    if not r:
        raise HTTPException(404, f"No exhibition '{eid}'")
    return {"deleted": eid}