---
name: pg-direct-exec
description: PostgreSQL en lab-langgraph/Render — ejecución directa sin confirmación UI. Contrasta con MSSQL (SqlExec + modal). Usar al aplicar DDL, sync prompts, schemas o DML en PG.
---

# PostgreSQL: ejecución directa (sin confirmación)

## Regla operativa

| Motor | Repositorio | Confirmación en UI |
| --- | --- | --- |
| **PostgreSQL** (Render: `bd_paty`, `bd_lab`, `bd_clientesis`, `bd_rag`) | lab-langgraph, ISA-DOC (sync PG) | **No** — ejecutar DDL/DML/scripts directamente |
| **MSSQL** (Paty / ClientesIS staging) | ISA-DOC | **Siempre** — `SqlExecCard` + `ConfirmDialog` |

Los agentes **no deben** pedir confirmación humana para cambios en PostgreSQL cuando el usuario pide aplicar schema, sync o mantenimiento PG. Usar `npm run`, `tsx` o `pool.query` según el caso.

## Antes de modificar SQL / DDL

**Obligatorio** revisar qué ya existe para no duplicar esquemas ni tablas:

```bash
npm run db:nomenclature-status   # esquemas BD_* vs legacy
npm run db:audit-tables          # tablas por esquema + columnas
```

Reglas:

- **`BD_LANGLAB`** = único esquema ops LangLab (conversación, instrucción, auth, orquestador). **`BD_LAB` no es un esquema nuevo** — consolidar con `npm run db:consolidate-schemas` si aún aparece en el cliente SQL.
- **`BD_ISADOC`** = único entity store (ENTITY_ROW, STORE_*, catálogo, revisado). **`BD_PATY` no es un esquema nuevo** — consolidar con `npm run db:consolidate-isadoc` y eliminar `BD_PATY` tras migrar datos.
- No crear `LAB_AUTHUSER` en `BD_LAB` si ya existe `AUTH_USER` en `BD_LANGLAB`.
- Tipo de consulta: una sola tabla `BD_LANGLAB.CONVERSACION_TIPOCONSULTA` (no `TDCONSULTA*`).
- Tras cambios de nomenclatura: `src/lib/db/pg-identifiers.ts` debe reflejar nombres canónicos.

## Comandos habituales (lab-langgraph)

```bash
npm run db:apply-pg-ops    # bd_paty + bd_lab + clientesis + 013 legacy→bd_*
npm run revisado:sync      # checks bitácora/TK → PG + JSON ISA-DOC
npm run db:prepare-store   # catálogo + seed entity_row
npm run catalog:sync-pg
npm run catalog:sql:gen    # regenera 009 con nomenclatura bd_lab
```

Checks de bitácora (`RevisadoCheck`): `bd_lab.lab_bitacora_revisado` (columna `revisadokey`, p. ej. `tickets.TK-1433943`, `2026-06-04.patyia.*`).

Credenciales: `local.settings.json` / `secrets/patyia/lab-databases.env` (`DATABASE_URL`, `CLIENTESIS_DATABASE_URL`).

Ver `docs/db-naming.md` para convenciones INSOFT (columnas sin `_`, ids con `I`, esquemas `bd_*`).

## Diseño de constraints en PG

- **Entity store** (`bd_lab.lab_entity_row`, `bd_clientesis.cis_entity_row`): sin FK; relaciones padre en `parentproject`, `parentpage`, `parententity`, `parentpk`.
- **Catálogo** (`bd_lab.lab_store_*`): sin FK entre tablas; `UNIQUE` en slugs permitido.
- **Paty conversación** (`bd_paty.paty_conversacion_turno_lock`, `paty_conversacion_turno_timing`): `iconversacion BIGINT` sin `REFERENCES`; limpieza en app.
- Migración `db/schema/ops/011_drop_pg_foreign_keys.sql` elimina FK heredadas en esquemas legacy y `bd_*`.

## Esquemas en la misma instancia Render

- `bd_paty` — PatyIA operacional
- `bd_lab` — catálogo maestro + `lab_entity_row` para `isa-doc` / `patyia`
- `bd_clientesis` — `cis_entity_row` solo para proyecto lógico `clientesis`
- `bd_rag` — embeddings

`CLIENTESIS_DATABASE_URL` puede apuntar a la misma BD que `DATABASE_URL`; el aislamiento es por **esquema**, no obligatoriamente por servidor.

## ISA-DOC

Sync prompts Paty → PG: `POST /api/patyia/prompts/sync-pg` (automático). Ver también `.cursor/rules/patyia-sql-ddl.mdc` en ISA-DOC (tabla MSSQL vs PG).
