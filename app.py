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
from pathlib import Path
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
                   date=n.get("date") or "")
    elif lab == "SourceWorld":
        out.update(label=n.get("name"), color=GOLD)
    elif lab == "Artwork":
        out.update(label=n.get("title") or "Artwork", color=MARBLE,
                   image=n.get("image") or "", url=n.get("url") or "",
                   culture=n.get("culture") or "")
    else:
        out.update(label=str(n.get("name") or n.get("value")))
    return out


@app.get("/")
def index():
    return FileResponse("thread.html")


@app.get("/health")
def health():
    return {"ok": True, "neo4j_configured": driver is not None}


@app.get("/houses")
def houses():
    _require_db()
    with driver.session() as s:
        rows = s.run("MATCH (d:Designer) RETURN d.name AS name ORDER BY name")
        return [{"id": f"designer:{r['name']}", "label": r["name"],
                 "color": HOUSE_COLORS.get(r["name"], "#cccccc")} for r in rows]


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
    _require_db()
    with driver.session() as s:
        rec = s.run(HOUSE_Q, name=name).single()
    if not rec or rec["designer"] is None:
        raise HTTPException(404, f"No house named '{name}'")
    d = rec["designer"]
    nodes = {node_id(d): to_node(d)}
    links = []
    for g in rec["garments"]:
        nodes[node_id(g)] = to_node(g)
        links.append({"source": node_id(d), "target": node_id(g), "kind": "created"})
    for grp in rec["sourceGroups"]:
        sw = grp.get("sw")
        if not sw:
            continue
        nodes[node_id(sw)] = to_node(sw)
        links.append({"source": node_id(sw), "target": node_id(d), "kind": "inspired"})
        for a in grp.get("arts") or []:
            nodes[node_id(a)] = to_node(a)
            links.append({"source": node_id(a), "target": node_id(sw), "kind": "example_of"})
    return {"nodes": list(nodes.values()), "links": links}


SOURCE_Q = """
MATCH (sw:SourceWorld {name: $name})
OPTIONAL MATCH (a:Artwork)-[:EXAMPLE_OF]->(sw)
WITH sw, collect(DISTINCT a)[..60] AS arts
OPTIONAL MATCH (sw)-[:INSPIRED]->(d:Designer)
RETURN sw AS source, arts, collect(DISTINCT d) AS designers
"""


@app.get("/source/{name}")
def source(name: str):
    _require_db()
    with driver.session() as s:
        rec = s.run(SOURCE_Q, name=name).single()
    if not rec or rec["source"] is None:
        raise HTTPException(404, f"No source-world named '{name}'")
    sw = rec["source"]
    nodes = {node_id(sw): to_node(sw)}
    links = []
    for a in rec["arts"]:
        nodes[node_id(a)] = to_node(a)
        links.append({"source": node_id(a), "target": node_id(sw), "kind": "example_of"})
    for d in rec["designers"]:
        nodes[node_id(d)] = to_node(d)
        links.append({"source": node_id(sw), "target": node_id(d), "kind": "inspired"})
    return {"nodes": list(nodes.values()), "links": links}