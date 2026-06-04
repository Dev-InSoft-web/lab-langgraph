# Separación backend (lab-langgraph) / front (ISA-DOC)

## lab-langgraph (backend)

Todo lo persistente para APIs, agente y RAG vive aquí:

| Ruta | Contenido |
|------|-----------|
| `data/api-catalog.json` | Manifiesto Postman (hosts, envs, endpoints) |
| `data/postman/` | Fuente cruda para regenerar catálogo |
| `data/patyia/prompts/catalog/` | Markdown Ultra → sync a PG |
| `data/vectorize/` | Corpus YouTube / gobierno |
| `data/patyia/caches/` | Caches conversaciones / identidades |
| `data/bitacora/revisado.json` | Estado bitácora |
| `data/openai-storage/` | Mirror OpenAI (opcional, grande) |
| `data/clientesis-schema/` | Árbol tablas/columnas documentación |
| `data/codegen/`, `data/sql/` | Artefactos SQL/codegen |
| `secrets/` | Tokens, API keys, `lab-connections.env` |
| `local.settings.json` | `DATABASE_URL` (ops), `RAG_DATABASE_URL` (rag), API keys |
| PostgreSQL ops | `paty.*`, `lab.*` — conversaciones, orquestador, catálogo |
| PostgreSQL rag | `rag.*` — solo embeddings / indexación |

Runtime **no** lee `ISA-DOC`.

## ISA-DOC (front)

- Astro/Svelte, documentación, UI Postman (lectura vía lab en static).
- Variable de build: `PUBLIC_LAB_LANGGRAPH_URL`.
- gh-pages: `npm run build:gh-pages` con URL del lab desplegado.

## Flujo static web

1. Build ISA-DOC con `PUBLIC_LAB_LANGGRAPH_URL=https://…`
2. Postman panel llama `GET /api/agent/postman-ui?project=…`
3. Agente / tareas: `POST /api/agent/task`
4. Persistencia JSON: `GET/PUT /api/persistence/{path}`, `GET/POST /api/revisado`

Inventario completo: `docs/PERSISTENCE-INVENTORY.md`.

## Comandos de sincronización

```bash
# Desde ISA-DOC (una vez o cuando cambie Postman/prompts en el monorepo)
cd lab-langgraph
npm run data:migrate-from-isa
npm run catalog:build
npm run catalog:sync-pg   # opcional
```
