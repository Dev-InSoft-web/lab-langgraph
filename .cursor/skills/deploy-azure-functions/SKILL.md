---
name: deploy-azure-functions
description: >-
  Despliega lab-langgraph a Azure Function App (rag-lab Flex Consumption o plan clásico).
  Usar en push a main, fallos de GitHub Actions, 502/503 SCM, secretos publish profile,
  app settings en Azure, verificación post-deploy e ISA-DOC PUBLIC_LAB_LANGGRAPH_URL.
---

# Azure Functions — deploy lab-langgraph

Skill operativa basada en el despliegue real a **`rag-lab`** (`rg-lab-langgraph`, Flex Consumption, Canada Central). Evita repetir errores de la primera publicación (docs desactualizados, Kudu 503, perfiles viejos, health check prematuro).

## Fuente de verdad (no improvisar nombres)

| Concepto | Valor en producción (2026) | Obsoleto en docs viejos |
| --- | --- | --- |
| Function App | **`rag-lab`** | `func-insoft-lablanggraph` |
| Resource group | **`rg-lab-langgraph`** | `rg-insoft-lab-langgraph` |
| Repo GitHub | `Dev-InSoft-web/lab-langgraph` | — |
| URL base | `https://rag-lab-bsczhqfgchgegabr.canadacentral-01.azurewebsites.net` | hostnames de otra región/app |
| Plan | **Flex Consumption** (`sku.name` ≈ `flexconsumption`) | Consumption Y1 clásico |

Antes de tocar CI o secretos, confirmar app real:

```powershell
$az = "$env:ProgramFiles\Microsoft SDKs\Azure\CLI2\wbin\az.cmd"
& $az functionapp show -n rag-lab -g rg-lab-langgraph --query "{name:name, sku:sku.name, hostname:defaultHostName}" -o json
```

Si el SKU es **flexconsumption**, el deploy **no** puede ser el zipdeploy “ingenuo” de ayudascp-ia clásico sin adaptar (ver abajo).

## Flujo rápido (próximo deploy)

1. **Código en `main`**: `npm run build` local debe pasar.
2. **Secretos GitHub** al día (tras recrear la app o rotar perfil):

```powershell
cd C:\Users\JAGUDELOE\Documents\Contapyme\lab-langgraph
.\scripts\github\set-azure-deploy-secrets.ps1
# Parámetros por defecto: rag-lab, rg-lab-langgraph
```

3. **Push** a `main` o **workflow_dispatch** → workflow `.github/workflows/deploy-azure-functions.yml`.
4. **Post-deploy** (esperar 1–2 min; comprobar que hay funciones):

```powershell
$az = "$env:ProgramFiles\Microsoft SDKs\Azure\CLI2\wbin\az.cmd"
& $az functionapp function list -n rag-lab -g rg-lab-langgraph --query "length(@)"

$base = "https://rag-lab-bsczhqfgchgegabr.canadacentral-01.azurewebsites.net"
Invoke-WebRequest "$base/api/openapi.json" -UseBasicParsing   # debe ser 200
Invoke-WebRequest "$base/api/docs" -UseBasicParsing         # HTML Swagger
```

Si `function list` devuelve `[]` o todo `/api/*` es **404**: el host no cargó los triggers. En `src/index.ts` deben importarse `./functions/*.js` (no confiar solo en el glob de `package.json` en Flex).

Si `/api/docs` es 200 pero la página sale en blanco: CDN bloqueado; usar `/api/openapi.json` o importar en Postman.

5. **ISA-DOC**: `PUBLIC_LAB_LANGGRAPH_URL=<base sin /api>` en `secrets/patyia/lab-client.env` o variable gh-pages.

## Cómo despliega el CI (leer antes de “arreglar” el yml)

| `vars.FLEX_CONSUMPTION` | Método | Script |
| --- | --- | --- |
| no `false` (default) | Zip precompilado → Kudu **`/api/publish?RemoteBuild=false`** | `build-deploy-zip.ps1` + `publish-flex-package.ps1` |
| `false` | `Azure/functions-action@v1.5.0` (patrón ayudascp-ia) | package desde raíz, `respect-funcignore: true` |

Pasos comunes del job (Windows, Node **22.x**):

1. `npm install` + `npm install typescript -D` + `npm run build`
2. **Flex**: empaquetar solo `host.json`, `package.json`, `package-lock.json`, `dist/`, `node_modules/`
3. Publicar con publish profile del secret `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`

**No cambiar** a `Azure/webapps-deploy` ni `slot-name: production` — provoca *Publish profile is invalid*.

**No usar** input `scm-do-build-during-deployment` en actions de terceros — no es válido en `webapps-deploy@v3`.

## Errores que ya ocurrieron → acción directa

| Síntoma | Causa | Qué hacer |
| --- | --- | --- |
| Kudu **503** / *Failed to fetch Kudu App Settings* en zip a `/api/zipdeploy` | App **Flex** o SCM caído / perfil viejo | Usar rama Flex del workflow (`publish-flex-package.ps1`); activar **SCM Basic Auth**; `set-azure-deploy-secrets.ps1`; reintentar workflow |
| **502** en `/api/publish` | SCM saturado o cold | El script reintenta hasta 12 veces; esperar y relanzar workflow |
| *Publish profile is invalid* + slot | `webapps-deploy` con slot | Quitar slot; solo publish profile XML completo |
| Deploy OK pero **404** en `/api/*` | Paquete sin `dist/` o rutas Windows `\` en zip | Usar `build-deploy-zip.ps1` (**tar.exe**, no `Compress-Archive`) |
| Health check falla justo tras deploy | **Cold start** Flex | Esperar 60–120 s; probar `/api/health` y `/api/tools/health` |
| Secretos apuntan a otra app | Docs decían `func-insoft-*` | Regenerar con `set-azure-deploy-secrets.ps1` para **`rag-lab`** |
| `az` / `gh` no encontrados en agente local | PATH en Windows | Rutas: `Program Files\Microsoft SDKs\Azure\CLI2\wbin\az.cmd`, `Program Files\GitHub CLI\gh.exe` |

## App settings obligatorias en Azure (portal)

No van en el zip. Configurar en **Function App → Environment variables**:

| Variable | Notas |
| --- | --- |
| `FUNCTIONS_WORKER_RUNTIME` | `node` |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `false` (build en CI) |
| `PATY_DATABASE_URL` / `DATABASE_URL` | Render external URL |
| `RAG_DATABASE_URL` | pgvector (RAG) |
| `GROQ_API_KEY`, `HUGGINGFACE_API_KEY` | RAG |
| `AzureSignalRConnectionString`, `SIGNALR_HUB_NAME` | SignalR (`lab`) |
| `LAB_JWT_SECRET` | ≥ 32 caracteres |
| `LAB_AUTH_REQUIRED` | `true` en prod |
| `LAB_NOTIFY_TOKEN` | Recomendado para notify |

**JWT / usuarios** viven en **PostgreSQL (Render)**, no en Azure:

```bash
npm run auth:apply-pg   # solo 014 auth + seed; no exige RAG
```

No ejecutar `npm run db:apply-schema` si falta `RAG_DATABASE_URL`; para ops: `npm run db:apply-pg-ops`.

Portal: **SCM Basic Auth Publishing Credentials = On** antes del primer deploy desde GitHub.

## Empaquetado (agentes y local)

Contenido mínimo del zip de producción:

- `host.json`, `package.json`, `package-lock.json`
- `dist/` (salida de `tsc`; `package.json` → `"main": "dist/src/{index.js,functions/*.js}"`)
- `node_modules/` (producción; el CI hace `npm install` en el runner)

`.funcignore` excluye `src/`, `scripts/`, `db/`, etc. Eso es correcto para **functions-action**; en Flex el zip lo arma `build-deploy-zip.ps1` y **sí** debe llevar `dist/`.

Deploy local a Flex (diagnóstico):

```powershell
npm install
npm run build
$zip = .\scripts\azure\build-deploy-zip.ps1
.\scripts\azure\fetch-publish-profile.ps1
.\scripts\azure\publish-flex-package.ps1 -ZipPath $zip -PublishProfilePath "$env:TEMP\lab-langgraph-publish-profile.xml"
```

**No** usar `zipdeploy-local.ps1` (`/api/zipdeploy`) contra **rag-lab** Flex — suele devolver 503.

## Secretos GitHub Actions

| Secret / variable | Valor |
| --- | --- |
| `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` | XML **completo** (UTF-8 sin BOM raro) |
| `AZURE_FUNCTIONAPP_NAME` | `rag-lab` |
| `AZURE_FUNCTIONAPP_HOSTNAME` | opcional; `defaultHostName` de la app |
| `vars.FLEX_CONSUMPTION` | omitir o ≠ `false` para Flex; `false` solo app clásica |

Regenerar siempre después de **eliminar/recrear** la Function App en portal.

## Checklist agente (orden fijo)

1. Confirmar **nombre de app y SKU** (`az functionapp show`).
2. Si falló deploy: `gh run view <id> -R Dev-InSoft-web/lab-langgraph --log-failed` — no adivinar.
3. Si 503/502 en SCM: verificar SCM Basic Auth + `set-azure-deploy-secrets.ps1` + re-run workflow (no cambiar a webapps-deploy).
4. Si 404 API: verificar que el zip incluye `dist/src/functions/*.js`.
5. Si 401 en API: `LAB_JWT_SECRET` / `LAB_AUTH_REQUIRED` en Azure + usuario en PG (`auth:apply-pg`).
6. Actualizar ISA-DOC solo con hostname verificado (`defaultHostName`).
7. Documentación humana extendida: `docs/DEPLOY-AZURE.md`, `docs/CREATE-FUNCTION-APP-PORTAL.md`.

## Anti-patrones (no repetir)

- Buscar `func-insoft-lablanggraph` en secretos cuando la app viva es **`rag-lab`**.
- Probar solo `/api/health` en el primer minuto y declarar “deploy roto”.
- Subir `local.settings.json` o secretos al repo.
- `npm run db:apply-schema` en CI de Azure (no es paso de deploy).
- Recrear la app solo por CLI si el portal ya la dejó estable; si recreas, **siempre** nuevo publish profile.
- Cambiar el workflow a zipdeploy clásico en Flex sin `api/publish?RemoteBuild=false`.

## Referencias en repo

- Workflow: `.github/workflows/deploy-azure-functions.yml`
- Scripts: `scripts/azure/build-deploy-zip.ps1`, `publish-flex-package.ps1`, `scripts/github/set-azure-deploy-secrets.ps1`
- PG en deploy (auth): skill `pg-direct-exec` + `npm run auth:apply-pg`
- Nomenclatura BD: `docs/db-naming.md` (esquemas `BD_*`, columnas sin `_`)
