# Columnas de auditoría · CAPAC_CURSOS / CAPAC_PLANES_ESTUDIO

Garantiza el conjunto de columnas de auditoría en las tablas de Capacitación.

- Tablas objetivo: `CAPAC_CURSOS`, `CAPAC_PLANES_ESTUDIO`.
- Conjunto verificado en cada tabla:
  - `IUSUARIOCRE`, `IAPPCRE`, `IPCRE`, `FHCRE` (`DEFAULT GETDATE()`).
  - `IUSUARIOULT`, `IAPPULT`, `IPULT`, `FHULT` (`DEFAULT GETDATE()`).
- Idempotente: cada `ALTER TABLE … ADD` está envuelto en una verificación contra `sys.columns`. Si la columna ya existe se omite (`-- [ok] …`); si la tabla no existe se omite (`-- [skip] …`).
- Las constraints de default toman el nombre `DF_<tabla>_<columna>` para que queden identificables y se puedan dropear si en el futuro se cambia el default.
