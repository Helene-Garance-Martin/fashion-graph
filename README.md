# Twinning the Codex

**Twinning the Codex** is an interactive cultural-data exploration project that traces relationships between fashion designers, garments, historical source material and recurring visual concepts.

Built from Metropolitan Museum of Art collection data, the project uses a graph model to make connections explorable rather than flattening them into a conventional catalogue.

## Explore the collection

The interface can be entered through three different kinds of node:

- **Fashion houses** — Balenciaga, Chanel, Charles James, Grès, Lanvin, McCardell, Schiaparelli and Vionnet
- **Source worlds** — Ancient Greek sculpture, Japanese kimono and Spanish painting
- **Concepts** — including drape, fragment, pleat, twine, veil and bias cut

The graph progressively reveals related garments and artworks, while the Curator panel provides object information and supports building saved exhibition selections.

## Why a graph?

Fashion history is rarely linear.

A graph makes it possible to represent different kinds of relationships explicitly:

```text
Designer ── CREATED ──> Garment

Artwork ── EXAMPLE_OF ──> SourceWorld
SourceWorld ── INSPIRED ──> Designer

Artwork ── HAS_CONCEPT ──> Concept
Garment ── HAS_CONCEPT ──> Concept
```
