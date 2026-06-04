# Orquestador lab (PostgreSQL + Azure Functions)

Estado persistente en Render PG para apps volátiles (Azure Functions, scripts ISA-DOC).

## Tablas

- `paty.lab_api_key_slot` — cooldown por `(provider, capability, key_label)`
- `paty.lab_orchestrator_lease` — leases activos

## API (`http://127.0.0.1:5500/api`)

| Método | Ruta | Body / query |
|--------|------|----------------|
| GET | `orchestrator/status` | `?capability=whisper` |
| POST | `orchestrator/sync-keys` | `{ "capability": "whisper" }` opcional |
| POST | `orchestrator/lease` | `{ "capability": "whisper", "provider": "groq" }` |
| POST | `orchestrator/release` | `{ "leaseId", "ok", "errorMessage" }` |
| POST | `youtube/whisper/transcribe` | `{ "audioPath": "C:\\...\\file.mp3", "videoId": "abc" }` |
| POST | `youtube/proofread` | `?videoId=&corpusJsonPath=C:\\...\\vid.json` |

Las API keys **no** salen del servidor; solo `keyLabel` y `keySuffix` en respuestas.

## ISA-DOC (solo cliente)

```env
# secrets/patyia/lab-client.env — sin API keys
LAB_LANGGRAPH_URL=http://127.0.0.1:5500
```

Proofread y Whisper usan `/api/tools/*`. El orquestador PG hace turno entre keys y proveedores (Groq → Cerebras → MiniMax) según límites.

## Cascada proofread (servidor)

`invokeProofreadWithFallback` → `runCapabilityCascade` por proveedor con leases en `paty.lab_api_key_slot`.
