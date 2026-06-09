### Fase 5 — Limpiar audit fields de migración

Vacía (`NULL`) las columnas `IUSUARIOCRE`, `IAPPCRE`, `IUSUARIOULT` e `IAPPULT` en `CAPAC_ATRIBUTOS_PLANES` cuando contengan los valores que dejó la migración (`migration-iplanpadre` / `ISA-DOC`). Las filas se conservan; sólo se vacían esas columnas para que el dato de auditoría quede limpio antes de operar en producción.
