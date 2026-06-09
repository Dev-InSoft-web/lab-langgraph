### Fase 3 — Drop `CAPAC_PLANES_CURSOS.IPLANPADRE`

Elimina de forma idempotente FKs, índices y la columna `IPLANPADRE` de `CAPAC_PLANES_CURSOS`. Solo ejecutar **después** de validar Fase 1 y Fase 2.

> Operación **destructiva e irreversible** sin backup de la columna.
