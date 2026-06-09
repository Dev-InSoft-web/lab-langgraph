# Datos persistentes del backend (respaldo local)

**Runtime en Azure:** solo consulta **PostgreSQL**. Esta carpeta alimenta migraciones (`npm run db:sync-runtime-data`), no el servidor en producción.

Espejo JSON opcional en local: `LAB_DATA_MIRROR=true`.

| Ruta | Uso |
|------|-----|
| `api-catalog.json` | Respaldo local · runtime lee `BD_ISADOC.APICATALOG_MANIFEST` |
| `postman/` | Fuente build → `catalog:build` → PG |
| `patyia/prompts/catalog/` | Respaldo MD · runtime lee `BD_LANGLAB.INSTRUCCION` (`?refresh=1` sincroniza) |
| `patyia/caches/` | Respaldo JSON · runtime lee `BD_ISADOC.ENTITY_ROW` (patyia/caches/*) |
| `bitacora/revisado.json` | Respaldo · runtime lee `BD_ISADOC.BITACORA_REVISADO` |
| `openai-storage/` | Respaldo JSON · runtime lee `BD_ISADOC.ENTITY_ROW` (isa-doc/openai-storage/*) |
| `clientesis-schema/` | Árbol tablas y columnas |
| `codegen/`, `sql/` | Editor SQL / DER |
| `vectorize/` | Corpus RAG (YouTube, gobierno, PDFs) |

```bash
npm run data:migrate-from-isa   # copiar desde ISA-DOC (opcional)
npm run catalog:build
npm run catalog:sync-pg         # opcional: PostgreSQL
```

Ver `docs/ARCHITECTURE-BACK-FRONT.md` y `docs/PERSISTENCE-INVENTORY.md`.
