-- =====================================================================
-- Limpieza · CAPAC_ATRIBUTOS_PLANES (filas vacías o de prueba 9xx)
-- ---------------------------------------------------------------------
-- Elimina filas que no aportan valor:
--   * VALOR es NULL o cadena en blanco (LTRIM(RTRIM(VALOR)) = '').
--   * IATRIBUTO entre 900 y 999 (atributos sintéticos de prueba).
-- Idempotente: si no hay filas que cumplan el filtro, no afecta nada.
-- =====================================================================
SET XACT_ABORT ON;
BEGIN TRAN;

DELETE FROM CAPAC_ATRIBUTOS_PLANES
WHERE VALOR IS NULL
   OR LTRIM(RTRIM(CONVERT(NVARCHAR(MAX), VALOR))) = ''
   OR IATRIBUTO BETWEEN 900 AND 999;

COMMIT TRAN;
