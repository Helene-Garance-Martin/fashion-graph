import json
import time
from pathlib import Path

from fetch_sources import get_json


CONCEPT_ANCHORS = {
    "Drape": [845722],
    "Loom": [447357],
    "Fragment": [251526],
    "Mask": [22460],
    "Figure": [453631],
    "Surplice": [220084],
    "Chasuble": [227573],
    "Habit": [68357],
    "Veil": [168319],

    "Pleat": [85396],
    "Twine": [475025],
    "Grosgrain": [13330],
}

KEEP_FIELDS = [
    "objectID",
    "title",
    "artistDisplayName",
    "culture",
    "objectDate",
    "classification",
    "medium",
    "dimensions",
    "primaryImage",
    "primaryImageSmall",
    "objectURL",
    "isPublicDomain",
]


def fetch_object(object_id):
    full = get_json(
        f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{object_id}"
    )
    return {key: full.get(key) for key in KEEP_FIELDS}


def main():
    output = []

    for concept, object_ids in CONCEPT_ANCHORS.items():
        print(f"\n— {concept} —")

        for object_id in object_ids:
            try:
                row = fetch_object(object_id)
            except Exception as exc:
                print(f"  ! {object_id} failed: {exc}")
                continue

            if not row.get("isPublicDomain"):
                print(f"  ! {object_id} skipped: not public domain")
                continue

            image = (
                row.get("primaryImageSmall")
                or row.get("primaryImage")
                or ""
            ).strip()

            if not image:
                print(f"  ! {object_id} skipped: no image")
                continue

            row["concept"] = concept
            output.append(row)

            print(
                f"  ✓ {object_id}: "
                f"{row.get('title') or 'Untitled'}"
            )

            time.sleep(0.2)

    path = Path("data/concepts.json")

    path.write_text(
        json.dumps(
            output,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    print(f"\nSaved {len(output)} concept anchors to {path}")


if __name__ == "__main__":
    main()