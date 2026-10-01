@AGENTS.md

Project docs: see docs/architecture.md before changing structure.
Rules: no hard-coded wedding identity in components; templates use theme CSS variables only;
domain logic in src/core stays framework-free; migrations are append-only.

Rules to follow (read the relevant file before working in that area):
- docs/rules/security.md — secrets, authorization, private data. Every change.
- docs/rules/design.md — colours, colour matching, fonts, writing, motion.
- docs/rules/backend.md — Supabase, migrations, server code.
- docs/rules/ai-features.md — any feature that calls an AI model.
