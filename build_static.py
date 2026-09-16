"""Build the static graph snapshot used by the public portfolio deployment."""

import json
from pathlib import Path
from urllib.parse import quote
from urllib.request import urlopen

API_BASE = "http://localhost:8000"

SOURCE_NAMES = [
    "Ancient Greek sculpture",
    "Japanese kimono",
    "Spanish painting",
]

OUTPUT_PATHS = [
    Path("docs/data.json"),
    Path("frontend/public/data.json"),
]


def fetch_json(path):
    url = f"{API_BASE}{path}"

    with urlopen(url) as response:
        return json.load(response)


def main():
    print("Building static portfolio snapshot...")

    houses = fetch_json("/houses")
    concepts = fetch_json("/concepts")

    house_graphs = {}

    for house in houses:
        name = house["label"]

        print(f"  house: {name}")

        house_graphs[name] = fetch_json(f"/house/{quote(name)}")

    source_graphs = {}

    for name in SOURCE_NAMES:
        print(f"  source: {name}")

        source_graphs[name] = fetch_json(f"/source/{quote(name)}")

    concept_graphs = {}

    for concept in concepts:
        name = concept["label"]

        print(f"  concept: {name}")

        concept_graphs[name] = fetch_json(f"/concept/{quote(name)}")

    snapshot = {
        "houses": houses,
        "house": house_graphs,
        "source": source_graphs,
        "concepts": concepts,
        "concept": concept_graphs,
    }

    text = json.dumps(
        snapshot,
        indent=2,
        ensure_ascii=False,
    )

    for path in OUTPUT_PATHS:
        path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        path.write_text(
            text,
            encoding="utf-8",
        )

        print(f"  wrote {path}")

    print()
    print(
        f"Done: {len(houses)} houses, "
        f"{len(source_graphs)} source worlds, "
        f"{len(concepts)} concepts."
    )


if __name__ == "__main__":
    main()
