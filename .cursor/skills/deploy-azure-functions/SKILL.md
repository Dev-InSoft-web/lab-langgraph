---
name: deploy-azure-functions
description: >-
  Playbook Azure Functions Node (Flex Consumption): CI/CD, publish profile, app settings,
  registro de funciones, Swagger/OpenAPI, auth JWT, errores 404/503 y QA post-deploy.
  Referencia: lab-langgraph → rag-lab. Reutilizable en nuevos proyectos Azure Fn.
---

# Azure Functions Node — deploy y operación (Flex Consumption)

Playbook validado en **lab-langgraph** → Function App **`rag-lab`** ([run exitoso](https://github.com/Dev-InSoft-web/lab-langgraph/actions/runs/27021076671)). Usar como checklist al montar **cualquier** proyecto Azure Functions similar.

---

## 1. Checklist nuevo proyecto (orden obligatorio)

Copiar este orden en cada repo nuevo; saltar pasos causa 404, 503 o auth colgado.

| # | Paso | Por qué |
| --- | --- | --- |
| 1 | `npm run build` local OK | CI falla tarde si TypeScript no compila |
| 2 | `src/index.ts` importa **cada** `./functions/*.js` explícitamente | Glob en `package.json` **no registra** funciones en Flex → `/api/*` 404 |
| 3 | DDL/SQL embebido en código, **no** leer `db/` en runtime | El zip de deploy **no incluye** carpeta `db/` |
| 4 | Crear Function App Flex + anotar nombre/host **correcto** | Publish profile de otra app → SCM 503 |
| 5 | `set-azure-deploy-secrets.ps1` (o equivalente) con perfil de **esa** app | Secret viejo = deploy a host incorrecto |
| 6 | `sync-app-settings.mts` **antes** de probar auth/RAG | Zip **no lleva** secretos ni connection strings |
| 7 | Workflow: `build-deploy-zip.ps1` + `publish-flex-package.ps1` | `Azure/functions-action` → Kudu 503 en Flex |
| 8 | `cancel-in-progress: false` en CI | Push + dispatch simultáneo cancela el run bueno |
| 9 | Smoke test con `$fnHost` (no `$host`) | `$host` es reservada en PowerShell |
| 10 | QA: `openapi.json` + `auth/token` + endpoint crítico | Deploy verde ≠ app settings OK |

---

## 2. Fuente de verdad — lab-langgraph (rag-lab)

| Concepto | Valor producción |
| --- | --- |
| Function App | **`rag-lab`** |
| Resource group | **`rg-lab-langgraph`** |
| Repo | `Dev-InSoft-web/lab-langgraph` |
| URL | `https://rag-lab-bsczhqfgchgegabr.canadacentral-01.azurewebsites.net` |
| Plan | **Flex Consumption** (`canadacentral-01`) |

**No usar** `func-lab-langgraph` en secretos ni publish profile.

### Adaptar a otro proyecto

| Variable workflow / secret | Qué poner |
| --- | --- |
| `AZURE_FUNCTIONAPP_NAME` | Nombre exacto de la nueva Function App |
| `AZURE_FUNCTIONAPP_HOSTNAME` | `{nombre}.azurewebsites.net` (o `...canadacentral-01...`) |
| `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` | XML descargado de **esa** app (Portal → Overview → Get publish profile) |
| Validación SCM en workflow | Rechazar si el host del perfil no coincide con `AZURE_FUNCTIONAPP_NAME` |

---

## 3. CI/CD — patrón que funciona

### Workflow (`.github/workflows/deploy-azure-functions.yml`)

| Paso | Detalle |
| --- | --- |
| Runner | `windows-latest`, Node 22 |
| Build | `npm install` + `tsc` |
| Package | `scripts/azure/build-deploy-zip.ps1` → `host.json`, `package.json`, `dist/`, `node_modules/` (tar POSIX) |
| Deploy | `scripts/azure/publish-flex-package.ps1` → `POST /api/publish?RemoteBuild=false` → esperar **202** |
| Registro funciones | `src/index.ts` imports explícitos |
| Concurrencia | `cancel-in-progress: false` |
| Smoke | `$fnHost = env:AZURE_FUNCTIONAPP_HOSTNAME`; `continue-on-error: true` |

### Prohibido en Flex Consumption (rag-lab y similares)

- `Azure/functions-action` (SCM App Settings **503**).
- Asumir que el zip incluye `.env`, `local.settings.json`, `db/` o secretos.
- `FLEX_CONSUMPTION=false` forzando functions-action.

### Scripts a copiar/adaptar

```
scripts/azure/build-deploy-zip.ps1
scripts/azure/publish-flex-package.ps1
scripts/azure/sync-app-settings.mts
scripts/github/set-azure-deploy-secrets.ps1
```

---

## 4. App settings Azure (obligatorio post-crear app)

El deploy solo sube código. Sin estos valores, auth/RAG fallan en silencio o con timeout.

| Variable | Uso |
| --- | --- |
| `DATABASE_URL` / `PATY_DATABASE_URL` | PostgreSQL — auth, entity store |
| `LAB_JWT_SECRET` | ≥ 32 caracteres — firma JWT |
| `LAB_AUTH_REQUIRED` | `true` en producción |
| `RAG_DATABASE_URL`, `GROQ_API_KEY`, … | Según features del proyecto |
| `FUNCTIONS_WORKER_RUNTIME` | `node` |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `false` |

```powershell
# Valores en local.settings.json (no commitear secretos)
npx tsx scripts/azure/sync-app-settings.mts
```

Usuarios JWT: `npm run auth:apply-pg` contra la BD (local/Render), no en Azure.

---

## 5. Errores reales → causa → solución

| Síntoma | Causa | Acción |
| --- | --- | --- |
| Publish SCM `503` | Publish profile de **otra** Function App | Regenerar secretos con script; validar host en workflow |
| Run **cancelled** (no failure) | Dos runs + `cancel-in-progress: true` | `false` o ignorar run cancelado |
| Smoke `InvalidOperation` en `$host` | Variable reservada PowerShell | Usar `$fnHost` |
| Todo `/api/*` **404** | Funciones no registradas en worker | Imports explícitos en `index.ts` + redeploy |
| `/api/docs` fallback HTML | CDN jsdelivr bloqueado en red cliente | `/api/openapi.json` o Postman |
| Swagger `StandaloneLayout` roto | Falta `swagger-ui-standalone-preset.js` | Cargar preset en `swagger-ui-html.ts` |
| `POST /api/auth/token` **pending** / timeout | Sin `DATABASE_URL` en Azure | `sync-app-settings.mts` |
| Auth 500 / schema error | `ensureLabAuthSchema` leía archivos `db/` | DDL **embebido** en `ensure-auth-schema.ts` |
| Workflow verde, API rota | Solo deploy, sin app settings | Paso 4 app settings antes de QA |
| Auth 401 con credenciales OK | `LAB_JWT_SECRET` distinto o vacío | Sync secret + reinicio app |

---

## 6. Swagger / OpenAPI (inputs y presentación)

### Estructura en repo

```
src/lib/openapi/spec.ts              # paths + $ref a schemas
src/lib/openapi/components-schemas.ts # AuthTokenRequest, AskRequest, …
src/lib/openapi/swagger-ui-html.ts   # UI + requestInterceptor
src/functions/swagger.ts             # GET /api/docs y /api/openapi.json
docs/openapi.json                    # npm run openapi:export
```

### Reglas Swagger

1. **Nunca** quemar usuarios/contraseñas en `example` (auth: `example: ""`).
2. Contraseña: `format: "password"` en schema → campo oculto en Try it out.
3. Cada `POST` con JSON debe tener `requestBody` con `$ref` a schema con `properties` (no `{ type: object }` genérico).
4. Multipart (`index/pdf`, uploads): `format: binary` en schema.
5. Exportar spec tras cambios: `npm run openapi:export`.

### Auth — distractor César (no seguridad real)

Solo para que en presentaciones el request no muestre la contraseña en claro.

| Capa | Comportamiento |
| --- | --- |
| Formulario Swagger | Usuario escribe pass en claro |
| `requestInterceptor` (front) | Envía `César( abc123 + password + xyz987 )` |
| Desfase | **Día del mes UTC** (1–31), cambia cada día |
| Backend `unwrapTransportPassword` | Inverso César con mismo desfase UTC; extrae pass entre prefijo/sufijo |
| Clientes reales (Postman, SPA) | Pueden enviar pass **plano**; backend acepta ambos |

Archivos:

- `src/lib/auth/caesar-transport.ts` — `caesarShiftForDate`, `wrapTransportPassword`, `unwrapTransportPassword`
- `src/functions/auth.ts` — `unwrapTransportPassword` antes de `verifyPassword`
- `src/lib/openapi/swagger-ui-html.ts` — misma lógica en JS inline (UTC)

**Importante:** prefijo y sufijo van **dentro** del texto cifrado (no visibles en el wire).

Compatibilidad legacy v1 (prefijo/sufijo sin cifrar + shift fijo 13): el backend aún la decodifica si llega.

---

## 7. Auth JWT — piezas mínimas

```
src/functions/auth.ts
src/lib/auth/ensure-auth-schema.ts   # DDL embebido, no fs.read db/
src/lib/auth/users.ts
src/lib/auth/password.ts
src/lib/auth/jwt.ts
```

Gate en handlers: middleware o helper que valida `Authorization: Bearer`.

App settings: `LAB_JWT_SECRET`, `LAB_AUTH_REQUIRED`, `DATABASE_URL`.

---

## 8. Secretos GitHub (rag-lab)

| Secret | Valor |
| --- | --- |
| `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` | XML **rag-lab** (SCM `...canadacentral-01...`) |
| `AZURE_FUNCTIONAPP_NAME` | `rag-lab` |
| `AZURE_FUNCTIONAPP_HOSTNAME` | `rag-lab-bsczhqfgchgegabr.canadacentral-01.azurewebsites.net` |

Workflow debe fallar si SCM host contiene nombre de app antigua (`func-lab-langgraph`).

---

## 9. QA post-deploy

```powershell
$base = "https://rag-lab-bsczhqfgchgegabr.canadacentral-01.azurewebsites.net"

# Spec
Invoke-WebRequest "$base/api/openapi.json" -UseBasicParsing

# Funciones registradas
az functionapp function list -n rag-lab -g rg-lab-langgraph --query "length(@)"

# Auth — pass plano OK (Swagger envía cifrado)
$body = '{"username":"<user>","password":"<pass>"}'
Invoke-WebRequest "$base/api/auth/token" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
# Esperado: 200 + token. Si 503 + hint DATABASE_URL → sync app settings.
```

---

## 10. Anti-patrones (evitar en próximos proyectos)

- Deploy antes de app settings.
- Un solo `import` genérico sin listar funciones en Flex.
- Leer migraciones SQL desde disco en Azure.
- Ejemplo `JAGUDELOE` en OpenAPI (usar inputs vacíos).
- Confiar en Swagger CDN en demos offline (tener `openapi.json`).
- Probar auth sin `LAB_JWT_SECRET` y `DATABASE_URL` en portal.
- Reutilizar publish profile de otra Function App “porque es el mismo RG”.

---

## 11. Referencias lab-langgraph

| Área | Ruta |
| --- | --- |
| Workflow CI | `.github/workflows/deploy-azure-functions.yml` |
| Entry + registro | `src/index.ts` |
| Deploy zip / publish | `scripts/azure/build-deploy-zip.ps1`, `publish-flex-package.ps1` |
| App settings sync | `scripts/azure/sync-app-settings.mts` |
| Secretos GH | `scripts/github/set-azure-deploy-secrets.ps1` |
| OpenAPI | `src/lib/openapi/spec.ts`, `components-schemas.ts` |
| Swagger UI | `src/lib/openapi/swagger-ui-html.ts`, `src/functions/swagger.ts` |
| César transport | `src/lib/auth/caesar-transport.ts` |
| Auth | `src/functions/auth.ts`, `src/lib/auth/ensure-auth-schema.ts` |
| Skill operativa | `.cursor/skills/deploy-azure-functions/SKILL.md` |
