# Auditoría · eliminar columnas en tablas que no las requieren

Las columnas de auditoría (`IUSUARIOCRE/ULT`, `IAPPCRE/ULT`, `IEQUIPOCRE/ULT`, `IPCRE/ULT`, `FHCRE/ULT`) se conservan **únicamente** en las entidades raíz `CAPAC_CURSOS` y `CAPAC_PLANES_ESTUDIO`, y en las tablas de historial `CAPAC_HISTORIALCURSO` / `CAPAC_HISTORIALPLANESTUDIO`.

- Tablas afectadas (se eliminan las 10 columnas de auditoría):
  - `CAPAC_DRIVERS`
  - `CAPAC_TEMAS`
  - `CAPAC_CURSOS_DE_PLANES_ESTUDIO`
  - `CAPAC_SEGURIDADES_CURSOS`
  - `CAPAC_PLANES_CURSOS`
  - `CAPAC_ATRIBUTOS_PLANES`
  - `CAPAC_ESTRUCTURAS_CURSOS`
- También se eliminan los índices `IX_CAPAC_CURSOS_DE_PLANES_ESTUDIO_FHCRE` y `IX_CAPAC_CURSOS_DE_PLANES_ESTUDIO_IUSUARIOCRE` si existen.
- Idempotente: cada columna se chequea en `sys.columns` y su `DEFAULT CONSTRAINT` (si existe) se elimina antes del `DROP COLUMN`.
