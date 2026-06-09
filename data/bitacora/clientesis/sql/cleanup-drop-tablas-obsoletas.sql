-- =====================================================================
-- Limpieza · Eliminar tablas obsoletas
-- ---------------------------------------------------------------------
-- CAPAC_TEMAS y CAPAC_PERMISOS ya no se usan con esas nomenclaturas.
-- Idempotente: solo dropea si la tabla existe.
-- =====================================================================
IF OBJECT_ID('CAPAC_TEMAS', 'U') IS NOT NULL
    DROP TABLE CAPAC_TEMAS;

IF OBJECT_ID('CAPAC_PERMISOS', 'U') IS NOT NULL
    DROP TABLE CAPAC_PERMISOS;
