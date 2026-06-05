---
name: deploy-azure-functions
description: >-
  Despliega lab-langgraph a Azure Function App rag-lab (Flex Consumption).
  Usar en CI/CD, 502/503 SCM, secretos publish profile, app settings Azure,
  auth/token colgado, Swagger y verificación post-deploy.
---

# Azure Functions — deploy lab-langgraph (rag-lab)

Skill validada con deploy exitoso en [Actions run #20](https://github.com/Dev-InSoft-web/lab-langgraph/actions/runs/26983461510) (`d4efd71`, ~3 min).

## Fuente de verdad

| Concepto | Valor producción |
| --- | --- |
| Function App | **`rag-lab`** |
| Resource group | **`rg-lab-langgraph`** |
| Repo | `Dev-InSoft-web/lab-langgraph` |
| URL | `https://rag-lab-bsczhqfgchgegabr.canadacentral-01.azurewebsites.net` |
| Plan | **Flex Consumption** |

**No usar** `func-lab-langgraph` en secretos ni publish profile (SCM 503).

## Flujo deploy correcto (orden)

1. `npm run build` local OK.
2. **Secretos GitHub** (perfil de **rag-lab**, no func-lab-langgraph):

```powershell
.\scripts\github\set-azure-deploy-secrets.ps1
# rag-lab, rg-lab-langgraph por defecto
```

3. **App settings Azure** (obligatorio tras crear app; el zip NO los incluye):

```powershell
# Añadir LAB_JWT_SECRET y LAB_AUTH_REQUIRED en local.settings.json primero
npx tsx scripts/azure/sync-app-settings.mts
```

Sin `DATABASE_URL` / `PATY_DATABASE_URL` → `POST /api/auth/token` **cuelga o 503** (PG + timeout Flex).

4. Push `main` → workflow `.github/workflows/deploy-azure-functions.yml`.

5. Verificar:

```powershell
& $az functionapp function list -n rag-lab -g rg-lab-langgraph --query "length(@)"  # > 0
Invoke-WebRequest "https://rag-lab-bsczhqfgchgegabr.canadacentral-01.azurewebsites.net/api/openapi.json"
```

## CI — qué funciona (no revertir)

| Paso | Detalle |
| --- | --- |
| Runner | `windows-latest`, Node 22 |
| Build | `npm install` + `tsc` |
| Package | `build-deploy-zip.ps1` → `host.json`, `package.json`, `dist/`, `node_modules/` (**tar.exe**, rutas POSIX) |
| Deploy | **`publish-flex-package.ps1`** → `POST /api/publish?RemoteBuild=false` → **202** |
| Registro funciones | `src/index.ts` importa explícito `./functions/*.js` (glob en `package.json` no basta en Flex) |
| Concurrencia | `cancel-in-progress: false` (evita cancelar run del push al disparar workflow_dispatch) |
| Smoke test | `$fnHost` (no `$host` reservada PS); `continue-on-error: true` |

**Prohibido en rag-lab:** `Azure/functions-action` (Kudu App Settings 503).

## Errores reales y solución

| Síntoma | Causa | Acción |
| --- | --- | --- |
| Publish a `func-lab-langgraph.scm...` 503 | Secret `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` viejo | `set-azure-deploy-secrets.ps1` |
| Run **cancelled** (no failure) | Dos runs + `cancel-in-progress: true` | Ignorar ese job; mirar el otro run o desactivar cancel |
| Smoke test `InvalidOperation` `$host` | Variable reservada PowerShell | Ya corregido: `$fnHost` |
| Todo `/api/*` 404 | Sin funciones registradas | `index.ts` imports + redeploy |
| `/api/docs` fallback “No se pudo cargar Swagger UI” | CDN jsdelivr bloqueado en red usuario | Usar `/api/openapi.json` o Postman |
| `POST /api/auth/token` **pending eterno** | Sin `DATABASE_URL` en Azure; o `ensureLabAuthSchema` leía `db/` (no va en zip) | `sync-app-settings.mts` + DDL embebido en código + `LAB_JWT_SECRET` |
| Workflow verde pero auth falla | Solo deploy; faltan app settings | Paso 3 arriba |

## App settings mínimas (portal o sync script)

| Variable | Uso |
| --- | --- |
| `PATY_DATABASE_URL` / `DATABASE_URL` | Render `langlab` — **auth, entity store** |
| `LAB_JWT_SECRET` | ≥ 32 chars — **obligatorio para token** |
| `LAB_AUTH_REQUIRED` | `true` en prod |
| `RAG_DATABASE_URL`, `GROQ_API_KEY`, … | RAG |
| `FUNCTIONS_WORKER_RUNTIME` | `node` (portal) |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `false` |

Usuarios JWT en PG: `npm run auth:apply-pg` (local/Render, no en Azure).

## Secretos GitHub

| Secret | Valor |
| --- | --- |
| `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` | XML **rag-lab** (SCM `...canadacentral-01...`) |
| `AZURE_FUNCTIONAPP_NAME` | `rag-lab` |
| `AZURE_FUNCTIONAPP_HOSTNAME` | `rag-lab-bsczhqfgchgegabr.canadacentral-01.azurewebsites.net` |

Validación en workflow: si SCM host contiene `func-lab-langgraph` → falla con mensaje claro.

## QA post-deploy

```powershell
$base = "https://rag-lab-bsczhqfgchgegabr.canadacentral-01.azurewebsites.net"
# Spec
Invoke-WebRequest "$base/api/openapi.json" -UseBasicParsing
# Auth (credenciales de npm run auth:apply-pg)
$body = '{"username":"JAGUDELOE","password":"<pass>"}'
Invoke-WebRequest "$base/api/auth/token" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
```

Respuesta esperada auth: `200` + `token`. Si `503` + hint DATABASE_URL → app settings.

## Anti-patrones

- `FLEX_CONSUMPTION=false` + functions-action en rag-lab.
- Push + workflow_dispatch simultáneo con cancel-in-progress true.
- Asumir que deploy incluye secretos o carpeta `db/`.
- Probar auth antes de `sync-app-settings.mts`.

## Referencias repo

- Workflow: `.github/workflows/deploy-azure-functions.yml`
- Scripts: `scripts/azure/build-deploy-zip.ps1`, `publish-flex-package.ps1`, `sync-app-settings.mts`, `scripts/github/set-azure-deploy-secrets.ps1`
- Auth: `src/functions/auth.ts`, `src/lib/auth/ensure-auth-schema.ts` (DDL embebido)
