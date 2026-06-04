# Despliegue Azure + GitHub Actions (lab-langgraph)

Alojamiento recomendado: **Azure Function App**, Linux, **Node 20**, plan **Consumption (Y1)** — incluye [capa gratuita mensual](https://azure.microsoft.com/pricing/details/functions/) (sujeta a límites de ejecución y almacenamiento).

## 1. Portal o CLI — crear la Function App

### Opción A — Script (recomendado)

En PowerShell, desde la raíz del repo:

```powershell
az login
.\scripts\azure\provision.ps1 -Location eastus2 -FunctionAppName func-insoft-lablanggraph
```

Portal de referencia: [Azure Portal](https://portal.azure.com/) → Resource groups → `rg-insoft-lab-langgraph`.

El script Bicep crea también **Azure SignalR Service** (`Free_F1`, modo **Serverless**) para sockets front/server sin proceso local. Detalle: [SIGNALR.md](./SIGNALR.md).

### Opción B — Portal manual

1. **Create a resource** → **Function App**.
2. **Publish**: Code · **Runtime**: Node.js · **Version**: 20 · **OS**: Linux.
3. **Hosting**: plan **Consumption (Serverless)**.
4. Storage: cuenta nueva (LRS).
5. Tras crear, **Configuration** → Application settings:
   - `FUNCTIONS_WORKER_RUNTIME` = `node`
   - `FUNCTIONS_EXTENSION_VERSION` = `~4`
   - `AzureWebJobsStorage` = connection string del storage
   - `WEBSITE_RUN_FROM_PACKAGE` = `1`
   - `SCM_DO_BUILD_DURING_DEPLOYMENT` = `false`
6. **CORS**: permitir orígenes del front (ISA-DOC gh-pages, localhost) o `*` solo en lab.

## 2. Application settings (secretos)

No subir `local.settings.json` al repo. Copiar desde `local.settings.json.example` y pegar en Azure **Environment variables**:

| Variable | Obligatoria en prod |
| --- | --- |
| `DATABASE_URL` / `PATY_DATABASE_URL` | Sí (Render external URL) |
| `RAG_DATABASE_URL` | Sí (pgvector) |
| `GROQ_API_KEY`, `HUGGINGFACE_API_KEY` | Sí para RAG |
| `AzureWebJobsStorage` | La crea Bicep |
| `FUNCTIONS_WORKER_RUNTIME` | `node` |
| `AzureSignalRConnectionString` | Sí (la define Bicep al crear `sigr-*`) |
| `SIGNALR_HUB_NAME` | `lab` (default) |
| `LAB_NOTIFY_TOKEN` | Recomendado en prod para `/api/signalr/notify` |

Proveedores opcionales y MSSQL: ver `local.settings.json.example` y `src/lib/core/secrets.ts`.

Comprobar: `GET https://<app>.azurewebsites.net/api/health`

## 3. Repositorio GitHub

Organización: [Dev-InSoft-web](https://github.com/Dev-InSoft-web?tab=repositories).

```powershell
gh auth login
.\scripts\github\create-repo-and-push.ps1
```

Repo esperado: `https://github.com/Dev-InSoft-web/lab-langgraph`

## 4. CI/CD — push a `main`

Workflow: `.github/workflows/deploy-azure-functions.yml`

| Secret | Valor |
| --- | --- |
| `AZURE_FUNCTIONAPP_NAME` | Nombre de la app, ej. `func-insoft-lablanggraph` |
| `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` | XML completo del perfil de publicación |

Obtener perfil:

```powershell
.\scripts\azure\fetch-publish-profile.ps1
```

En GitHub: **Settings → Secrets and variables → Actions → New repository secret**.

Cada **push a `main`** ejecuta `npm ci`, `npm run build` y publica con [Azure/functions-action](https://github.com/Azure/functions-action).

## 5. Enlazar ISA-DOC

En `ISA-DOC/secrets/patyia/lab-client.env` (o gh-pages):

```env
PUBLIC_LAB_LANGGRAPH_URL=https://func-insoft-lablanggraph.azurewebsites.net
```

Front de prueba: `frontend/config.js` con la misma base + `/api`.

## 6. Límites (plan gratuito / Consumption)

Ver [VOLATILIDAD-AZURE.md](../VOLATILIDAD-AZURE.md): cold start, timeout ~5 min en Consumption (host.json hasta 10 min en planes superiores), sin estado en RAM.

## Coste

- **Y1 Consumption**: ejecuciones y GB-s con asignación gratuita; revisar presupuesto en portal.
- **Storage LRS**: franquicia baja; evitar logs masivos en la cuenta de functions.
- **PostgreSQL**: sigue en Render (no incluido en Azure Functions).
