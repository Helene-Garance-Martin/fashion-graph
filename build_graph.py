"""
build_graph.py — the visual view: turn objects.json into a graph you can see.

Garments with a Met photo appear as circular thumbnails ringed in their house's
colour; the rest appear as small coloured dots. Clicking ANY garment opens its
official page on the Met's website in a new tab (photos live there, correctly
attributed — we link rather than embed).

    (Designer)-[:CREATED]->(Garment)-[:MADE_IN]->(Year)
                           (Garment)-[:OF_TYPE]->(Category)
    (Designer)-[:FROM]->(Country)

Run:
    pip install pyvis
    python build_graph.py
Then download graph.html and open it in any browser.
"""

import json
from pathlib import Path
from pyvis.network import Network

PALETTE = {
    "Vionnet":       "#d98a8a",   # rose
    "Grès":          "#7fa8c9",   # slate blue
    "Chanel":        "#c9b98a",   # champagne
    "Lanvin":        "#6f7fd9",   # Lanvin blue
    "McCardell":     "#9caf88",   # sage — American sportswear, practical
    "Charles James": "#9a7fae",   # aubergine — sculptural drama
    "Schiaparelli":  "#e368a6",   # shocking pink, of course
    "Balenciaga":    "#9a4b57",   # garnet — Spanish drama, master of black
}
RING = {
    "Vionnet":       "#f0c4c4",
    "Grès":          "#bcd8e8",
    "Chanel":        "#e8dcc0",
    "Lanvin":        "#b3bcf0",
    "McCardell":     "#c9d6bb",
    "Charles James": "#c6b4d6",
    "Schiaparelli":  "#f4b0d3",
    "Balenciaga":    "#cfa1ab",
}
WINDOWS = {
    "Vionnet": (1912, 1939), "Grès": (1934, 1988), "Lanvin": (1909, 1946),
    "Chanel": (1913, 1971), "Schiaparelli": (1927, 1954),
    "McCardell": (1931, 1958), "Charles James": (1928, 1958),
    "Balenciaga": (1937, 1968),
}

def in_window(designer, year):
    w = WINDOWS.get(designer)
    if w is None:
        return True
    if not isinstance(year, int) or year <= 0:
        return False
    return w[0] <= year <= w[1]

YEAR_COLOR = "#8a8a8a"
CATEGORY_COLOR = "#b0a0c0"
COUNTRY_COLOR = "#89b0a0"

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


def build_network(objects):
    net = Network(height="800px", width="100%", bgcolor="#14141a",
                  font_color="#e8e6e0", directed=True, cdn_resources="in_line")
    net.set_options('''
    {
      "layout": { "improvedLayout": false },
      "edges": { "smooth": false },
      "interaction": { "hideEdgesOnDrag": true, "tooltipDelay": 120 },
      "physics": {
        "solver": "barnesHut",
        "barnesHut": { "gravitationalConstant": -8000, "centralGravity": 0.3, "springLength": 120 },
        "stabilization": { "enabled": true, "iterations": 150, "fit": true },
        "minVelocity": 0.75
      }
    }
    ''')

    added = set()

    def node(nid, label, color, size, **kw):
        if nid not in added:
            net.add_node(nid, label=label, color=color, size=size, **kw)
            added.add(nid)

    with_photo = 0
    rendered = 0
    houses = []
    for obj in objects:
        designer = obj.get("designer") or obj.get("artistDisplayName") or "Unknown"
        color = PALETTE.get(designer, "#cccccc")

        if not in_window(designer, obj.get("objectBeginDate")):
            continue
        rendered += 1
        if designer not in houses:
            houses.append(designer)

        d_id = f"designer::{designer}"
        node(d_id, designer, color, 40)

        g_id = f"garment::{obj['objectID']}"
        couturier = obj.get("artistDisplayName") or designer
        tip = (f"{couturier}\n"
               f"{obj.get('title') or 'Untitled'} — {obj.get('objectDate') or ''}"
               f"\n{obj.get('medium') or ''}\n(click to view at the Met)")
        url = (obj.get("objectURL") or "").strip()
        image = (obj.get("primaryImageSmall") or "").strip()
        if g_id not in added:
            # label=" " (a space) keeps the node clean; an empty label would
            # make pyvis fall back to showing the node id.
            if image:
                with_photo += 1
                net.add_node(g_id, label=" ", shape="circularImage", image=image,
                             color=color, size=22, borderWidth=3, title=tip, url=url)
            else:
                ring = RING.get(designer, "#e8e6e0")
                net.add_node(g_id, label=" ", shape="dot", size=8,
                             borderWidth=2.5,
                             color={"background": color, "border": ring},
                             title=tip, url=url)
            added.add(g_id)
        net.add_edge(d_id, g_id, color="#3a3a45")

        year = obj.get("objectBeginDate")
        if year and year > 0:
            y_id = f"year::{year}"
            node(y_id, str(year), YEAR_COLOR, 16)
            net.add_edge(g_id, y_id, color="#2f2f38")

        cat = category_of(obj)
        c_id = f"cat::{cat}"
        node(c_id, cat, CATEGORY_COLOR, 18)
        net.add_edge(g_id, c_id, color="#2f2f38")

        nat = (obj.get("artistNationality") or "").strip()
        if nat:
            n_id = f"country::{nat}"
            node(n_id, nat, COUNTRY_COLOR, 20)
            net.add_edge(d_id, n_id, color="#3a3a45")

    return net, with_photo, rendered, houses


# --- click-to-open handler, injected into the generated page -----------------
ANCHOR = "network = new vis.Network(container, data, options);"

CLICK_JS = ANCHOR + """

                  // open a garment's Met page when clicked
                  network.on("click", function(params) {
                    if (params.nodes.length > 0) {
                      var clicked = nodes.get(params.nodes[0]);
                      if (clicked && clicked.url) {
                        window.open(clicked.url, "_blank");
                      }
                    }
                  });
                  network.on("hoverNode", function(params) {
                    var n = nodes.get(params.node);
                    document.body.style.cursor = (n && n.url) ? "pointer" : "default";
                  });
                  network.on("blurNode", function() {
                    document.body.style.cursor = "default";
                  });
"""

def legend_html(houses):
    order = [h for h in PALETTE if h in houses]
    dots = "&nbsp; ".join(
        f'<span style="color:{PALETTE[h]};">&#9679;</span> {h}' for h in order
    )
    n = len(order)
    return f'''
<div style="position:fixed;top:16px;left:16px;z-index:999;
     font-family:Georgia,serif;color:#e8e6e0;background:rgba(20,20,26,0.75);
     padding:14px 18px;border-radius:10px;line-height:1.9;font-size:14px;max-width:360px;">
  <div style="font-size:16px;margin-bottom:6px;">A graph of {n} couture houses</div>
  <div>{dots}</div>
  <div style="opacity:0.7;margin-top:6px;">Click any garment to view it at The Met</div>
</div>
</body>
'''


def main():
    objects = json.loads(Path("data/objects.json").read_text())
    net, with_photo, rendered, houses = build_network(objects)
    net.save_graph("graph.html")

    # Inject the click handler and the legend into the generated file.
    html = Path("graph.html").read_text()
    assert ANCHOR in html, "anchor not found in generated html"
    html = html.replace(ANCHOR, CLICK_JS, 1)
    html = html.replace("</body>", legend_html(houses), 1)
    Path("graph.html").write_text(html)

    print(f"Built graph.html: {rendered} garments in founder-era scope "
          f"(of {len(objects)} fetched); {with_photo} photos, rest dots.")
    print("Every garment now clicks through to its page at the Met.")


if __name__ == "__main__":
    main()