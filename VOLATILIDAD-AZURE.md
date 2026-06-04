# Volatilidad y límites — Azure Functions (FitDocs RAG)

> **Lab LangGraph** — no confundir con PatyIA producción. Copia en ISA-DOC: `public/content/docs/patyia/lab-02-volatilidad-azure.md`.

Este servicio **no guarda estado en memoria** entre peticiones (a diferencia del Streamlit del tutorial). Todo lo persistente va a **PostgreSQL + pgvector** en Render.

## Qué es delicado en Azure Functions

| Área | Riesgo | Qué hace este proyecto |
| --- | --- | --- |
| **Estado en RAM** | Cada invocación puede ir a otro worker; `st.session_state` no existe. | Vector store y documentos solo en PG. El front guarda el historial de chat en `sessionStorage` (solo UI). |
| **Pool de conexiones `pg`** | El singleton `poolSingleton` vive mientras el worker vive; al reciclarse se pierde. | `max: 2`, timeouts cortos. No confíes en conexiones eternas. |
| **Archivos temporales** | `/tmp` no es compartido entre instancias y puede borrarse. | Los PDF se procesan **en memoria** (`loadPdfFromBuffer`), sin `tempfile`. |
| **Caché de modelos** | Cachear embeddings/LLM en variable global ahorra cold start pero el worker se reinicia. | Se instancian por invocación vía factories (aceptable para lab). |
| **Timeout** | Consumption plan: por defecto 5 min (este `host.json` permite 10 min en premium/dedicated). | Indexar muchos PDFs grandes puede superar el límite — trocea subidas o sube el plan. |
| **Tamaño del body** | Límite HTTP (~100 MB según plan/host). | Varios PDFs pesados en un solo POST pueden fallar. |
| **Cold start** | Primera petición lenta (npm + LangChain + PG). | Normal en experimentos; usa `health` para calentar. |
| **Concurrencia** | Dos `index` simultáneos pueden intercalar `DELETE` + `addDocuments`. | En producción serializa indexación o usa cola (Storage Queue / Service Bus). |
| **CORS** | El front en otro origen necesita cabeceras. | Cada función devuelve `Access-Control-Allow-*`; en local: `func start --cors "*"`. |
| **Secretos** | `local.settings.json` no se despliega a Azure. | Configura **Application settings** en el portal (`DATABASE_URL`, `OPENAI_API_KEY`, …). |

## Endpoints y efectos secundarios

- `POST /api/index` — **Pesado**: embeddings OpenAI + escritura masiva en PG. `?replace=false` añade sin borrar; por defecto borra la colección antes.
- `POST /api/ask` — Lee PG + llama al LLM. Idempotente respecto al índice.
- `DELETE /api/reset` — Borra filas de la tabla vectorial.
- `GET /api/documents` — Solo lectura de metadatos.

## Base de datos Render

- Desde **Azure** (fuera de Render): usa siempre la **External Database URL**.
- Desde otro servicio **en Render**: puedes usar la Internal URL.
- Habilita `CREATE EXTENSION vector` en el primer uso (lo ejecuta el código).

## Front estático

Sirve `frontend/` con cualquier servidor estático (`npx serve frontend`). Configura `config.js` con la URL base de tu Function App. El historial de chat **no** se sincroniza con el servidor.
