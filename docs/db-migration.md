# PostgreSQL · lab-langgraph (única BD)

**lab-langgraph no se conecta ni manipula SQL Server / PatyIA MSSQL.**  
Todo el runtime (RAG, conversaciones, agentes, prompts) usa solo `DATABASE_URL` (PostgreSQL).

## Esquema `paty`

```powershell
cd ISA-DOC
npm run lab:db:apply-schema
```

- `db/schema/001_extensions.sql` — `vector`, `pgcrypto`
- `db/schema/002_patyia.sql` — conversaciones, turnos, instrucciones, corpus RAG

## Prompts (desde ISA-DOC, sin SSMS)

Autoría en git: `ISA-DOC/.../050-prompts/catalog/Ultra/`.

```powershell
cd ISA-DOC
npm run lab:patyia:sync-prompts
```

Carga `PATY_BASE` + 13 agentes en `paty.instruccion` y corpus en `paty.tdconsulta_corpus`.

## Operación

| Recurso | Tabla PG |
| --- | --- |
| Chat | `paty.conversaciones`, `paty.conversacion_turnos` |
| Calificaciones | `paty.mensajes_calificados` |
| Agentes | `paty.instruccion` |
| Filtro RAG por tipo | `paty.tdconsulta_corpus` |
| Embeddings | tabla `PGVECTOR_COLLECTION` (p. ej. `fitdocs_v2`) |

## Histórico desde SSMS (fuera del lab)

Si necesitas volcar datos viejos de `AYUDASCP_IA`, hazlo con un **script de operaciones en ISA-DOC** o ETL externo — no desde este repo. Ver `ISA-DOC/scripts/lab-langgraph/README-migrate-patyia-pg.md` (opcional).
