"""
fetch_met.py — Step 1 of the fashion knowledge graph.

Pulls fashion/costume objects for our anchor designers from the Met Museum's
open API (no key, no signup) and saves them as clean JSON, ready for Neo4j.

Now with:
  - polite retries, so if the Met says "slow down" (a 403) we wait and try again
  - a browser-like identity, which the Met's firewall is happier with
  - resume: designers you've already saved are skipped, not re-fetched

Run it:  python fetch_met.py
Output:  ./data/<designer>.json  and  ./data/objects.json (all combined)
"""

import json
import time
import urllib.parse
import urllib.request
import urllib.error
from pathlib import Path

API = "https://collectionapi.metmuseum.org/public/collection/v1"
COSTUME_INSTITUTE = 8  # department id

# Look like a normal browser. Part of what triggered the 403s was that the
# old User-Agent ("fashion-graph/0.1") looked like a bot to the Met's firewall.
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
      "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36")

DESIGNERS = {
    "Vionnet": ["Vionnet"],
    "Grès":    ["Grès", "Alix"],   # "Madame Grès (Alix Barton)"
    "Chanel":  ["Chanel"],         # person + "House of Chanel"
    "Lanvin":  ["Lanvin"],         # Jeanne Lanvin + "House of Lanvin"
}

KEEP = [
    "objectID", "title", "artistDisplayName", "artistNationality",
    "objectDate", "objectBeginDate", "objectEndDate",
    "classification", "medium", "department", "culture",
    "primaryImageSmall", "objectURL",
]


def get_json(url, max_retries=6):
    """Fetch JSON, backing off politely if the Met asks us to slow down."""
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
            # 403/429 = "slow down"; 5xx = server hiccup -> wait and retry.
            if attempt < max_retries and code in (403, 429, 500, 502, 503, None):
                print(f"    (Met said wait — pausing {delay:.0f}s, try {attempt})")
                time.sleep(delay)
                delay *= 2  # 2s, 4s, 8s, 16s...
                continue
            raise


def search_ids(term):
    """Object IDs in the Costume Institute whose *artist* matches the term."""
    q = urllib.parse.urlencode({
        "departmentId": COSTUME_INSTITUTE,
        "artistOrCulture": "true",  # search the artist field -> fewer, cleaner hits
        "q": term,
    })
    data = get_json(f"{API}/search?{q}")
    return data.get("objectIDs") or []


def fetch_object(object_id):
    full = get_json(f"{API}/objects/{object_id}")
    return {k: full.get(k) for k in KEEP}


def matches(obj, needles):
    name = (obj.get("artistDisplayName") or "").lower()
    return any(n.lower() in name for n in needles)


def main():
    out = Path("data")
    out.mkdir(exist_ok=True)
    combined = []

    for designer, needles in DESIGNERS.items():
        target = out / f"{designer}.json"

        # Resume: already saved this designer? Don't fetch them again.
        if target.exists():
            existing = json.loads(target.read_text())
            if existing:
                print(f"— {designer} — already saved ({len(existing)}), skipping")
                combined.extend(existing)
                continue

        print(f"\n— {designer} —")
        ids = []
        for term in needles:
            try:
                found = search_ids(term)
            except Exception as e:
                print(f"  ! search '{term}' failed after retries: {e}")
                continue
            print(f"  search '{term}': {len(found)} candidate objects")
            ids.extend(found)
        ids = list(dict.fromkeys(ids))  # de-dupe, keep order

        kept = []
        for i, oid in enumerate(ids, 1):
            try:
                obj = fetch_object(oid)
            except Exception as e:
                print(f"  ! skipped {oid}: {e}")
                continue
            if matches(obj, needles):
                obj["designer"] = designer
                kept.append(obj)
            time.sleep(0.2)  # gentle pace so we stay welcome
            if i % 25 == 0:
                print(f"  ...checked {i}/{len(ids)}")

        print(f"  ✓ kept {len(kept)} garments credited to {designer}")
        target.write_text(json.dumps(kept, indent=2, ensure_ascii=False))
        combined.extend(kept)

    (out / "objects.json").write_text(
        json.dumps(combined, indent=2, ensure_ascii=False)
    )
    print(f"\nDone. {len(combined)} garments saved to data/objects.json")


if __name__ == "__main__":
    main()
