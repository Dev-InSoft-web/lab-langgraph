# Nomenclatura PostgreSQL (INSOFT / ispgen)

## Esquemas (`BD_`)

| Esquema PG | Dominio |
| --- | --- |
| `BD_PATY` | PatyIA operacional |
| `BD_LAB` | Catálogo, entity store, orquestador, revisado, auth |
| `BD_CLIENTESIS` | `CIS_ENTITYROW` |
| `BD_RAG` | Vectores RAG |

En PostgreSQL se declaran con comillas: `"BD_LAB"."LAB_ENTITYROW"`.

## Tablas

- Prefijo de dominio + nombre en **MAYÚSCULAS** (ej. `LAB_ENTITYROW`, `PATY_CONVERSACION`).
- Sin guion bajo dentro del nombre salvo compuestos históricos ya migrados a una sola palabra (`PATY_TDCONSULTAINSTRUCCION`).

## Columnas

- **MAYÚSCULAS**, sin `_` (ej. `PARENTPROJECT`, `FHULTACT`, `PASSWORDHASH`).
- Identificadores con prefijo `I`: `ICONVERSACION`, `IINSTRUCCION`, `ITICKET`, `IIMGBB`, `IENTITYID`.
- Entity store: valor de ruta en `IENTITYID` (antes `pk`); padre en `IPARENTENTITYID`.
- Catálogo: claves de negocio en JSON con `I` (`ITICKET`, `IIMGBB`, `IENDPOINT`, …).
- Booleanos con prefijo `B`: `BENABLED`, `BCHECKED`.

## TypeScript

- `src/lib/db/pg-identifiers.ts` — constantes `PG_SCHEMA_*`, `Q_*`, `COL_*`.
- `src/lib/db/pg-quote.ts` — `pgQ()`, `sqlCol()` para SQL dinámico.
- Los `SELECT` hacia la app usan alias en minúsculas cuando hace falta (`COL_ER_ALIASES`).

## Migración (conserva filas)

```bash
npm run db:migrate-nomenclature
npm run db:migrate-ientityid
```

Renombra `bd_*` → `BD_*` y columnas a mayúsculas sin `_`. Idempotente si ya migró.

## Comandos

```bash
npm run db:apply-pg-ops
npm run auth:apply-pg
```
