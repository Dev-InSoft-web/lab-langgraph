# Azure SignalR (lab-langgraph)

Socket en la nube sin servidor Node local: **Azure SignalR Service** en modo **Serverless**, enlazado a la misma Function App que el API REST.

## Recursos Azure

| Recurso | SKU lab | Límites orientativos |
| --- | --- | --- |
| SignalR | **Free_F1** | ~20 conexiones, ~20k mensajes/día |
| Function App | Consumption Y1 | negotiate + notify |

Se crean juntos con `.\scripts\azure\provision.ps1` (Bicep `infra/azure/main.bicep`).

Portal: [Microsoft Azure](https://portal.azure.com/) → grupo `rg-insoft-lab-langgraph` → recurso `sigr-insoft-lablanggraph`.

## Endpoints

| Método | Ruta | Quién |
| --- | --- | --- |
| GET/POST | `/api/signalr/negotiate?userId=` | **Front** — obtiene URL/token de conexión |
| POST | `/api/signalr/notify` | **Server** — envía aviso a clientes |

### Notify (server → clientes)

```http
POST /api/signalr/notify
Content-Type: application/json
x-lab-notify-token: <opcional si LAB_NOTIFY_TOKEN está definido>

{
  "event": "lab:notify",
  "payload": { "type": "index-done", "jobId": "yt-42" },
  "userId": "opcional-solo-ese-usuario"
}
```

Desde otro handler TypeScript puedes reutilizar el mismo contrato llamando al binding (ver `signalRNotify.ts`) o haciendo `fetch` interno a `/api/signalr/notify`.

## Front (navegador)

1. Cargar el SDK: [@microsoft/signalr](https://www.npmjs.com/package/@microsoft/signalr) (CDN o bundle).
2. `frontend/signalr-lab.js` + `config.js`:

```html
<script src="https://cdn.jsdelivr.net/npm/@microsoft/signalr@8/dist/browser/signalr.min.js"></script>
<script src="config.js"></script>
<script src="signalr-lab.js"></script>
<script>
  (async () => {
    const client = await LabSignalR.connect({
      apiBase: window.FITDOCS_API_BASE,
      userId: "mi-sesion",
    });
    client.on("lab:notify", (p) => console.log("aviso", p));
  })();
</script>
```

`FITDOCS_API_BASE` en producción: `https://<function-app>.azurewebsites.net/api`.

## Variables

| Setting | Uso |
| --- | --- |
| `AzureSignalRConnectionString` | Connection string del recurso SignalR (Bicep la inyecta) |
| `SIGNALR_HUB_NAME` | Hub, default `lab` |
| `LAB_NOTIFY_TOKEN` | Si se define, obligatorio en `POST /api/signalr/notify` |

## Local

1. Crear SignalR en Azure (Free) aunque el Functions host sea local.
2. Pegar connection string en `local.settings.json`.
3. `AzureWebJobsStorage`: `UseDevelopmentStorage=true` con [Azurite](https://learn.microsoft.com/azure/storage/common/storage-use-azurite) (requerido por el binding SignalR en local).

## ISA-DOC

En el cliente del lab (Svelte/Astro), apuntar negotiate a `PUBLIC_LAB_LANGGRAPH_URL + '/signalr/negotiate'`. No hace falta un proceso socket en la máquina del desarrollador.

Guía de despliegue: [DEPLOY-AZURE.md](./DEPLOY-AZURE.md).
