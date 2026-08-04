"""
build_graph.py — Step 2 (quick view): turn objects.json into a graph you can see.

Reads data/objects.json (from fetch_met.py) and builds a browsable HTML graph:
    (Designer)-[:CREATED]->(Garment)-[:MADE_IN]->(Year)
                           (Garment)-[:OF_TYPE]->(Category)
    (Designer)-[:FROM]->(Country)

Run:
    pip install pyvis
    python build_graph.py

Then open graph.html (see the message for how).
"""

import json
from pathlib import Path
from pyvis.network import Network

# One colour per designer, so each becomes its own constellation.
PALETTE = {
    "Vionnet": "#d98a8a",   # rose
    "Grès":    "#7fa8c9",   # slate blue
    "Chanel":  "#c9b98a",   # champagne
    "Lanvin":  "#6f7fd9",   # a nod to Lanvin blue
}
YEAR_COLOR = "#8a8a8a"
CATEGORY_COLOR = "#b0a0c0"
COUNTRY_COLOR = "#89b0a0"

# The Costume Institute often leaves 'classification' blank, so if it's empty
# we read the garment type out of the title instead.
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


def main():
    objects = json.loads(Path("data/objects.json").read_text())

    net = Network(height="800px", width="100%", bgcolor="#14141a",
                  font_color="#e8e6e0", directed=True, cdn_resources="in_line")
    net.barnes_hut(gravity=-8000, central_gravity=0.3, spring_length=120)

    added = set()

    def node(nid, label, color, size, title=None):
        if nid not in added:
            net.add_node(nid, label=label, color=color, size=size,
                         title=title or label)
            added.add(nid)

    counts = {"designer": 0, "garment": 0, "year": 0, "category": 0, "country": 0}

    for obj in objects:
        designer = obj.get("designer") or obj.get("artistDisplayName") or "Unknown"
        color = PALETTE.get(designer, "#cccccc")

        d_id = f"designer::{designer}"
        if d_id not in added:
            counts["designer"] += 1
        node(d_id, designer, color, 40)

        g_id = f"garment::{obj['objectID']}"
        tip = (f"{obj.get('title') or 'Untitled'} — {obj.get('objectDate') or ''}"
               f"\n{obj.get('medium') or ''}")
        if g_id not in added:
            counts["garment"] += 1
        node(g_id, obj.get("title") or "", color, 8, title=tip)
        net.add_edge(d_id, g_id, color="#3a3a45")

        year = obj.get("objectBeginDate")
        if year and year > 0:
            y_id = f"year::{year}"
            if y_id not in added:
                counts["year"] += 1
            node(y_id, str(year), YEAR_COLOR, 16)
            net.add_edge(g_id, y_id, color="#2f2f38")

        cat = category_of(obj)
        c_id = f"cat::{cat}"
        if c_id not in added:
            counts["category"] += 1
        node(c_id, cat, CATEGORY_COLOR, 18)
        net.add_edge(g_id, c_id, color="#2f2f38")

        nat = (obj.get("artistNationality") or "").strip()
        if nat:
            n_id = f"country::{nat}"
            if n_id not in added:
                counts["country"] += 1
            node(n_id, nat, COUNTRY_COLOR, 20)
            net.add_edge(d_id, n_id, color="#3a3a45")

    net.save_graph("graph.html")
    print(f"Built graph.html from {len(objects)} garments.")
    print("Nodes:", ", ".join(f"{v} {k}" for k, v in counts.items()))


if __name__ == "__main__":
    main()