# Nomenclatura PostgreSQL (INSOFT / ispgen)

## Esquemas (`BD_` = proyecto / producto)

| Esquema PG | Dominio |
| --- | --- |
| `BD_PATY` | PatyIA operacional (conversaciones, prompts) |
| `BD_LAB` | Catálogo, entity store, orquestador, revisado, auth |
| `BD_CLIENTESIS` | Entity store ClientesIS |
| `BD_RAG` | Vectores RAG |

En PostgreSQL: `"BD_LAB"."ENTITY_ENTITYROW"`.

**No** deben coexistir esquemas legacy (`paty`, `lab`, `clientesis`, `bd_*`). Tras migrar:

```bash
npm run db:migrate-nomenclature    # bd_* → BD_* (si aplica)
npm run db:migrate-entity-domain   # PATY_/LAB_/… → prefijo entidad
```

## Tablas — prefijo de **entidad**, no del esquema

El prefijo refleja el dominio de la entidad principal, **no** el esquema (`BD_PATY`, `BD_LAB`).

| Antes (incorrecto) | Correcto | Esquema |
| --- | --- | --- |
| `PATY_CONVERSACION` | `CONVERSACION_CONVERSACION` | `BD_PATY` |
| `PATY_CONVERSACIONTURNO` | `CONVERSACION_CONVERSACIONTURNO` | `BD_PATY` |
| `PATY_CONVERSACIONTURNOLOCK` | `CONVERSACION_CONVERSACIONTURNOLOCK` | `BD_PATY` |
| `PATY_INSTRUCCION` | `INSTRUCCION_INSTRUCCION` | `BD_PATY` |
| `PATY_TDCONSULTA` | `TDCONSULTA_TDCONSULTA` | `BD_PATY` |
| `LAB_ENTITYROW` | `ENTITY_ENTITYROW` | `BD_LAB` |
| `LAB_ENTITYDEFINITION` | `ENTITY_ENTITYDEFINITION` | `BD_LAB` |
| `LAB_AUTHUSER` | `AUTH_AUTHUSER` | `BD_LAB` |
| `CIS_ENTITYROW` | `ENTITY_ENTITYROW` | `BD_CLIENTESIS` |

### Tickets (sin tabla `TICKET_*`)

Los tickets viven en el **entity store** genérico:

- Tabla: `BD_LAB.ENTITY_ENTITYROW`
- Ruta: `project=isa-doc`, `page=tickets`, `entity=ticket`
- Catálogo: `BD_LAB.ENTITY_ENTITYDEFINITION` (seed `009_seed_entity_definitions.sql`)
- PK en JSON: `ITICKET`

```bash
npm run tickets:migrate-store   # staticRegistry → ENTITY_ENTITYROW
npm run catalog:sql:gen         # regenerar seed definiciones
```

## Columnas

- **MAYÚSCULAS**, sin `_` (ej. `PARENTPROJECT`, `FHULTACT`).
- Identificadores con prefijo `I`: `ICONVERSACION`, `ITICKET`, `IENTITYID`.
- Booleanos con prefijo `B`: `BENABLED`, `BCHECKED`.

## TypeScript

- `src/lib/db/pg-identifiers.ts` — constantes canónicas (`T_CONVERSACION_*`, `T_ENTITY_*`, …).
- Alias legacy: `Q_PATY_*`, `Q_LAB_*` apuntan a los nombres nuevos.
- `src/lib/db/entity-domain-rename-map.ts` — mapa de migración PG.

## Comandos

```bash
npm run db:apply-pg-ops
npm run db:migrate-entity-domain
npm run auth:apply-pg
npm run catalog:bootstrap
npm run tickets:migrate-store
```
