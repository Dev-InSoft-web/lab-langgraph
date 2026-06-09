# TK-1433968 · Objetos Prompt OpenAI obsoletos (`pmpt_*`)

**Solicitud:** Validar impacto del aviso *«Los objetos Prompt están quedando obsoletos»* y asegurar que el catálogo operativo viva en **INSTRUCCION** (MSSQL) + **paty.instruccion** (PG), no en IDs `pmpt_…` de OpenAI.

## En esta bitácora

Solo **nota de seguimiento** (sin SqlExec). El despliegue de textos Ultra es **TK-1433943** (MERGE MSSQL + sync PG).

## Siguiente paso

Inventariar en código PatyIA los `pmpt_*` aún referenciados (clasificador/macros) y planificar reemplazo por BD/config.
