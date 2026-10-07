# Met Garments from Description

## Research question

**What information about a garment survives when a museum object is translated from image into language and then reconstructed as a generated fashion esquisse?**

This experiment investigates a deliberately lossy sequence:

**Met object → observational description → generated esquisse**

The image-generation model is not given the original museum photograph. It receives only a controlled textual description of the garment together with a fixed illustration grammar.

The purpose is not to reproduce the museum image faithfully. It is to examine what is preserved, transformed, inferred or invented as an object passes from seeing, to language, to image.

---

## Method

### 1. Select a museum object

For each object, record:

- museum and collection
- object title
- object ID
- maker/designer where documented
- date
- culture
- medium
- colour where explicitly documented
- source URL
- rights / public-domain status where available

The museum record remains the provenance anchor for the experiment.

### 2. Produce an observational description

Describe what can reasonably be observed from the source object.

Relevant features may include:

- garment type
- overall silhouette
- neckline
- bodice
- sleeves
- waist
- skirt or trouser construction
- hem
- visible construction
- drape and folds
- texture
- decoration
- closures and other visible details

Where useful, a controlled garment term may be followed by a plain visual description.

Catalogue information and visual observation should remain distinguishable.

### 3. Treat colour as evidence, not decoration

Colour should not be invented merely to improve the generated image.

Where colour is explicitly documented by the museum, it may be passed through as catalogue information.

Where colour is inferred visually from the museum photograph, it should be identified as observation rather than catalogue fact.

The same distinction applies to material and construction.

### 4. Remove the source image

The generation stage does **not** receive the original museum photograph.

The model receives:

- the observational garment description
- a fixed illustration grammar
- controlled generation parameters

This prevents direct image-to-image resemblance from substituting for the experiment.

### 5. Use a fixed illustration grammar

Initial experiments use a fashion-esquisse vocabulary broadly defined by:

- pale paper
- elegant elongated but healthy figure
- economical black ink contour
- loose confident hand-drawn lines
- sparse construction marks
- restrained hatching
- flat areas of garment colour
- atelier working-sheet quality
- exploratory rather than polished
- clearly legible garment silhouette and drape

This grammar may later become a variable in its own right.

### 6. Hold generation settings constant

Where experiments are being directly compared, model, workflow, resolution, sampler, scheduler, CFG, steps and seed should remain fixed unless the variable being tested explicitly requires changing one of them.

Each change should answer a specific research question rather than simply seek a more attractive image.

---

## Provenance record

Each generated specimen should record:

- Met object ID and source
- catalogue information used
- observational description
- positive prompt
- negative prompt
- image model and version
- workflow
- seed
- resolution
- sampler
- scheduler
- steps
- CFG
- denoise
- human edits to the prompt
- generation date
- generated output filename

Generated images should be described as:

> **Generated esquisse from visual description**

Suggested UI wording:

> Created from the observational description above. The image model was not given the original photograph.

Where appropriate:

> View original at The Met ↗

---

## Evaluation

The generated image is not evaluated simply as a successful or unsuccessful reconstruction.

For each specimen, ask:

- What survives?
- What disappears?
- What is exaggerated?
- What is regularised?
- What does the model infer?
- What does the model invent?
- Which words appear to carry substantial prior visual knowledge?
- Which visual characteristics resist linguistic description?

Discrepancies are therefore evidence rather than merely errors.

---

## Case Study 01: Vionnet Negligée

The first case study uses a House of Vionnet / Madeleine Vionnet negligée dated 1932–35.

The first generated specimen is documented in:

`BASE-01.md`

Output:

`outputs/vionnet-base-01.png`

Workflow:

`comfyui/vionnet-workflow-v01.json`

---

## Next controlled experiment

BASE 01 suggests that the garment term **negligée** itself carries substantial semantic information for SDXL.

A useful next experiment is therefore lexical ablation:

**BASE 02: remove the word _negligée_ while preserving the remainder of the observational description and all generation settings.**

The comparison asks:

> How much of the generated garment is reconstructed from explicit visual description, and how much is supplied by the model's prior knowledge of the garment category named by the noun?

Further experiments may investigate:

- museum catalogue description versus human observational description
- controlled garment terminology versus neutral geometric language
- alternative seeds after lexical effects have been isolated
- ceramics-derived visual grammar
- trained or adapted esquisse models
- relationships between generated outputs and the wider Twining the Codex provenance graph

---

## Working principle

> **What happens to an object when seeing becomes description, and description becomes image?**
