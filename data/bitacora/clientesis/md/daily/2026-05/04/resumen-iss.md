# ISS ClientesIS-ContaPymeU

## Migraciones de datos (SQL ejecutadas contra la BD del ISS)
- **Limpieza de datos de prueba** (`CleanupTestDataMigration`): se consolidaron tres SQL idempotentes:
  - `sqlCleanup` — borra registros de prueba.
  - `sqlCleanupAtributosPlanes` — limpia `CAPAC_ATRIBUTOS_PLANES` huérfanos (se corrigió un parse error agregando `COMMIT TRAN;`).
  - `sqlDropTablasObsoletas` — elimina tablas obsoletas `CAPAC_TEMAS` y `CAPAC_PERMISOS`.
- **IPLANPADRE → atributo** (`IplanpadreToAtributoMigration`): fases 1, 2a, 2, 3 y 4 revisadas.
