# Description 01 — Met Garments from Description

## Research question

What information about a garment survives when a museum object is translated from image into language and then reconstructed as a generated fashion esquisse?

This experiment investigates the sequence:

**Met object → observational description → generated esquisse**

The generated image model is not given the original museum photograph. It receives only a controlled textual description of the garment together with a fixed illustration grammar.

The purpose is not to recreate the museum object faithfully. Instead, the experiment examines what is preserved, transformed, inferred or invented as visual information passes through language.

---

## Experimental protocol

Each garment follows the same basic procedure.

### 1. Select a source object

Choose a garment from The Metropolitan Museum of Art collection.

Record:

- object title
- object ID
- date
- culture or place, where supplied
- medium or materials
- colour, where explicitly documented
- Met object URL
- image rights or public-domain status

The museum object and its catalogue record remain the authoritative source.

### 2. Produce an observational description

Describe the garment from the source image using controlled, couture-literate language.

The description should prioritise visible characteristics such as:

- garment type
- silhouette and proportion
- neckline
- sleeves
- waist
- skirt or trouser shape
- hem
- visible construction
- drape and folds
- surface and texture
- decoration
- closures and distinctive details

Established garment terminology may be used where appropriate, but specialist vocabulary should be accompanied by a plain visual description.

For example:

> **Balloon sleeve:** a full, rounded sleeve gathered at the upper arm and again near the cuff.

The description should distinguish **observation** from **catalogue information**.

Information such as designer, date, material or construction technique should not be inferred from appearance when it is not visually demonstrable.

### 3. Control the use of colour

**Colour is treated as evidence, not decoration.**

A colour may be specified in the generated description when it is explicitly documented in the Met catalogue record.

If colour is not documented, the experiment should not introduce a precise colour merely as an aesthetic choice.

The same principle applies to materials and named construction techniques.

### 4. Remove the source image

The original Met photograph is not supplied to the image-generation model.

The generation stage therefore receives:

**controlled garment description + fixed esquisse grammar**

rather than:

**original photograph + prompt**

This separation is fundamental to the experiment.

### 5. Apply a fixed illustration grammar

All garments are generated using the same broad visual system so that changes between outputs arise primarily from the garment descriptions rather than from changing illustration styles.

The initial visual grammar is based on the appearance of an **atelier working sheet** rather than a polished fashion photograph:

- economical black ink linework
- generous pale paper ground
- elongated but healthy fashion figure
- clear garment silhouette
- sparse, purposeful contour
- selective hatching and dark fills
- restrained use of documented garment colour
- visible folds and construction details
- adjacent pattern-cutting or construction fragments
- faint technical annotations
- the character of a couturier's working document rather than a finished digital illustration

Pattern pieces and technical marks are part of the fixed visual grammar. They should not be interpreted as evidence of the historical construction of the source garment unless supported by the source material.

### 6. Hold generation settings constant

Where possible, comparison images should use the same:

- base image model
- ComfyUI workflow
- resolution
- sampler
- scheduler
- number of inference steps
- CFG
- seed

Only variables deliberately under investigation should change.

The initial ComfyUI workflow uses SDXL 1.0 with a portrait latent of **832 × 1216**, **DPM++ 2M** sampling with the **Karras** scheduler, **25 steps**, **CFG 7**, and a fixed seed. These settings should be recorded with each generation.

### 7. Record provenance

Each generated esquisse should retain enough information to reconstruct its lineage:

**Met object → source record → observational description → generation prompt → workflow/settings → generated image**

Record:

- Met object ID and URL
- source image rights
- catalogue information used
- observational description
- vision model and version, if applicable
- human edits to the description
- image-generation model and version
- workflow version
- prompt
- negative prompt
- seed
- generation settings
- date generated

Generated images should be identified as research artefacts, for example:

> **Generated esquisse from visual description**

Where displayed alongside the experiment, the source should remain clearly identified:

> **View original at The Met ↗**

---

## Evaluation

The generated esquisse should not be evaluated simply according to whether it is attractive or whether it resembles the source photograph.

Instead, compare the source object, description and generated image to ask:

- Which visible garment characteristics survived translation into language?
- Which characteristics disappeared?
- Which became exaggerated?
- What did the image model invent?
- Did specialist garment vocabulary preserve information better than plain visual description?
- Did catalogue-derived information influence the reconstruction differently from visual observation?
- Where does ambiguity in the description become visual invention?
- Does the fixed illustration grammar introduce its own assumptions?

The discrepancies are evidence rather than failures.

---

## Case studies

### 01 — Madame Celadon

First controlled test of the description-to-esquisse pipeline.

The garment's documented colour will be retained where supported by the Met record, while the generated image will otherwise follow the fixed atelier working-sheet grammar.

Further source details, observational description and generation results will be added during the experiment.

---

## Working principle

The experiment does not ask whether AI can reproduce a museum garment from a photograph.

It asks something narrower:

> **What happens to an object when seeing becomes description, and description becomes image?**

The distance between those representations is the subject of the experiment.
