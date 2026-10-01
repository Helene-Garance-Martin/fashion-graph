import json
from pathlib import Path
from urllib.request import urlopen, urlretrieve


OBJECT_IDS = [
    250705,
    733639,
    247499,
    251273,
    449475,
    250208,
    733660,
    245839,
    248899,
    86864,
    104915,
    84317,
    170705,
    107926,
    137682,
    137702,
    254766,
    376657,
    362150,
    759755,
]


BASE_DIR = Path(__file__).resolve().parent.parent
IMAGE_DIR = BASE_DIR / "data" / "images"
METADATA_FILE = BASE_DIR / "data" / "metadata.jsonl"

IMAGE_DIR.mkdir(parents=True, exist_ok=True)

if METADATA_FILE.exists():
    METADATA_FILE.unlink()



def get_met_object(object_id):
    url = (
        "https://collectionapi.metmuseum.org/public/collection/v1/"
        f"objects/{object_id}"
    )

    with urlopen(url) as response:
        return json.load(response)


for index, object_id in enumerate(OBJECT_IDS, start=1):
    print(f"[{index:02}/20] Fetching Met object {object_id}...")

    obj = get_met_object(object_id)

    if not obj.get("isPublicDomain"):
        print("   SKIPPED: not Public Domain")
        continue

    image_url = obj.get("primaryImage")

    if not image_url:
        print("   SKIPPED: no primary image")
        continue

    filename = f"{index:03}_{object_id}.jpg"
    destination = IMAGE_DIR / filename

    urlretrieve(image_url, destination)

    record = {
        "file_name": filename,
        "met_object_id": object_id,
        "title": obj.get("title"),
        "object_date": obj.get("objectDate"),
        "culture": obj.get("culture"),
        "medium": obj.get("medium"),
        "department": obj.get("department"),
        "public_domain": obj.get("isPublicDomain"),
        "object_url": obj.get("objectURL"),
        "image_url": image_url,
        "caption": "",
    }

    with METADATA_FILE.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")

    print(f"   Saved {filename}")


print("\nDataset build complete.")