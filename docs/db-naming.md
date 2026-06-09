# Nomenclatura PostgreSQL (INSOFT / ispgen)

## Esquemas (`BD_` = proyecto / producto)

| Esquema PG | Dominio |
| --- | --- |
| `BD_LANGLAB` | **Único** ops LangLab: conversación, prompts, auth, orquestador |
| `BD_ISADOC` | Entity store ISA-DOC, catálogo API, revisado bitácora |
| `BD_RAG` | Vectores RAG |

| `BD_PATY` | **Alias histórico** del entity store — consolidar en `BD_ISADOC` |

`BD_LAB` es **alias histórico** de LangLab — **no crear tablas nuevas ahí**. Consolidar:

```bash
npm run db:consolidate-schemas   # 019 BD_LAB→BD_LANGLAB + 021 BD_PATY→BD_ISADOC
npm run db:consolidate-isadoc    # solo 021
```

Antes de DDL/SQL nuevo, auditar estado:

```bash
npm run db:nomenclature-status
npm run db:audit-tables
```

**No** deben coexistir esquemas legacy (`paty`, `lab`, `clientesis`, `bd_*`). Tras migrar:

```bash
npm run db:apply-pg-ops              # incluye renombres en 002_patyia.sql
npm run db:migrate-simplify-names    # alternativa manual idempotente
```

## Tablas — dominio + sufijo solo si hay varias tablas del dominio

Sin duplicar el dominio (`CONVERSACION`, no `CONVERSACION_CONVERSACION`).

| Legacy | Canónico | Esquema |
| --- | --- | --- |
| `paty_conversacion` / `PATY_CONVERSACION` | `CONVERSACION` | `BD_LANGLAB` |
| `paty_conversacion_turno` | `CONVERSACION_TURNO` | `BD_LANGLAB` |
| `paty_conversacion_turno_lock` | `CONVERSACION_TURNOLOCK` | `BD_LANGLAB` |
| `paty_instruccion` | `INSTRUCCION` | `BD_LANGLAB` |
| `paty_tdconsulta` / `TDCONSULTA*` | `CONVERSACION_TIPOCONSULTA` | `BD_LANGLAB` |
| `lab_entity_row` | `ENTITY_ROW` | `BD_ISADOC` |
| `lab_entity_definition` | `ENTITY_DEFINITION` | `BD_ISADOC` |
| `lab_auth_user` / `LAB_AUTHUSER` | `AUTH_USER` | `BD_LANGLAB` |
| `cis_entity_row` | `ENTITY_ROW` | `BD_CLIENTESIS` |

### Tickets (sin tabla `TICKET_*`)

Los tickets viven en el **entity store** genérico:

- Tabla: `BD_ISADOC.ENTITY_ROW`
- Ruta: `project=isa-doc`, `page=tickets`, `entity=ticket`
- Catálogo: `BD_ISADOC.ENTITY_DEFINITION` (seed `009_seed_entity_definitions.sql`)
- PK en JSON: `ITICKET`

```bash
npm run tickets:migrate-store   # staticRegistry → ENTITY_ROW
npm run catalog:sql:gen         # regenerar seed definiciones
```

## Columnas

- **MAYÚSCULAS**, sin `_` (ej. `PARENTPROJECT`, `FHULTACT`).
- Identificadores con prefijo `I`: `ICONVERSACION`, `ITICKET`, `IENTITYID`.
- Booleanos con prefijo `B`: `BENABLED`, `BCHECKED`.

## TypeScript

- `src/lib/db/pg-identifiers.ts` — constantes canónicas (`T_CONVERSACION`, `T_CONVERSACION_TURNO`, `T_ENTITY_ROW`, …).
- Alias legacy: `Q_PATY_*`, `Q_LAB_*` apuntan a los nombres canónicos.
- `src/lib/db/simplify-table-rename-map.ts` — mapa de migración PG.

## Comandos

```bash
npm run db:apply-pg-ops
npm run db:migrate-entity-domain
npm run auth:apply-pg
npm run catalog:bootstrap
npm run tickets:migrate-store
```
