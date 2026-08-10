"""
fetch_sources.py — the first source-world: ancient Greek sculpture.

Pulls drapery-rich, OPEN-ACCESS works from the Met's Greek and Roman Art
department (department 13). Because these are thousands of years old they're
public domain, so — unlike the couture — they come WITH full-resolution images,
free and no permission needed.

Each work is tagged with the source-world it belongs to and the houses it
inspired, so the loader can draw:
    (Artwork)-[:EXAMPLE_OF]->(SourceWorld)-[:INSPIRED]->(Designer)

Run:  python fetch_sources.py
Out:  ./data/sources.json
"""

import json
import time
import urllib.parse
import urllib.request
import urllib.error
from pathlib import Path

API = "https://collectionapi.metmuseum.org/public/collection/v1"
GREEK_AND_ROMAN = 13  # department id

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
      "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36")

# This source-world, and the houses it fed. (Grès and Vionnet are the classical
# drapers; see DESIGN.md.)
SOURCE_WORLD = "Ancient Greek sculpture"
INSPIRES = ["Vionnet", "Grès"]

# Drapery-focused searches — we want the draped body, not coins or fragments.
TERMS = [
    "marble statue draped", "marble kore", "peplos figure", "himation",
    "statue of Nike", "statue of Aphrodite", "draped goddess", "marble grave stele woman",
]

# How many to keep — a curated selection beats a data dump for an inspiration tool.
MAX_KEEP = 60

KEEP = [
    "objectID", "title", "artistDisplayName", "culture",
    "objectDate", "objectBeginDate", "objectEndDate",
    "classification", "medium", "primaryImageSmall", "objectURL",
    "isPublicDomain",
]


def get_json(url, max_retries=6):
    delay = 2.0
    for attempt in range(1, max_retries + 1):
        try:
            req = urllib.request.Request(
                url, headers={"User-Agent": UA, "Accept": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.load(r)
        except (urllib.error.HTTPError, urllib.error.URLError) as e:
            code = getattr(e, "code", None)
            if attempt < max_retries and code in (403, 429, 500, 502, 503, None):
                print(f"    (Met said wait — pausing {delay:.0f}s, try {attempt})")
                time.sleep(delay)
                delay *= 2
                continue
            raise


def search_ids(term):
    q = urllib.parse.urlencode({
        "departmentId": GREEK_AND_ROMAN,
        "hasImages": "true",   # only works with a picture — the whole point here
        "q": term,
    })
    data = get_json(f"{API}/search?{q}")
    return data.get("objectIDs") or []


def keep_fields(full):
    row = {k: full.get(k) for k in KEEP}
    row["sourceWorld"] = SOURCE_WORLD
    row["inspires"] = INSPIRES
    return row


def usable(row):
    """A striking, showable marble: has an image and is public-domain sculpture."""
    if not (row.get("primaryImageSmall") or "").strip():
        return False
    if not row.get("isPublicDomain"):
        return False
    text = ((row.get("classification") or "") + " " + (row.get("medium") or "")).lower()
    return "marble" in text or "stone" in text or "sculpture" in text or "statue" in text


def main():
    out = Path("data")
    out.mkdir(exist_ok=True)

    ids = []
    for term in TERMS:
        try:
            found = search_ids(term)
        except Exception as e:
            print(f"  ! search '{term}' failed: {e}")
            continue
        print(f"  search '{term}': {len(found)} candidates")
        ids.extend(found)
        time.sleep(0.2)
    ids = list(dict.fromkeys(ids))  # de-dupe, keep order
    print(f"\n{len(ids)} unique candidates; fetching until we have {MAX_KEEP} good ones...")

    kept = []
    for i, oid in enumerate(ids, 1):
        if len(kept) >= MAX_KEEP:
            break
        try:
            row = keep_fields(get_json(f"{API}/objects/{oid}"))
        except Exception as e:
            print(f"  ! skipped {oid}: {e}")
            continue
        if usable(row):
            kept.append(row)
        time.sleep(0.2)
        if i % 25 == 0:
            print(f"  ...checked {i}/{len(ids)}, kept {len(kept)}")

    (out / "sources.json").write_text(
        json.dumps(kept, indent=2, ensure_ascii=False)
    )
    print(f"\nDone. {len(kept)} Greek sculptures saved to data/sources.json"
          f" — all with images, all linked to {', '.join(INSPIRES)}.")


if __name__ == "__main__":
    main()