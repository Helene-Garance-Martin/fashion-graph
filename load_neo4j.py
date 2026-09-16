"""
load_neo4j.py — load the fashion graph into Neo4j.

Reads:
    data/objects.json
    data/sources.json
    data/concepts.json

Builds:
    (Designer)-[:CREATED]->(Garment)-[:MADE_IN]->(Year)
                           (Garment)-[:OF_TYPE]->(Category)

    (Designer)-[:FROM]->(Country)

    (Artwork)-[:EXAMPLE_OF]->(SourceWorld)
    (SourceWorld)-[:INSPIRED]->(Designer)

    (Artwork)-[:HAS_CONCEPT {provenance: "CURATED"}]->(Concept)

Founder-era scoping is a curatorial decision recorded in DESIGN.md.
Each fashion house keeps only garments dated within its founder's operative
years. The raw Met data remains complete in objects.json, so the cut is
explicit and reversible.

Setup:
    pip install neo4j

    # Neo4j details live in .env or Codespace secrets.
    python load_neo4j.py
"""

import json
import os
from pathlib import Path

from neo4j import GraphDatabase


# Founder-era windows, inclusive.
WINDOWS = {
    "Vionnet": (1912, 1939),
    "Grès": (1934, 1988),
    "Lanvin": (1909, 1946),
    "Chanel": (1913, 1971),
    "Schiaparelli": (1927, 1954),
    "McCardell": (1931, 1958),
    "Charles James": (1928, 1958),
    "Balenciaga": (1937, 1968),
}

GARMENT_CONCEPTS = {
    156051: ["Bias cut"],
}


TYPE_WORDS = [
    "evening dress",
    "dinner dress",
    "wedding dress",
    "afternoon dress",
    "ball gown",
    "dress",
    "gown",
    "coat",
    "cape",
    "jacket",
    "suit",
    "ensemble",
    "skirt",
    "blouse",
    "bodice",
    "hat",
    "shoes",
    "gloves",
    "fan",
    "bag",
    "scarf",
    "robe",
]


def category_of(obj):
    classification = (obj.get("classification") or "").strip()

    if classification:
        return classification

    title = (obj.get("title") or "").lower()

    for word in TYPE_WORDS:
        if word in title:
            return word.title()

    return "Other"


def in_window(designer, year):
    """Keep a garment only if it falls inside its house's founder window."""

    window = WINDOWS.get(designer)

    if window is None:
        return True

    if not isinstance(year, int) or year <= 0:
        return False

    return window[0] <= year <= window[1]


def load_env():
    env = Path(".env")

    if not env.exists():
        return

    for line in env.read_text().splitlines():
        line = line.strip()

        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)

            os.environ.setdefault(
                key.strip(),
                value.strip(),
            )


def load_descriptions():
    path = Path("descriptions.json")

    if not path.exists():
        return {}

    raw = json.loads(path.read_text())

    return {
        key: value
        for key, value in raw.items()
        if not key.startswith("_")
    }


def build_rows(objects, descriptions=None):
    """Return garment rows and founder-era filtering statistics."""

    descriptions = descriptions or {}

    rows = []
    stats = {}

    for obj in objects:
        designer = (
            obj.get("designer")
            or obj.get("artistDisplayName")
            or "Unknown"
        )

        year = obj.get("objectBeginDate")

        stat = stats.setdefault(
            designer,
            {
                "kept": 0,
                "dropped": 0,
            },
        )

        if not in_window(designer, year):
            stat["dropped"] += 1
            continue

        stat["kept"] += 1

        rows.append(
            {
                "designer": designer,
                "id": obj["objectID"],
                "title": obj.get("title") or "Untitled",
                "date": obj.get("objectDate") or "",
                "medium": obj.get("medium") or "",
                "image": obj.get("primaryImageSmall") or "",
                "url": obj.get("objectURL") or "",
                "year": (
                    year
                    if isinstance(year, int) and year > 0
                    else None
                ),
                "category": category_of(obj),
                "nationality": (
                    obj.get("artistNationality")
                    or ""
                ).strip(),
                "description": descriptions.get(
                    str(obj["objectID"]),
                    "",
                ),
            }
        )

    return rows, stats


def build_source_rows(sources, descriptions=None):
    descriptions = descriptions or {}

    rows = []

    for src in sources:
        rows.append(
            {
                "id": src["objectID"],
                "title": src.get("title") or "Untitled",
                "date": src.get("objectDate") or "",
                "culture": src.get("culture") or "",
                "image": src.get("primaryImageSmall") or "",
                "url": src.get("objectURL") or "",
                "sourceWorld": (
                    src.get("sourceWorld")
                    or "Unknown source"
                ),
                "inspires": src.get("inspires") or [],
                "description": descriptions.get(
                    str(src["objectID"]),
                    "",
                ),
            }
        )

    return rows


def build_concept_rows(concepts):
    rows = []

    for item in concepts:
        rows.append(
            {
                "id": item["objectID"],
                "title": item.get("title") or "Untitled",
                "date": item.get("objectDate") or "",
                "culture": item.get("culture") or "",
                "image": (
                    item.get("primaryImageSmall")
                    or item.get("primaryImage")
                    or ""
                ),
                "url": item.get("objectURL") or "",
                "artist": item.get("artistDisplayName") or "",
                "medium": item.get("medium") or "",
                "dimensions": item.get("dimensions") or "",
                "classification": (
                    item.get("classification")
                    or ""
                ),
                "concept": (
                    item.get("concept")
                    or "Concept"
                ),
            }
        )

    return rows

def build_garment_concept_rows():
    rows = []

    for garment_id, concepts in GARMENT_CONCEPTS.items():
        for concept in concepts:
            rows.append(
                {
                    "garment_id": garment_id,
                    "concept": concept,
                }
            )

    return rows

LOAD = """
UNWIND $rows AS row

MERGE (d:Designer {name: row.designer})

MERGE (g:Garment {id: row.id})
  SET g.title = row.title,
      g.date = row.date,
      g.medium = row.medium,
      g.image = row.image,
      g.url = row.url,
      g.description = row.description

MERGE (d)-[:CREATED]->(g)

MERGE (c:Category {name: row.category})
MERGE (g)-[:OF_TYPE]->(c)

FOREACH (
  _ IN CASE
    WHEN row.year IS NULL THEN []
    ELSE [1]
  END |

  MERGE (y:Year {value: row.year})
  MERGE (g)-[:MADE_IN]->(y)
)

FOREACH (
  _ IN CASE
    WHEN row.nationality = '' THEN []
    ELSE [1]
  END |

  MERGE (co:Country {name: row.nationality})
  MERGE (d)-[:FROM]->(co)
)
"""


SOURCE_LOAD = """
UNWIND $rows AS row

MERGE (a:Artwork {id: row.id})
  SET a.title = row.title,
      a.date = row.date,
      a.culture = row.culture,
      a.image = row.image,
      a.url = row.url,
      a.description = row.description

MERGE (sw:SourceWorld {name: row.sourceWorld})

MERGE (a)-[:EXAMPLE_OF]->(sw)

WITH sw, row

UNWIND row.inspires AS house

MATCH (d:Designer {name: house})

MERGE (sw)-[:INSPIRED]->(d)
"""


CONCEPT_LOAD = """
UNWIND $rows AS row

MERGE (a:Artwork {id: row.id})
  SET a.title = row.title,
      a.date = row.date,
      a.culture = row.culture,
      a.image = row.image,
      a.url = row.url,
      a.artist = row.artist,
      a.medium = row.medium,
      a.dimensions = row.dimensions,
      a.classification = row.classification

MERGE (c:Concept {name: row.concept})

MERGE (a)-[r:HAS_CONCEPT]->(c)
SET r.provenance = "CURATED"
"""

GARMENT_CONCEPT_LOAD = """
UNWIND $rows AS row

MATCH (g:Garment {id: row.garment_id})

MERGE (c:Concept {name: row.concept})

MERGE (g)-[r:HAS_CONCEPT]->(c)
SET r.provenance = "CURATED"
"""

CONSTRAINTS = [
    (
        "CREATE CONSTRAINT designer_name IF NOT EXISTS "
        "FOR (d:Designer) REQUIRE d.name IS UNIQUE"
    ),
    (
        "CREATE CONSTRAINT garment_id IF NOT EXISTS "
        "FOR (g:Garment) REQUIRE g.id IS UNIQUE"
    ),
    (
        "CREATE CONSTRAINT year_value IF NOT EXISTS "
        "FOR (y:Year) REQUIRE y.value IS UNIQUE"
    ),
    (
        "CREATE CONSTRAINT category_name IF NOT EXISTS "
        "FOR (c:Category) REQUIRE c.name IS UNIQUE"
    ),
    (
        "CREATE CONSTRAINT country_name IF NOT EXISTS "
        "FOR (co:Country) REQUIRE co.name IS UNIQUE"
    ),
    (
        "CREATE CONSTRAINT artwork_id IF NOT EXISTS "
        "FOR (a:Artwork) REQUIRE a.id IS UNIQUE"
    ),
    (
        "CREATE CONSTRAINT sourceworld_name IF NOT EXISTS "
        "FOR (sw:SourceWorld) REQUIRE sw.name IS UNIQUE"
    ),
    (
        "CREATE CONSTRAINT concept_name IF NOT EXISTS "
        "FOR (c:Concept) REQUIRE c.name IS UNIQUE"
    ),
]


# Clear only Twinning's graph-data nodes.
# Saved Show nodes are deliberately NOT included here.
CLEAR = (
    "MATCH (n) "
    "WHERE n:Designer "
    "OR n:Garment "
    "OR n:Year "
    "OR n:Category "
    "OR n:Country "
    "OR n:Artwork "
    "OR n:SourceWorld "
    "OR n:Concept "
    "DETACH DELETE n"
)


def main():
    load_env()

    uri = os.environ.get("NEO4J_URI")
    user = os.environ.get(
        "NEO4J_USER",
        "neo4j",
    )
    password = os.environ.get(
        "NEO4J_PASSWORD"
    )

    if not uri or not password:
        print(
            "I can't find your Neo4j details yet. "
            "Create a .env file with:\n"
        )
        print(
            "  NEO4J_URI=bolt://localhost:7687"
        )
        print(
            "  NEO4J_USER=neo4j"
        )
        print(
            "  NEO4J_PASSWORD=fashiongraph\n"
        )
        print(
            "Then run python load_neo4j.py again."
        )
        return

    descriptions = load_descriptions()

    objects = json.loads(
        Path("data/objects.json").read_text()
    )

    rows, stats = build_rows(
        objects,
        descriptions,
    )

    print(
        "Founder-era scoping "
        "(kept / dropped per house):"
    )

    for house in WINDOWS:
        stat = stats.get(
            house,
            {
                "kept": 0,
                "dropped": 0,
            },
        )

        lo, hi = WINDOWS[house]

        print(
            f"  {house:<14} "
            f"{lo}-{hi}   "
            f"kept {stat['kept']:>4}   "
            f"dropped {stat['dropped']:>4}"
        )

    print(
        f"\nLoading {len(rows)} garments "
        "(after scoping) into Neo4j..."
    )

    driver = GraphDatabase.driver(
        uri,
        auth=(
            user,
            password,
        ),
    )

    with driver.session() as session:
        session.run(CLEAR)

        for constraint in CONSTRAINTS:
            session.run(constraint)

        session.run(
            LOAD,
            rows=rows,
        )

        source_path = Path(
            "data/sources.json"
        )

        if source_path.exists():
            source_rows = build_source_rows(
                json.loads(
                    source_path.read_text()
                ),
                descriptions,
            )

            session.run(
                SOURCE_LOAD,
                rows=source_rows,
            )

            print(
                f"  + {len(source_rows)} "
                "source artworks linked into the graph"
            )

        else:
            print(
                "  (no data/sources.json yet — "
                "run fetch_sources.py to add "
                "source-worlds)"
            )

        concept_path = Path(
            "data/concepts.json"
        )

        if concept_path.exists():
            concept_rows = build_concept_rows(
                json.loads(
                    concept_path.read_text()
                )
            )

            session.run(
                CONCEPT_LOAD,
                rows=concept_rows,
            )

            print(
                f"  + {len(concept_rows)} "
                "concept anchors linked into the graph"
            )

        else:
            print(
                "  (no data/concepts.json yet — "
                "run fetch_concepts.py to add "
                "concept anchors)"
            )

        garment_concept_rows = build_garment_concept_rows()

        session.run(
            GARMENT_CONCEPT_LOAD,
            rows=garment_concept_rows,
        )

        print(
            f"  + {len(garment_concept_rows)} "
            "garment-concept links added"
        )

        result = session.run(
            """
            MATCH (n)
            RETURN labels(n)[0] AS label,
                   count(*) AS c
            ORDER BY c DESC
            """
        )

        print(
            "\nDone. Your graph now holds:"
        )

        for row in result:
            print(
                f"  {row['c']:>5}  "
                f"{row['label']}"
            )

    driver.close()

    print(
        "\nEach house is now scoped "
        "to its founder's years."
    )


if __name__ == "__main__":
    main()