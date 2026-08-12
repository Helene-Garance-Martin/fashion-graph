"""
load_neo4j.py — load the garments into Neo4j, scoped to each house's founder era.

Reads data/objects.json and builds the graph in your local Neo4j:
    (Designer)-[:CREATED]->(Garment)-[:MADE_IN]->(Year)
                           (Garment)-[:OF_TYPE]->(Category)
    (Designer)-[:FROM]->(Country)

Founder-era scoping (a curatorial decision — see DESIGN.md): each house keeps
only garments dated within its founder's operative years. This is applied HERE,
at load time, so the raw data in objects.json stays complete and the cut stays
explicit and reversible. Successor creative directors (Lagerfeld, Elbaz, ...)
fall outside the windows and are excluded automatically.

Setup:
    pip install neo4j
    # Aura details / local details in a .env file (or Codespace secrets)
    python load_neo4j.py
"""

import json
import os
from pathlib import Path
from neo4j import GraphDatabase

# Founder-era windows (inclusive). Scope each house to its founder's years.
WINDOWS = {
    "Vionnet":       (1912, 1939),
    "Grès":          (1934, 1988),
    "Lanvin":        (1909, 1946),
    "Chanel":        (1913, 1971),   # Gabrielle's own span; excludes Lagerfeld (1983+)
    "Schiaparelli":  (1927, 1954),
    "McCardell":     (1931, 1958),
    "Charles James": (1928, 1958),
    "Balenciaga":    (1937, 1968),
}

TYPE_WORDS = [
    "evening dress", "dinner dress", "wedding dress", "afternoon dress",
    "ball gown", "dress", "gown", "coat", "cape", "jacket", "suit",
    "ensemble", "skirt", "blouse", "bodice", "hat", "shoes", "gloves",
    "fan", "bag", "scarf", "robe",
]


def category_of(obj):
    c = (obj.get("classification") or "").strip()
    if c:
        return c
    title = (obj.get("title") or "").lower()
    for w in TYPE_WORDS:
        if w in title:
            return w.title()
    return "Other"


def in_window(designer, year):
    """Keep a garment only if it falls inside its house's founder window."""
    w = WINDOWS.get(designer)
    if w is None:
        return True  # no window defined -> don't scope
    if not isinstance(year, int) or year <= 0:
        return False  # founder-era scoping needs a date
    return w[0] <= year <= w[1]


def load_env():
    env = Path(".env")
    if not env.exists():
        return
    for line in env.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, val = line.split("=", 1)
            os.environ.setdefault(key.strip(), val.strip())


def load_descriptions():
    p = Path("descriptions.json")
    if not p.exists():
        return {}
    raw = json.loads(p.read_text())
    return {k: v for k, v in raw.items() if not k.startswith("_")}


def build_rows(objects, descriptions=None):
    descriptions = descriptions or {}
    """Return (rows, stats) with founder-era scoping applied."""
    rows = []
    stats = {}  # designer -> {"kept": n, "dropped": n}
    for obj in objects:
        designer = obj.get("designer") or obj.get("artistDisplayName") or "Unknown"
        year = obj.get("objectBeginDate")
        s = stats.setdefault(designer, {"kept": 0, "dropped": 0})
        if not in_window(designer, year):
            s["dropped"] += 1
            continue
        s["kept"] += 1
        rows.append({
            "designer": designer,
            "id": obj["objectID"],
            "title": obj.get("title") or "Untitled",
            "date": obj.get("objectDate") or "",
            "medium": obj.get("medium") or "",
            "image": obj.get("primaryImageSmall") or "",
            "url": obj.get("objectURL") or "",
            "year": year if (isinstance(year, int) and year > 0) else None,
            "category": category_of(obj),
            "nationality": (obj.get("artistNationality") or "").strip(),
            "description": descriptions.get(str(obj["objectID"]), ""),
        })
    return rows, stats


def build_source_rows(sources, descriptions=None):
    descriptions = descriptions or {}
    rows = []
    for src in sources:
        rows.append({
            "id": src["objectID"],
            "title": src.get("title") or "Untitled",
            "date": src.get("objectDate") or "",
            "culture": src.get("culture") or "",
            "image": src.get("primaryImageSmall") or "",
            "url": src.get("objectURL") or "",
            "sourceWorld": src.get("sourceWorld") or "Unknown source",
            "inspires": src.get("inspires") or [],
            "description": descriptions.get(str(src["objectID"]), ""),
        })
    return rows


SOURCE_LOAD = """
UNWIND $rows AS row
MERGE (a:Artwork {id: row.id})
  SET a.title = row.title, a.date = row.date, a.culture = row.culture,
      a.image = row.image, a.url = row.url, a.description = row.description
MERGE (sw:SourceWorld {name: row.sourceWorld})
MERGE (a)-[:EXAMPLE_OF]->(sw)
WITH sw, row
UNWIND row.inspires AS house
MATCH (d:Designer {name: house})
MERGE (sw)-[:INSPIRED]->(d)
"""


CONSTRAINTS = [
    "CREATE CONSTRAINT designer_name IF NOT EXISTS FOR (d:Designer) REQUIRE d.name IS UNIQUE",
    "CREATE CONSTRAINT garment_id   IF NOT EXISTS FOR (g:Garment)  REQUIRE g.id   IS UNIQUE",
    "CREATE CONSTRAINT year_value   IF NOT EXISTS FOR (y:Year)     REQUIRE y.value IS UNIQUE",
    "CREATE CONSTRAINT category_name IF NOT EXISTS FOR (c:Category) REQUIRE c.name IS UNIQUE",
    "CREATE CONSTRAINT country_name IF NOT EXISTS FOR (co:Country) REQUIRE co.name IS UNIQUE",
    "CREATE CONSTRAINT artwork_id IF NOT EXISTS FOR (a:Artwork) REQUIRE a.id IS UNIQUE",
    "CREATE CONSTRAINT sourceworld_name IF NOT EXISTS FOR (sw:SourceWorld) REQUIRE sw.name IS UNIQUE",
]

# Clear only this project's nodes, so each load is a clean, correctly-scoped
# rebuild. Raw data lives in objects.json, so nothing is lost.
CLEAR = ("MATCH (n) WHERE n:Designer OR n:Garment OR n:Year OR n:Category "
         "OR n:Country OR n:Artwork OR n:SourceWorld DETACH DELETE n")

LOAD = """
UNWIND $rows AS row
MERGE (d:Designer {name: row.designer})
MERGE (g:Garment {id: row.id})
  SET g.title = row.title, g.date = row.date,
      g.medium = row.medium, g.image = row.image, g.url = row.url,
      g.description = row.description
MERGE (d)-[:CREATED]->(g)
MERGE (c:Category {name: row.category})
MERGE (g)-[:OF_TYPE]->(c)
FOREACH (_ IN CASE WHEN row.year IS NULL THEN [] ELSE [1] END |
  MERGE (y:Year {value: row.year})
  MERGE (g)-[:MADE_IN]->(y)
)
FOREACH (_ IN CASE WHEN row.nationality = '' THEN [] ELSE [1] END |
  MERGE (co:Country {name: row.nationality})
  MERGE (d)-[:FROM]->(co)
)
"""


def main():
    load_env()
    uri = os.environ.get("NEO4J_URI")
    user = os.environ.get("NEO4J_USER", "neo4j")
    password = os.environ.get("NEO4J_PASSWORD")

    if not uri or not password:
        print("I can't find your Neo4j details yet. Create a .env file with:\n")
        print("  NEO4J_URI=bolt://localhost:7687")
        print("  NEO4J_USER=neo4j")
        print("  NEO4J_PASSWORD=fashiongraph\n")
        print("Then run  python load_neo4j.py  again.")
        return

    descriptions = load_descriptions()
    objects = json.loads(Path("data/objects.json").read_text())
    rows, stats = build_rows(objects, descriptions)

    print("Founder-era scoping (kept / dropped per house):")
    for house in WINDOWS:
        s = stats.get(house, {"kept": 0, "dropped": 0})
        lo, hi = WINDOWS[house]
        print(f"  {house:<14} {lo}-{hi}   kept {s['kept']:>4}   "
              f"dropped {s['dropped']:>4}")
    print(f"\nLoading {len(rows)} garments (after scoping) into Neo4j...")

    driver = GraphDatabase.driver(uri, auth=(user, password))
    with driver.session() as session:
        session.run(CLEAR)
        for c in CONSTRAINTS:
            session.run(c)
        session.run(LOAD, rows=rows)

        src_path = Path("data/sources.json")
        if src_path.exists():
            srows = build_source_rows(json.loads(src_path.read_text()), descriptions)
            session.run(SOURCE_LOAD, rows=srows)
            print(f"  + {len(srows)} source artworks linked into the graph")
        else:
            print("  (no data/sources.json yet — run fetch_sources.py to add source-worlds)")
        result = session.run(
            "MATCH (n) RETURN labels(n)[0] AS label, count(*) AS c ORDER BY c DESC"
        )
        print("\nDone. Your graph now holds:")
        for r in result:
            print(f"  {r['c']:>5}  {r['label']}")
    driver.close()
    print("\nEach house is now scoped to its founder's years.")


if __name__ == "__main__":
    main()