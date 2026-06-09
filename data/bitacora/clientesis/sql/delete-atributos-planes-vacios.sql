-- Capacitación · CAPAC_ATRIBUTOS_PLANES · Limpieza de filas sin valor
--
-- Elimina todas las filas cuyo `VALOR` está vacío, en blanco o NULL.
-- Se consideran vacíos:
--   - NULL
--   - cadena vacía ''
--   - cadenas formadas únicamente por espacios, tabuladores o saltos de línea
--
-- Idempotente: el SELECT final permite verificar que ya no quedan filas vacías.

SET NOCOUNT ON;

DELETE FROM CAPAC_ATRIBUTOS_PLANES
WHERE VALOR IS NULL
   OR LTRIM(RTRIM(REPLACE(REPLACE(REPLACE(VALOR, CHAR(9), ''), CHAR(10), ''), CHAR(13), ''))) = '';

SELECT COUNT(*) AS filas_vacias_restantes
FROM CAPAC_ATRIBUTOS_PLANES
WHERE VALOR IS NULL
   OR LTRIM(RTRIM(REPLACE(REPLACE(REPLACE(VALOR, CHAR(9), ''), CHAR(10), ''), CHAR(13), ''))) = '';
