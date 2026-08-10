Fashion Knowledge Graph — Design Notes
Premise

A navigable graph of canonical couture that maps not just what each house made, but where it came from — the art movements, historical periods, and construction philosophies that fed each designer's work. Built from The Met's open collection API, modelled in Neo4j.

The through-line: take latent structure (a museum's collection) and make it legible, navigable, and beautiful — designers, garments, and the source-worlds behind them.

The seven houses

Each house is scoped to its founder's operative years only — a deliberate curatorial decision. We are mapping founders' voices, not a house's whole afterlife, so successor creative directors (Lagerfeld at Chanel, Elbaz at Lanvin, and the like) fall outside the window by date.

House	Founder window	Source-world(s)	Relationship
Vionnet	1912–1939	Ancient Greek sculpture; Japanese kimono	INSPIRED
Grès	1934–1988	Ancient Greek sculpture	INSPIRED
Lanvin	1909–1946	Medieval art & illuminated manuscripts	INSPIRED
Chanel	1913–1971	Modernism (menswear, function)	INSPIRED; RIVAL_OF Schiaparelli
Schiaparelli	1927–1954	Dalí, Cocteau, Surrealism/Dada	COLLABORATED_WITH
McCardell	1931–1958	Vionnet (directly); American function/workwear	INSPIRED (designer → designer)
Charles James	1928–1958	Architecture & sculptural form	INSPIRED
Balenciaga	1937–1968	Spanish painting (El Greco, Velázquez, Goya); Spanish dress	INSPIRED (incl. ← Vionnet)
Two kinds of influence

The graph deliberately distinguishes how a designer relates to a source:

INSPIRED — reaching back into history (Vionnet ← Greek sculpture). One-directional, across time. Also designer → designer (Vionnet → McCardell).
COLLABORATED_WITH — reaching across to living contemporaries (Schiaparelli ↔ Dalí, Cocteau). Structurally distinct: a living creative exchange, not reverence for the dead.
RIVAL_OF — lateral tension between contemporaries (Chanel ↔ Schiaparelli).

Most houses root downward into the past; Schiaparelli roots outward into her own avant-garde. That contrast is a feature, not a footnote — it's why the graph needs more than one kind of influence edge.

Relationship vocabulary
(Designer)-[:CREATED]->(Garment)
(Garment)-[:MADE_IN]->(Year)
(Garment)-[:OF_TYPE]->(Category)
(Designer)-[:FROM]->(Country)
(Source)-[:INSPIRED]->(Designer)        // and (Designer)-[:INSPIRED]->(Designer)
(Artist)-[:COLLABORATED_WITH]->(Designer)
(Designer)-[:RIVAL_OF]->(Designer)
The all-overlapped window

The one stretch when the whole roster was working at once. Among the Paris and American houses that's 1934–1939 (Grès opens 1934; Vionnet and Chanel both close 1939). Add Balenciaga — who opens his Paris house in 1937 — and the window when all eight coincide tightens to 1937–1939: the last Parisian breath before the war scattered them. Too thin to use as the standing filter (it would gut the Americans' post-war peak), so it's kept as a spotlight query — "the moment they all overlapped" — switched on over the founder-era graph rather than replacing it.

Beyond the eight (a forward path)

Balenciaga is not only a source-drinker but a trunk: his atelier trained the next generation — Givenchy, Courrèges, Ungaro. So the natural future extension is forward in time, branching from Balenciaga, as a counterpoint to the current graph's reach backward into source-worlds. Noted here, not built yet.

Scoping: raw vs. curated
Ingestion is faithful. fetch_met.py pulls everything the Met attributes to each house, unfiltered, into data/objects.json. The raw data stays complete and rebuildable.
Scoping is a modelling decision. The founder-era windows are applied at load time (load_neo4j.py), so the curatorial cut is explicit, documented, and reversible — never baked destructively into the data. Change a window, reload, and the graph re-scopes.
Images & rights
Source-worlds are open-access. Antiquity, kimono, and medieval works are public-domain (CC0) at The Met — full-resolution images, free, no permission. The sources half of the graph can be richly illustrated today.
20th-century couture is rights-reserved. The Met withholds image URLs for these, so we link out to each garment's Met page. Embedding the photographs awaits permission (request drafted to image.licensing@metmuseum.org).
Surrealist artworks (Dalí, Man Ray) are in copyright too — so Schiaparelli's collaborators are modelled as connections, not embedded images.
Stack

Met Museum Open API → Python (fetch, model) → Neo4j (local) → pyvis → (Phase 2) a bespoke React / D3 front-end: the experience layer.