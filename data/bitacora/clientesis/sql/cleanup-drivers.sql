-- =====================================================================
-- Limpieza · Drivers de prueba (conservar solo IDRIVER 1, 2, 3)
-- ---------------------------------------------------------------------
-- Elimina drivers con IDRIVER = 0 o IDRIVER > 3 y todas sus filas
-- dependientes en CAPAC_ATRIBUTOS_X_DRIVERS. Los IATRIBUTO de prueba
-- 901..999 se borran de paso (en CAPAC_ATRIBUTOS_PLANES y luego en
-- CAPAC_ATRIBUTOS_X_DRIVERS) por si quedaran huérfanos.
-- Orden: dependencias antes que CAPAC_DRIVERS.
-- =====================================================================
SET XACT_ABORT ON;
BEGIN TRAN;

-- 1) Valores en CAPAC_ATRIBUTOS_PLANES con atributos de prueba 9xx
DELETE FROM CAPAC_ATRIBUTOS_PLANES
WHERE IATRIBUTO BETWEEN 900 AND 999;

-- 2) Filas en CAPAC_ATRIBUTOS_X_DRIVERS de drivers que se eliminarán
DELETE FROM CAPAC_ATRIBUTOS_X_DRIVERS
WHERE IDRIVER = 0 OR IDRIVER > 3;

-- 3) Atributos de prueba residuales (9xx) en cualquier driver
DELETE FROM CAPAC_ATRIBUTOS_X_DRIVERS
WHERE IATRIBUTO BETWEEN 900 AND 999;

-- 4) Drivers de prueba
DELETE FROM CAPAC_DRIVERS
WHERE IDRIVER = 0 OR IDRIVER > 3;

COMMIT TRAN;
