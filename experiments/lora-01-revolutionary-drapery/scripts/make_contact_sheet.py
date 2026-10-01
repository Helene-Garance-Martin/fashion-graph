from pathlib import Path

from PIL import Image, ImageDraw, ImageOps


BASE_DIR = Path(__file__).resolve().parent.parent
IMAGE_DIR = BASE_DIR / "data" / "images"
OUTPUT_FILE = BASE_DIR / "data" / "contact-sheet.jpg"

THUMBNAIL_SIZE = (300, 300)
COLUMNS = 5
LABEL_HEIGHT = 35


image_paths = sorted(IMAGE_DIR.glob("*.jpg"))

if not image_paths:
    raise RuntimeError("No JPG images found in the dataset.")

rows = (len(image_paths) + COLUMNS - 1) // COLUMNS

sheet_width = COLUMNS * THUMBNAIL_SIZE[0]
sheet_height = rows * (THUMBNAIL_SIZE[1] + LABEL_HEIGHT)

sheet = Image.new("RGB", (sheet_width, sheet_height), "white")
draw = ImageDraw.Draw(sheet)


for index, image_path in enumerate(image_paths):
    with Image.open(image_path) as image:
        image = image.convert("RGB")

        thumbnail = ImageOps.contain(image, THUMBNAIL_SIZE)

        column = index % COLUMNS
        row = index // COLUMNS

        x = column * THUMBNAIL_SIZE[0]
        y = row * (THUMBNAIL_SIZE[1] + LABEL_HEIGHT)

        image_x = x + (THUMBNAIL_SIZE[0] - thumbnail.width) // 2
        image_y = y + (THUMBNAIL_SIZE[1] - thumbnail.height) // 2

        sheet.paste(thumbnail, (image_x, image_y))

        label = image_path.stem
        draw.text(
            (x + 10, y + THUMBNAIL_SIZE[1] + 8),
            label,
            fill="black",
        )


sheet.save(OUTPUT_FILE, quality=90)

print(f"Contact sheet created: {OUTPUT_FILE}")