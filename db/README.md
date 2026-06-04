# PostgreSQL — dos bases (dominios por schema)

| Variable | BD Render | Schemas / tablas |
|----------|-----------|------------------|
| `DATABASE_URL` | **langlab** (operacional) | `paty.*` conversaciones, prompts, orquestador · `lab.*` catálogo API |
| `RAG_DATABASE_URL` | **rag_5hen** (solo RAG) | `rag.*` embeddings (`vec_contapyme`, `vec_fitdocs`, `index_run`) |

Todas las tablas quedan agrupadas por **prefijo de schema** (= dominio).

## Aplicar

```bash
# Ambas
npm run db:apply-schema

# Solo RAG
npm run db:apply-schema:rag
```

## Layout SQL

```
db/schema/ops/   → DATABASE_URL
db/schema/rag/   → RAG_DATABASE_URL
```

Los archivos en `db/schema/*.sql` (raíz) son legado; usar `ops/` y `rag/`.
