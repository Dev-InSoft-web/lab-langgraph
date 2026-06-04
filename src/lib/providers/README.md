# providers

Un subdirectorio por proveedor. Rotación de keys vía **orquestador PG** (`orchestrator/`); modelos fijos en `core/lab-constants.ts`.

| Carpeta | Archivos típicos |
| --- | --- |
| `groq/` | `groq-api-keys.ts` (+ `keySuffix` reutilizado) |
| `cerebras/` | api-keys, config, sdk |
| `gemini/` | api-keys, config, client, probes, rate-limit |
| `minimax/` | config, models-catalog |
| `openrouter/` | api-keys, config |
| `cohere/` | api-keys, config, client |
| `deepseek/` | api-keys, config |
| `huggingface/` | api-keys, config (embeddings RAG) |
| `_shared/` | `provider-openai-chat.ts` |

Inventario manual: `testing/<proveedor>/test-all-models.mts`.
