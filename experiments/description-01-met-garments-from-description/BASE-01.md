# BASE 01 — Vionnet Negligée

## Status

**Baseline specimen**

Generated: 7 October 2026

Output:

`outputs/vionnet-base-01.png`

Workflow:

`comfyui/vionnet-workflow-v01.json`

---

## Source object

**House of Vionnet / Madeleine Vionnet**  
**Negligée**  
1932–35  
French  
Silk  
The Metropolitan Museum of Art  
Object ID: 85284

Source:
https://www.metmuseum.org/art/collection/search/85284

The catalogue identifies the garment as a negligée and its material as silk.

The salmon / peach / cream colour description used in this experiment derives from visual observation of the museum photograph rather than a precise catalogue colour designation.

---

## Experimental sequence

**Met object → observational description → SDXL → generated esquisse**

The original museum photograph was **not supplied to SDXL**.

The model received only the textual prompt below.

---

## Positive prompt

> A full-length woman's silk negligée with a long fluid skirt and a softly wrapped bodice. The upper garment is muted warm salmon pink, gathered around a deep V neckline and crossing softly over the torso. Very full loose sleeves fall from the shoulders and narrow into broad pale peach-cream cuffs. A wide wrapped sash encircles the waist, tied loosely at the front with long hanging ends. The floor-length skirt is pale peach-cream, falling in long soft folds. Fashion design esquisse on pale paper, elegant elongated but healthy figure, economical black ink contour, loose confident hand-drawn lines, sparse construction marks, restrained hatching, flat areas of garment colour, atelier working-sheet quality, exploratory rather than polished, garment silhouette and drape clearly legible.

---

## Negative prompt

> lowres, blurry, out of focus, deformed, bad anatomy, extra limbs, mutated hands, watermark, text, logo, signature, oversaturated

---

## Generation settings

| Setting        | Value                          |
| -------------- | ------------------------------ |
| Model          | SDXL Base 1.0                  |
| Checkpoint     | `sd_xl_base_1.0.safetensors`   |
| Resolution     | 832 × 1216                     |
| Batch size     | 1                              |
| Seed           | `812045847300606`              |
| Seed behaviour | fixed                          |
| Steps          | 25                             |
| CFG            | 7                              |
| Sampler        | `dpmpp_2m`                     |
| Scheduler      | `karras`                       |
| Denoise        | 1                              |
| Interface      | ComfyUI                        |
| GPU            | NVIDIA GeForce RTX 3090, 24 GB |
| Environment    | Vast.ai GPU instance           |

No LoRA was applied.

No source image was supplied to the generation model.

---

## Initial reading

BASE 01 preserves a surprising amount of the described garment.

### What survives

The generated image retains:

- the warm salmon / pale peach-cream palette
- a long full-length silhouette
- a crossed or wrapped bodice
- a deep neckline
- very full sleeves
- narrower contrasting cuffs
- a strongly defined wrapped waist
- long vertical folds and an overall impression of fluid fabric

The resulting garment remains visually legible and broadly consistent with the described garment category.

### What changes

The model regularises the garment into a more conventional historical fashion-illustration vocabulary.

In particular:

- the waist becomes more structured and emphatic
- the generated silhouette suggests a more conventional historical dress
- the skirt acquires a stronger overskirt / underskirt organisation
- the image is more polished and romanticised than the requested atelier working sheet
- the drawing contains less exploratory construction information than requested

The generated image therefore does not simply reproduce the description. It reconciles the description with visual conventions already encoded by SDXL.

---

## Lexical observation: “negligée”

The word **negligée** may be doing substantial work.

It is not a neutral label. It carries learned associations concerning garment type, looseness, intimacy, fabric behaviour, historical fashion and silhouette.

BASE 01 therefore should not be described as reconstruction from geometric description alone.

It is more accurately:

**explicit visual description + garment vocabulary + model prior knowledge**

This becomes a testable variable.

---

## Proposed BASE 02

Repeat BASE 01 with:

- the same model
- the same seed
- the same workflow
- the same resolution
- the same sampler and scheduler
- the same generation parameters
- the same description wherever possible

but replace or remove the word **negligée** with neutral language.

For example, the opening might become:

> A full-length woman's silk garment with a long fluid skirt and a softly wrapped bodice...

The comparison asks:

> **How much did the noun know?**

If substantial structural characteristics change despite all other variables remaining fixed, the difference provides evidence for the semantic contribution of garment terminology.

---

## Curatorial note

The aim is not to judge BASE 01 solely by resemblance.

Its deviations are part of the research evidence.

The experiment exposes the interaction between:

1. the museum object
2. human visual observation
3. language
4. model priors
5. generative reconstruction

BASE 01 is therefore retained unchanged as the baseline specimen.
