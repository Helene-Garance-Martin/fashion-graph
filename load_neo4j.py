"""
load_neo4j.py — Step 3: load your garments into Neo4j Aura.

Reads data/objects.json and builds the graph in your Aura instance:
    (Designer)-[:CREATED]->(Garment)-[:MADE_IN]->(Year)
                           (Garment)-[:OF_TYPE]->(Category)
    (Designer)-[:FROM]->(Country)

Setup:
    pip install neo4j
    # create a file called .env with your Aura details (see the message)
    python load_neo4j.py

Your password lives in .env, which .gitignore already keeps out of GitHub,
so it never leaves your machine.
"""

import json
import os
from pathlib import Path
from neo4j import GraphDatabase

# Same category logic as the quick-view graph: fall back to the title when
# the Costume Institute leaves 'classification' blank.
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


def load_env():
    """Read simple KEY=VALUE lines from a .env file, if present."""
    env = Path(".env")
    if not env.exists():
        return
    for line in env.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, val = line.split("=", 1)
            os.environ.setdefault(key.strip(), val.strip())


def build_rows(objects):
    rows = []
    for obj in objects:
        year = obj.get("objectBeginDate")
        rows.append({
            "designer": obj.get("designer") or obj.get("artistDisplayName") or "Unknown",
            "id": obj["objectID"],
            "title": obj.get("title") or "Untitled",
            "date": obj.get("objectDate") or "",
            "medium": obj.get("medium") or "",
            "image": obj.get("primaryImageSmall") or "",
            "url": obj.get("objectURL") or "",
            "year": year if (isinstance(year, int) and year > 0) else None,
            "category": category_of(obj),
            "nationality": (obj.get("artistNationality") or "").strip(),
        })
    return rows


CONSTRAINTS = [
    "CREATE CONSTRAINT designer_name IF NOT EXISTS FOR (d:Designer) REQUIRE d.name IS UNIQUE",
    "CREATE CONSTRAINT garment_id   IF NOT EXISTS FOR (g:Garment)  REQUIRE g.id   IS UNIQUE",
    "CREATE CONSTRAINT year_value   IF NOT EXISTS FOR (y:Year)     REQUIRE y.value IS UNIQUE",
    "CREATE CONSTRAINT category_name IF NOT EXISTS FOR (c:Category) REQUIRE c.name IS UNIQUE",
    "CREATE CONSTRAINT country_name IF NOT EXISTS FOR (co:Country) REQUIRE co.name IS UNIQUE",
]

LOAD = """
UNWIND $rows AS row
MERGE (d:Designer {name: row.designer})
MERGE (g:Garment {id: row.id})
  SET g.title = row.title, g.date = row.date,
      g.medium = row.medium, g.image = row.image, g.url = row.url
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
        print("I can't find your Aura details yet. Create a file called .env")
        print("next to this script, with these three lines (your real values):\n")
        print("  NEO4J_URI=neo4j+s://xxxxxxxx.databases.neo4j.io")
        print("  NEO4J_USER=neo4j")
        print("  NEO4J_PASSWORD=your-saved-password\n")
        print("Then run  python load_neo4j.py  again.")
        return

    objects = json.loads(Path("data/objects.json").read_text())
    rows = build_rows(objects)
    print(f"Loading {len(rows)} garments into Neo4j...")

    driver = GraphDatabase.driver(uri, auth=(user, password))
    with driver.session() as session:
        for c in CONSTRAINTS:
            session.run(c)
        session.run(LOAD, rows=rows)
        result = session.run(
            "MATCH (n) RETURN labels(n)[0] AS label, count(*) AS c ORDER BY c DESC"
        )
        print("\nDone. Your graph now holds:")
        for r in result:
            print(f"  {r['c']:>5}  {r['label']}")
    driver.close()
    print("\nOpen the Aura console and click 'Query' to start exploring.")


if __name__ == "__main__":
    main()