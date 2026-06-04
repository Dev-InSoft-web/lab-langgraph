# Estructura `src/lib/`

## Convenciones

- **`core/`** — sin dependencias de `providers/` (salvo tipos en `orchestrator/types` referenciados desde `lab-constants`).
- **`providers/<nombre>/`** — un proveedor por carpeta; `keySuffix` compartido vía `providers/groq/groq-api-keys.ts`.
- **`providers/_shared/`** — cliente OpenAI-compatible (`provider-openai-chat.ts`) usado por OpenRouter y DeepSeek tests.
- **`llm/`** — fachada LangChain; elige Groq o Cerebras según env.
- Dominios **`rag`**, **`youtube`**, **`patyia`**, **`orchestrator`** — imports hacia `core/` y `providers/`, no al revés.

## Añadir un proveedor

1. Carpeta `providers/foo/` con `foo-api-keys.ts`, `foo-config.ts` (usa `core/lab-constants` `API_BASE` / `DEFAULT_MODEL`).
2. Registrar slots en `orchestrator/registry.ts` y tipos en `orchestrator/types.ts`.
3. Tests en `testing/foo/test-all-models.mts`.
4. Entrada en `docs/MIGRATION-MAP.md` si aplica.
