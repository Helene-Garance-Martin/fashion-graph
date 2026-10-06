from pathlib import Path

import torch
from diffusers import StableDiffusionXLPipeline

MODEL_ID = "stabilityai/stable-diffusion-xl-base-1.0"

LORA_DIR = Path("/workspace/revolutionary-drapery-v1")
OUTPUT_DIR = Path(
    "/workspace/fashion-graph/"
    "experiments/lora-01-revolutionary-drapery/"
    "outputs/checkpoint-comparison"
)

PROBES = {
    "body": {
        "prompt": (
            "a standing figure wrapped in flowing drapery, "
            "fabric gathered around the body"
        ),
        "seed": 101,
    },
    "cloth": {
        "prompt": (
            "loose cloth suspended in space, "
            "deep cascading folds and overlapping volumes"
        ),
        "seed": 202,
    },
    "space": {
        "prompt": (
            "an architectural interior enclosed by "
            "elaborate hanging drapery"
        ),
        "seed": 303,
    },
}

CHECKPOINTS = {
    "100": LORA_DIR / "checkpoint-100.safetensors",
    "300": LORA_DIR / "checkpoint-300.safetensors",
    "500": LORA_DIR / "pytorch_lora_weights.safetensors",
}


def generate_probe(pipe, name, prompt, seed, stage):
    generator = torch.Generator(device="cuda").manual_seed(seed)

    image = pipe(
        prompt=prompt,
        height=1024,
        width=1024,
        num_inference_steps=30,
        guidance_scale=7.0,
        generator=generator,
    ).images[0]

    path = OUTPUT_DIR / f"{name}_{stage}_seed-{seed}.png"
    image.save(path)
    print(f"Saved {path}")


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print("Loading SDXL...")
    pipe = StableDiffusionXLPipeline.from_pretrained(
        MODEL_ID,
        torch_dtype=torch.float16,
        variant="fp16",
        use_safetensors=True,
    ).to("cuda")

    # BASE
    print("\n=== BASE ===")
    for name, probe in PROBES.items():
        generate_probe(
            pipe,
            name,
            probe["prompt"],
            probe["seed"],
            "base",
        )

    # LoRA checkpoints
    for stage, checkpoint in CHECKPOINTS.items():
        print(f"\n=== CHECKPOINT {stage} ===")

        pipe.load_lora_weights(
            checkpoint.parent,
            weight_name=checkpoint.name,
            adapter_name=f"checkpoint_{stage}",
        )
        pipe.set_adapters(f"checkpoint_{stage}", adapter_weights=1.0)

        for name, probe in PROBES.items():
            generate_probe(
                pipe,
                name,
                probe["prompt"],
                probe["seed"],
                stage,
            )

        pipe.delete_adapters(f"checkpoint_{stage}")

    print("\nDone. BASE → 100 → 300 → 500 complete.")


if __name__ == "__main__":
    main()