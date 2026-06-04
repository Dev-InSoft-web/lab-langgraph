# Nomenclatura PostgreSQL (INSOFT / ispgen)

Objetivo: alinear lab-langgraph con convenciones ispgen para que la migración desde npm general requiera pocos renombres.

## Esquemas (`BD_` lógico)

| Esquema PG | Dominio |
| --- | --- |
| `bd_paty` | PatyIA operacional (prompts, conversaciones, locks de turno) |
| `bd_lab` | Catálogo maestro, `entity_row` isa-doc/patyia, orquestador, bitácora revisado |
| `bd_clientesis` | `cis_entity_row` (proyecto lógico clientesis) |
| `bd_rag` | Vectores RAG (`rag_vec_*`) |

Los esquemas legacy `paty`, `lab`, `clientesis`, `rag` pueden coexistir hasta aplicar `013_migrate_legacy_to_bd.sql`.

## Tablas

- Prefijo de dominio + nombre descriptivo, con `_` permitido en el nombre de tabla.
- Ejemplos: `paty_instruccion`, `lab_entity_row`, `cis_entity_row`, `lab_bitacora_revisado`.

## Columnas

- **Sin guiones bajos** en nombres de columna (ej. `nombreusuario`, `fhultact`, `keylabel`, `projectslug`).
- Identificadores con prefijo **`I`**: `iconversacion`, `iinstruccion`, `iturno`, `ilease`, `iid` (catálogo).
- Fechas: `fhcre`, `fhultact` (no `created_at` / `updated_at`).
- Booleanos: prefijo **`b`**: `benabled`, `bchecked`, `bjailbreak`.

## TypeScript

Constantes centralizadas en `src/lib/db/pg-identifiers.ts` (`PG_SCHEMA_*`, `Q_*`, `COL_ER`, `COL_REV`).

Los tipos de dominio en TS pueden seguir snake_case (`project_slug`, `key_label`); el mapeo a columnas PG ocurre en repositorios.

## Comandos

```bash
npm run db:apply-pg-ops   # aplica db/schema/ops/*.sql (incluye 013)
npm run catalog:sql:gen   # regenera 009 con bd_lab.lab_entity_definition
```

## Referencia rápida (Paty)

| Antes | Después |
| --- | --- |
| `paty.instruccion` | `bd_paty.paty_instruccion` |
| `paty.conversaciones` | `bd_paty.paty_conversacion` |
| `paty.conversacion_turnos` | `bd_paty.paty_conversacion_turno` |
| `lab.entity_row` | `bd_lab.lab_entity_row` |
| `lab.bitacora_revisado` | `bd_lab.lab_bitacora_revisado` |
