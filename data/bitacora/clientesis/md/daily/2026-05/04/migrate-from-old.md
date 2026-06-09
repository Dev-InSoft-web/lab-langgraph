## Migrar `{table}` desde `{old}`

Inserta filas en `{table}` **leyendo directamente la tabla OLD viva** en la BD,
sin pasar por una fotografía CSV. Es la ruta recomendada cuando aún existe
`{old}` y no quieres versionar un snapshot.

- **Idempotente**: si `{table}` ya tiene filas, no hace nada (avisa con `PRINT`).
- **Transaccional**: `SET XACT_ABORT ON` + `BEGIN/COMMIT TRAN`.
- **Overrides** (si aplica): se proyectan en el `SELECT` desde `src` (alias de
  la tabla OLD); por ejemplo, en `CAPAC_CURSOS` se resuelve `IDRIVER` por
  nombre (`DRIVERSTRUCT` → `CAPAC_DRIVERS.IDRIVER`).
- **Diferencia frente al CSV de arriba**: este script no necesita un archivo
  versionado; depende de que `{old}` siga existiendo y sea consistente.
