# `src/lib/` — runtime lang-lab

| Carpeta | Rol |
| --- | --- |
| `core/` | Config, secretos, constantes, HTTP, retry, rutas `data/` |
| `providers/` | API keys, config y clientes por proveedor (Groq, Gemini, …) |
| `llm/` | LangChain chat (`createChatLlm`) |
| `orchestrator/` | Slots PG, leases, cascada proofread/whisper |
| `db/` | Pool PostgreSQL |
| `rag/` | PGVector, PDF, corpus YouTube/web |
| `youtube/` | Whisper, proofread LangGraph |
| `patyia/` | Conversación, prompts, agents |
| `media/` | PNG indexados |
| `docs/` | Mapas para sesiones futuras |

Modelos y URLs de API: `core/lab-constants.ts` (no `local.settings.json`).

Rutas antiguas: `docs/MIGRATION-MAP.md`.
