import json
import shutil
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent

IMAGE_DIR = BASE_DIR / "data" / "images"
SOURCE_METADATA = BASE_DIR / "data" / "metadata.jsonl"

TRAINING_DIR = BASE_DIR / "training-data"
TRAINING_METADATA = TRAINING_DIR / "metadata.jsonl"


TRAINING_DIR.mkdir(parents=True, exist_ok=True)


records_written = 0

with SOURCE_METADATA.open("r", encoding="utf-8") as source:
    with TRAINING_METADATA.open("w", encoding="utf-8") as destination:

        for line in source:
            record = json.loads(line)

            filename = record["file_name"]
            caption = record["caption"]

            if not caption:
                raise ValueError(
                    f"Missing caption for {filename}. "
                    "All training images must have captions."
                )

            source_image = IMAGE_DIR / filename
            target_image = TRAINING_DIR / filename

            if not source_image.exists():
                raise FileNotFoundError(
                    f"Training image not found: {source_image}"
                )

            shutil.copy2(source_image, target_image)

            training_record = {
                "file_name": filename,
                "prompt": caption,
            }

            destination.write(
                json.dumps(training_record, ensure_ascii=False) + "\n"
            )

            records_written += 1


print(f"Prepared {records_written} training images.")
print(f"Training dataset: {TRAINING_DIR}")