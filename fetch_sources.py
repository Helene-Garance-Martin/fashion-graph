"""
fetch_sources.py — the source-worlds behind the couture.

Pulls OPEN-ACCESS works from the Met that inspired the houses — so, unlike the
rights-reserved couture, they come WITH images. Each source-world knows which
department to search, which terms, which houses it fed, and what materials count.

Currently: Ancient Greek sculpture (drapery) and the Japanese kimono.
Re-running is safe: source-worlds already saved are skipped, not re-fetched.

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
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
      "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36")
MAX_KEEP = 50  # per source-world — a curated selection, not a data dump

SOURCE_WORLDS = [
    {
        "name": "Ancient Greek sculpture", "dept": 13,
        "inspires": ["Vionnet", "Grès"],
        "terms": ["marble statue draped", "marble kore", "peplos figure",
                  "himation", "statue of Nike", "statue of Aphrodite",
                  "draped goddess", "marble grave stele woman"],
        "keep": ["marble", "stone", "statue", "sculpture", "terracotta", "limestone"],
    },
    {
        "name": "Japanese kimono", "dept": 6,
        "inspires": ["Vionnet"],
        "terms": ["kimono", "kosode", "furisode", "uchikake",
                  "noh costume", "robe japan"],
        "keep": ["silk", "cotton", "kimono", "robe", "textile", "costume",
                 "crepe", "damask", "paper"],
    },
    {
        "name": "Spanish painting", "dept": 11,   # European Paintings
        "inspires": ["Balenciaga"],
        "terms": ["El Greco", "Velázquez", "Goya", "Zurbarán", "Murillo",
                  "Ribera", "infanta"],
        "keep": ["oil", "canvas", "painting", "panel", "tempera", "wood"],
        # second guard: the work must actually be Spanish-attributed
        "match": ["spanish", "greco", "velázquez", "velazquez", "goya",
                  "zurbarán", "zurbaran", "murillo", "ribera"],
    },
]

KEEP_FIELDS = [
    "objectID", "title", "artistDisplayName", "culture",
    "objectDate", "objectBeginDate", "objectEndDate",
    "classification", "medium", "primaryImageSmall", "objectURL", "isPublicDomain",
]


def get_json(url, max_retries=6):
    delay = 2.0
    for attempt in range(1, max_retries + 1):
        try:
            req = urllib.request.Request(
                url, headers={"User-Agent": UA, "Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.load(r)
        except (urllib.error.HTTPError, urllib.error.URLError) as e:
            code = getattr(e, "code", None)
            if attempt < max_retries and code in (403, 429, 500, 502, 503, None):
                print(f"    (Met said wait — pausing {delay:.0f}s)")
                time.sleep(delay)
                delay *= 2
                continue
            raise


def search_ids(dept, term):
    q = urllib.parse.urlencode({"departmentId": dept, "hasImages": "true",
                                "artistOrCulture": "true", "q": term})
    return (get_json(f"{API}/search?{q}").get("objectIDs")) or []


def usable(row, world):
    if not (row.get("primaryImageSmall") or "").strip():
        return False
    if not row.get("isPublicDomain"):
        return False
    hay = " ".join(str(row.get(k) or "") for k in ("classification", "medium", "title")).lower()
    if not any(t in hay for t in world["keep"]):
        return False
    match = world.get("match")
    if match:
        who = (str(row.get("artistDisplayName") or "") + " " + str(row.get("culture") or "")).lower()
        if not any(m in who for m in match):
            return False
    return True


def fetch_world(world):
    print(f"\n— {world['name']} (dept {world['dept']}) —")
    ids = []
    for term in world["terms"]:
        try:
            found = search_ids(world["dept"], term)
        except Exception as e:
            print(f"  ! search '{term}' failed: {e}")
            continue
        print(f"  search '{term}': {len(found)} candidates")
        ids.extend(found)
        time.sleep(0.2)
    ids = list(dict.fromkeys(ids))

    kept = []
    for i, oid in enumerate(ids, 1):
        if len(kept) >= MAX_KEEP:
            break
        try:
            full = get_json(f"{API}/objects/{oid}")
        except Exception as e:
            print(f"  ! skipped {oid}: {e}")
            continue
        row = {k: full.get(k) for k in KEEP_FIELDS}
        if usable(row, world):
            row["sourceWorld"] = world["name"]
            row["inspires"] = world["inspires"]
            kept.append(row)
        time.sleep(0.2)
        if i % 25 == 0:
            print(f"  ...checked {i}/{len(ids)}, kept {len(kept)}")
    print(f"  ✓ kept {len(kept)} works for {world['name']}")
    return kept


def main():
    out = Path("data")
    out.mkdir(exist_ok=True)
    path = out / "sources.json"

    existing = json.loads(path.read_text()) if path.exists() else []
    have = {e.get("sourceWorld") for e in existing}
    combined = list(existing)

    for world in SOURCE_WORLDS:
        if world["name"] in have:
            print(f"— {world['name']} — already saved, skipping")
            continue
        combined.extend(fetch_world(world))

    path.write_text(json.dumps(combined, indent=2, ensure_ascii=False))
    worlds = sorted({e.get("sourceWorld") for e in combined})
    print(f"\nDone. {len(combined)} source works across: {', '.join(worlds)}")


if __name__ == "__main__":
    main()