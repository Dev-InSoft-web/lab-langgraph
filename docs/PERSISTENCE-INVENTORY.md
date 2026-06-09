# Inventario de persistencia (ISA-DOC → lab-langgraph)

## Migrado a `lab-langgraph/data/` (backend)

| Origen ISA-DOC | Destino lab | API lab |
|----------------|-------------|---------|
| `data/postman/` | `data/postman/` | `GET /api/agent/postman-ui` |
| `data/langlab/*.json` caches | `data/langlab/caches/` | `GET/PUT /api/persistence/...` |
| `data/revisado.json` | `data/bitacora/revisado.json` | `GET/PUT /api/persistence/bitacora/revisado` |
| `data/openai-storage/` | `data/openai-storage/` | `GET/PUT` (metadatos JSON; archivos vía path) |
| Prompts `.md` | `data/langlab/prompts/catalog/` | sync → PostgreSQL |
| `data/api-catalog.json` | generado | `GET /api/agent/manifest` |
| `public/data/clientesis/` | `data/clientesis-schema/` | inventario (futuro API schema) |
| `public/data/codegen/` | `data/codegen/` | inventario |
| `public/data/sql/*.sql` | `data/sql/` | inventario |

## Permanece solo en ISA-DOC (front / estático)

| Ruta | Motivo |
|------|--------|
| `public/static-api/` | Snapshots para gh-pages (generados; lectura) |
| `public/content/docs/` | Contenido Astro |
| `public/assets/` | Estáticos UI |
| `src/` código Svelte | Front |

## Secrets (nunca en git)

| Antes | Ahora |
|-------|-------|
| `ISA-DOC/secrets/` | `lab-langgraph/secrets/` + `local.settings.json` |
| ISA-DOC solo `lab-client.env` → `PUBLIC_LAB_LANGGRAPH_URL` |

## Pendiente mover lógica (no solo JSON)

| Funcionalidad | Hoy | Objetivo |
|---------------|-----|----------|
| `GET /api/patyia/conversaciones` | Astro + SQL Paty | lab Function |
| OpenAI files backup | Astro routes | lab Function |
| Tables/codegen editor | Astro + `public/data` | lab API o solo static export |

## Comandos

```bash
cd lab-langgraph
npm run data:migrate-from-isa              # copia todo lo migrable
npm run data:migrate-from-isa -- --openai  # incluye openai-storage (lento)
npm run catalog:build
```
