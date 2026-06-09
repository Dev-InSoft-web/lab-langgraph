# lab-langgraph · FitDocs RAG (TypeScript)

Réplica del flujo del tutorial [FitDocs IA](https://www.youtube.com/watch?v=0G2kLZeFHbc) (Streamlit + LangChain + RAG), portada a **Azure Functions v4** + **LangChain.js** + **PGVector** sobre PostgreSQL en Render.

## Requisitos

- Node.js 20+
- [Azure Functions Core Tools v4](https://learn.microsoft.com/azure/azure-functions/functions-run-local) (instalación global, no va en `npm install`)
- `GROQ_API_KEY`, `GROQ_API_KEY_2` (chat / proofread / Whisper) y `HUGGINGFACE_API_KEY` (embeddings)
- `MINIMAX_API_KEY` (opcional, slot 3/3 para Whisper STT y proofread; misma variable en ISA-DOC)
- PostgreSQL con extensión `vector` (Render). **Solo PG** — sin SQL Server (ver `docs/db-migration.md`)

## Configuración local

1. Copia credenciales:
   ```bash
   copy local.settings.json.example local.settings.json
   ```
2. Rellena keys en `local.settings.json` o deja que se lean desde `ISA-DOC/secrets/patyia/lab-langgraph.env` (`GROQ_*`, `MINIMAX_*`, `HUGGINGFACE_API_KEY`). Verifica `LANGLAB_DATABASE_URL`.
3. Instala y arranca:
   ```bash
   npm install
   npm run build
   npm run start:host
   ```
4. API base: `http://localhost:5500/api` (puerto fijo en `Host.LocalHttpPort`; PatyIA e ISA-DOC usan **7071**).

## Scripts de corpus y PG

Los comandos de fetch, indexación, proofread y schema PG están en **ISA-DOC** (`npm run lab:…`); el corpus vive en **`data/vectorize/`** de este repo. Ver `../ISA-DOC/scripts/lab-langgraph/README.md` y `data/README.md`.

Además en este repo:

| npm | Descripción |
| --- | --- |
| `npm run build` / `start` | Azure Functions local (:5500) |
| `npm run diagrams:render` | Diagramas LangGraph |
| `npm run test:gemini:all` | Inventario Gemini → `testing/data/gemini-model-samples/` |
| `npm run test:cerebras:all` | Inventario Cerebras → `testing/data/cerebras-model-samples/` |
| `npm run test:minimax:all` / `test:minimax:api` | Inventario MiniMax → `testing/data/minimax-model-samples/` |

Ver `testing/README.md`.

## Front de prueba (React 18 + MUI UMD, sin build)

Stack estático: React/MUI/Babel desde CDN (unpkg) + JSX en `frontend/comun/`. No requiere `npm run build` para el front.

```bash
npm run frontend:serve
# → http://127.0.0.1:5501/index.html
```

- `frontend/comun/jsx/` — App, layouts, páginas (FitDocs, PatyIA)
- `frontend/comun/js/` — auth, `labFetch`, SSE, API conversaciones
- Edita `frontend/config.js` si cambias el puerto de la API local

## Dominios en el repo

- **LangLab** — conversación, grafo LangGraph, orquestador de LLM (`src/lib/langlab/`, `BD_LANGLAB`).
- **PatyIA / ISA-DOC** — tickets, bitácora, caches y prompts en disco (`data/patyia/`, rutas `/api/patyia/cache/…`).

Detalle: [docs/ARCHITECTURE-BOUNDARIES.md](./docs/ARCHITECTURE-BOUNDARIES.md).

## API

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/health` | Estado del servicio |
| POST | `/api/index` | `multipart/form-data` con PDFs (`replace=false` para no borrar) |
| POST | `/api/ask` | JSON `{ "question": "...", "k": 4 }` |
| GET | `/api/documents` | Fuentes indexadas |
| DELETE | `/api/reset` | Vacía embeddings |
| GET/POST | `/api/signalr/negotiate` | Token de conexión Azure SignalR (front) |
| POST | `/api/signalr/notify` | Avisos server → clientes conectados |

## Despliegue en Azure

Infra **Consumption (gratuito/lab)** + CI en GitHub:

1. `az login` → `.\scripts\azure\provision.ps1`
2. Application settings (Render PG, `GROQ_*`, `HUGGINGFACE_*`, …) — ver `local.settings.json.example`
3. `gh auth login` → `.\scripts\github\create-repo-and-push.ps1` (repo [Dev-InSoft-web/lab-langgraph](https://github.com/Dev-InSoft-web))
4. Secretos Actions: `AZURE_FUNCTIONAPP_NAME`, `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` — guía en [docs/DEPLOY-AZURE.md](./docs/DEPLOY-AZURE.md)

Cada push a `main` despliega vía `.github/workflows/deploy-azure-functions.yml`.

Modelos y tablas PG fijos: `src/lib/core/lab-constants.ts`. Lee [VOLATILIDAD-AZURE.md](./VOLATILIDAD-AZURE.md) antes de producción.

## Referencia ISA-DOC (bloque PatyIA · Lab)

- Documentación: `ISA-DOC/public/content/docs/patyia/lab-*.md` (menú lateral **Lab LangGraph** en Docs PatyIA).
- Cliente batch ISA-DOC: `ISA-DOC/secrets/patyia/lab-client.env` (solo URL). Keys: `lab-langgraph/secrets/patyia/lab-langgraph.env`.
- Acciones en panel ISA: pestaña **PatyIA · Lab** (solo este repo).
