# Despliegue Azure + GitHub Actions (lab-langgraph)

Alojamiento recomendado: **Azure Function App**, Linux, **Node 20**, plan **Consumption (Y1)** — incluye [capa gratuita mensual](https://azure.microsoft.com/pricing/details/functions/) (sujeta a límites de ejecución y almacenamiento).

## 1. Crear la Function App

### Opción A — Portal (recomendado)

El asistente del portal enlaza storage, file share y runtime de forma coherente y reduce Kudu 503 tras recreaciones por CLI.

Guía paso a paso: **[CREATE-FUNCTION-APP-PORTAL.md](./CREATE-FUNCTION-APP-PORTAL.md)**

Resumen: crear `func-insoft-lablanggraph` en `rg-insoft-lab-langgraph`, Linux, **Node 24**, consumo, **storage nuevo**, activar **SCM Basic Auth Publishing Credentials**, luego `set-azure-deploy-secrets.ps1`.

### Opción B — Script Bicep/CLI

Solo si ya dominas el flujo o es entorno automatizado:

```powershell
az login
.\scripts\azure\provision.ps1 -Location eastus2 -FunctionAppName func-insoft-lablanggraph
```

El script crea también **SignalR** (`Free_F1`, Serverless). Detalle: [SIGNALR.md](./SIGNALR.md).

Si el deploy en GitHub falla con 503, **recrea la Function App por portal** (opción A) y vuelve a descargar el publish profile.

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

Actualizar secretos (recomendado tras recrear la Function App):

```powershell
.\scripts\github\set-azure-deploy-secrets.ps1
```

Cada **push a `main`** ejecuta `npm ci`, `npm run build` y **Zip Deploy** vía publish profile (sin `slot-name` ni `webapps-deploy`).

### Errores frecuentes en Actions

| Error | Causa | Solución |
| --- | --- | --- |
| `Publish profile is invalid for app-name and slot-name` | `Azure/webapps-deploy` con `slot-name: production` o secretos viejos | Usar el workflow actual (zip directo); ejecutar `set-azure-deploy-secrets.ps1` |
| `Unexpected input scm-do-build-during-deployment` | Parámetro no válido en `webapps-deploy@v3` | No usar ese input; el workflow actual no lo incluye |
| `Failed to fetch Kudu App Settings` **503** | App Linux Consumption sin primer deploy o SCM caído | El workflow reintenta zip deploy; en portal: **SCM Basic Auth Publishing Credentials = On**, reiniciar app, volver a descargar perfil |

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
