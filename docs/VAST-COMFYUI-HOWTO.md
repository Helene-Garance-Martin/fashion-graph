# Running ComfyUI on Vast.ai

A practical field guide for running a temporary ComfyUI / NVIDIA GPU environment on Vast.ai from a Windows laptop.

This procedure was tested successfully on 7 October 2026 using an NVIDIA RTX 3090 with 24 GB VRAM.

The session began with $3.77 Vast credit and ended with $3.64.

**Approximate cost of the session: $0.13.**

The instance cost was approximately $0.155/hour.

---

# Mental model

There are two computers involved.

```text
🏠 WINDOWS LAPTOP
       │
       │ SSH
       ▼
🌍 VAST GPU INSTANCE
       │
       ├── Linux
       ├── Python
       ├── PyTorch / CUDA
       ├── ComfyUI
       └── NVIDIA GPU
```
