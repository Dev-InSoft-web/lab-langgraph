## Limpieza de datos de prueba (`CleanupTestDataMigration.svelte`)

Elimina filas de prueba creadas manualmente durante el desarrollo previo:

- **Conserva** únicamente los drivers reales `IDRIVER` ∈ {1, 2, 3}.
- **Limpia** además todo `IATRIBUTO` 9xx tanto en `CAPAC_ATRIBUTOS_PLANES` como en `CAPAC_ATRIBUTOS_X_DRIVERS`.
- **Idempotente:** si las filas ya no existen, no afecta el resto.

El SQL ejecutable (`DELETE` en orden de dependencias dentro de un `BEGIN TRAN`) está disponible en el siguiente bloque ejecutable.
