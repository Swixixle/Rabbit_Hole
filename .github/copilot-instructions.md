This repository is a focused knowledge-reader product.

Rules:
- Preserve the article contract:
  identification → summary → context/content → evidence/trace → questions
- Preserve epistemic behavior:
  confidence = high | medium | low
  support = direct | inference | interpretation | speculation
- Experience layer is additive only
- Share layer is additive only
- Do not redesign the app
- Prefer small, modular changes
- Match existing style and architecture
- When changing CI, detect the real package manager/workspace layout before editing commands
- Do not invent infra or tests that do not exist
- Always explain:
  - files changed
  - behavior changed
  - test commands
  - any remaining manual steps