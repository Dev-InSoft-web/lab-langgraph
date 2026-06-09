### Fase 2a — Rollback de valores Imagen / Documento

Borra de `CAPAC_ATRIBUTOS_PLANES` **todas** las filas asociadas a los atributos `Imagen del profesor` y `Documento` (en cualquier driver). Pensada para deshacer una corrida previa incorrecta de la Fase 2b/2c antes de re-ejecutar. **No** toca `CAPAC_PLANDECURSO_OLD` ni `CAPAC_ATRIBUTOS_X_DRIVERS`.
