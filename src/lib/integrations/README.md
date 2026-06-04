# Catálogo API (backend autónomo)

Sin dependencia de ISA-DOC en runtime.

| Fuente | Variable |
|--------|----------|
| `data/api-catalog.json` | default |
| PostgreSQL `bd_lab.lab_api_catalog_manifest` | `API_CATALOG_SOURCE=postgres` |

## Regenerar

```bash
npm run postman:sync          # Documents → data/postman
npm run catalog:build
npm run catalog:sync-pg
```

## HTTP (front estático)

| Ruta | Uso |
|------|-----|
| `GET /api/agent/postman-ui?project=patyia` | Payload UI Postman |
| `GET /api/agent/manifest` | JSON completo |
| `POST /api/agent/task` | Plan / ejecutar |

Secretos: `secrets/patyia/lab-connections.env`, `secrets/tokens/*.json`.
