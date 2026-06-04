# Crear la Function App desde Azure Portal (recomendado)

En la práctica, crear la **Function App** con el asistente del portal evita estados raros (Kudu 503, file share mal enlazado, `WEBSITE_RUN_FROM_PACKAGE` corrupto) que a veces aparecen al encadenar varios `az functionapp create` / recreaciones por CLI.

**SignalR** (`sigr-insoft-lablanggraph`) ya puede existir en `rg-insoft-lab-langgraph`; solo hay que recrear la Function App y enlazar settings.

## Antes de empezar

1. [Azure Portal](https://portal.azure.com/) con la suscripción **Azure subscription 1**.
2. Si ya existe `func-insoft-lablanggraph` y falla el deploy (503 en SCM):
   - Portal → Function App → **Eliminar** (solo la app, no el grupo ni SignalR).
   - Esperar 2–3 minutos.

## Asistente: Crear aplicación de funciones

1. **Crear un recurso** → **Aplicación de funciones** → Crear.

2. **Básico**
   - Suscripción: la tuya.
   - Grupo de recursos: `rg-insoft-lab-langgraph` (existente).
   - Nombre: `func-insoft-lablanggraph`.
   - ¿Quiere implementar una zona de disponibilidad?: **Desactivado** (lab).

3. **Hospedaje**
   - Opción recomendada en portal (2026): **Consumo flexible** o **Consumo** (Linux).
   - Si ofrece **Node.js 24**, elígelo (Node 20 ya no se admite en nuevas apps).
   - Sistema operativo: **Linux**.
   - Región: **East US 2** (misma que SignalR).

4. **Almacenamiento**
   - Deja que el portal **cree una cuenta nueva** (no reutilices `stlabinsoft01` / `stlabae3ug` de intentos CLI viejos).
   - SKU: LRS estándar.

5. **Supervisión**
   - Application Insights: **Sí** (valor por defecto).

6. **Revisar y crear** → Esperar a que el estado sea **Running**.

## Después de crear (solo portal)

### 1. Configuración → Configuración general

- **Credenciales de publicación de autenticación básica de SCM**: **Activado** (necesario para GitHub Actions con publish profile).

### 2. Configuración → Variables de entorno

Añadir (o verificar que el asistente no las haya roto):

| Nombre | Valor |
| --- | --- |
| `AzureSignalRConnectionString` | Cadena primaria de `sigr-insoft-lablanggraph` (Portal → SignalR → Claves) |
| `SIGNALR_HUB_NAME` | `lab` |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `false` |

**No** pongas `WEBSITE_RUN_FROM_PACKAGE` hasta que el **primer deploy** desde GitHub haya terminado bien.

Más adelante (prod): `DATABASE_URL`, `RAG_DATABASE_URL`, `GROQ_API_KEY`, etc. (ver `DEPLOY-AZURE.md`).

### 3. CORS

- Orígenes permitidos: URL de ISA-DOC + `http://localhost:*` o `*` solo en lab.

### 4. Perfil de publicación → GitHub

1. Function App → **Obtener perfil de publicación** → descargar `.PublishSettings`.
2. En máquina local (con `az login` y `gh auth login`):

```powershell
cd C:\Users\JAGUDELOE\Documents\Contapyme\lab-langgraph
.\scripts\github\set-azure-deploy-secrets.ps1
```

3. GitHub → **Actions** → **Deploy lab-langgraph** → **Run workflow** (o push a `main`).

## Qué dejar en CLI

| Tarea | Herramienta |
| --- | --- |
| Crear Function App | **Portal** (este doc) |
| Crear SignalR (si no existe) | Portal o `provision.ps1` |
| Secretos GitHub + deploy | `set-azure-deploy-secrets.ps1` + Actions |
| Variables de BD/API keys | Portal → Configuration |

## Comprobar que Kudu responde

Tras crear y **antes** del primer deploy, en el portal:

- Function App → **Herramientas avanzadas (Kudu)** → **Ir** → debe abrir `*.scm.azurewebsites.net` sin 503.

Si Kudu abre, el workflow de zip deploy en `.github/workflows/deploy-azure-functions.yml` tiene muchas más probabilidades de éxito.

## Repo

- https://github.com/Dev-InSoft-web/lab-langgraph  
- Workflow corregido (sin `webapps-deploy` + `slot-name`): ver `DEPLOY-AZURE.md`.
