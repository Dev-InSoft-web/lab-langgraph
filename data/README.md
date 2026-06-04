# Datos persistentes del backend

Todo lo que antes vivía en ISA-DOC para operar el lab está aquí.

| Ruta | Uso |
|------|-----|
| `api-catalog.json` | Manifiesto único Postman (runtime default) |
| `postman/` | Colecciones y environments fuente |
| `patyia/prompts/catalog/` | Prompts Ultra → sync PostgreSQL |
| `patyia/caches/` | Caches JSON conversaciones / identidades |
| `bitacora/revisado.json` | Estado bitácora |
| `openai-storage/` | OpenAI mirror (migrate con `--openai`) |
| `clientesis-schema/` | Árbol tablas y columnas |
| `codegen/`, `sql/` | Editor SQL / DER |
| `vectorize/` | Corpus RAG (YouTube, gobierno, PDFs) |

```bash
npm run data:migrate-from-isa   # copiar desde ISA-DOC (opcional)
npm run catalog:build
npm run catalog:sync-pg         # opcional: PostgreSQL
```

Ver `docs/ARCHITECTURE-BACK-FRONT.md` y `docs/PERSISTENCE-INVENTORY.md`.
