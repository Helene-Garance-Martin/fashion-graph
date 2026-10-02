from pathlib import Path

import torch
from diffusers import StableDiffusionXLPipeline


MODEL_ID = "stabilityai/stable-diffusion-xl-base-1.0"

BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / "outputs" / "baseline"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


PROMPTS = [
    {
        "name": "body",
        "prompt": (
            "a standing figure wrapped in flowing drapery, "
            "fabric gathered around the body"
        ),
        "seed": 101,
    },
    {
        "name": "cloth",
        "prompt": (
            "loose cloth suspended in space, "
            "deep cascading folds and overlapping volumes"
        ),
        "seed": 202,
    },
    {
        "name": "space",
        "prompt": (
            "an architectural interior enclosed by "
            "elaborate hanging drapery"
        ),
        "seed": 303,
    },
]


print("Loading SDXL Base...")

pipe = StableDiffusionXLPipeline.from_pretrained(
    MODEL_ID,
    torch_dtype=torch.float16,
    variant="fp16",
    use_safetensors=True,
)

pipe.to("cuda")


for item in PROMPTS:
    print(f"Generating: {item['name']}")

    generator = torch.Generator(device="cuda").manual_seed(item["seed"])

    image = pipe(
        prompt=item["prompt"],
        generator=generator,
        num_inference_steps=30,
        guidance_scale=7.0,
        width=1024,
        height=1024,
    ).images[0]

    output_file = OUTPUT_DIR / f"{item['name']}_seed-{item['seed']}.png"
    image.save(output_file)

    print(f"Saved: {output_file}")


print("\nBaseline generation complete.")