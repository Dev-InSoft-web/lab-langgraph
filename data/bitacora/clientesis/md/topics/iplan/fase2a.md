### Fase 2a — Rollback de IPLAN erróneos

Borra de `CAPAC_ATRIBUTOS_PLANES` **todas** las filas asociadas al atributo `iplanpadre` (cualquier driver). Pensada para deshacer una corrida previa incorrecta de la Fase 2 antes de re-ejecutarla. **No** toca `CAPAC_PLANES_CURSOS` ni `CAPAC_PLANDECURSO_OLD`.
