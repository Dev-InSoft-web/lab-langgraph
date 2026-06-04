# Mapa de rutas (folderización `src/lib/` 2026-06)

## Core

| Antes (`src/lib/`) | Ahora |
| --- | --- |
| `lab-constants.ts` | `core/lab-constants.ts` |
| `config.ts` | `core/config.ts` |
| `secrets.ts` | `core/secrets.ts` |
| `data-paths.ts` | `core/data-paths.ts` |
| `http.ts` | `core/http.ts` |
| `retry-wait.ts` | `core/retry-wait.ts` |

## Proveedores

| Antes | Ahora |
| --- | --- |
| `groq-api-keys.ts` | `providers/groq/groq-api-keys.ts` |
| `cerebras-*.ts` | `providers/cerebras/` |
| `gemini-*.ts` | `providers/gemini/` |
| `minimax-*.ts` | `providers/minimax/` |
| `openrouter-*.ts` | `providers/openrouter/` |
| `cohere-*.ts` | `providers/cohere/` |
| `deepseek-*.ts` | `providers/deepseek/` |
| `huggingface-*.ts` | `providers/huggingface/` |
| `provider-openai-chat.ts` | `providers/_shared/provider-openai-chat.ts` |

## LLM

| Antes | Ahora |
| --- | --- |
| `chat-llm.ts` | `llm/chat-llm.ts` |
| `llm-route.ts` | **eliminado** (sin referencias en repo) |

## Sin cambio de carpeta

`db/`, `orchestrator/`, `rag/`, `youtube/`, `patyia/`, `media/`.

## Imports en Azure Functions

`../lib/http.js` → `../lib/core/http.js`

## ISA-DOC scripts

`src/lib/secrets.js` → `src/lib/core/secrets.js` en `db-apply-schema`, `index-*-corpus`, `sync-patyia-prompts`.
