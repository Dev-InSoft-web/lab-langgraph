-- Capacitación · Reemplaza códigos legacy de TTDriverRecurso por su valor numérico
-- en CAPAC_ATRIBUTOS_PLANES.VALOR para IATRIBUTO = 3.
--
-- Mapeo (según comentarios del enum TTDriverRecurso en ISP-ClientesIS):
--   FULL_NOMBRE_DESCRIPCION       -> 1   ('Lista con imagen pequeña')
--   MINI_DESCRIP_COMPLETA_PUR     -> 2   ('Tarjeta con información completa')
--   MINI_FULL_INFO                -> 2   (consolidado en 2)
--   MINI_NOMBRE_DESCRIPCION_VER   -> 3   ('Tarjeta solo con título')
--   MINI_DESCRIP_COMPLETA_VER     -> 3   (consolidado en 3)
--   GRANDE_FULL                   -> 4   ('Lista con imagen grande')
--   IMG_GRANDE_INFOPROFESOR       -> 4   (consolidado en 4)
--   SOLODECRIPCION_IMG / SOLODESCRIPCION_IMG -> 5  ('Lista pequeño')
--
-- Idempotente: tras correr una vez, los valores ya numéricos no son alcanzados
-- por los WHERE basados en los códigos legacy.

SET NOCOUNT ON;

UPDATE CAPAC_ATRIBUTOS_PLANES
SET VALOR = '1'
WHERE IATRIBUTO = 3 AND VALOR = 'FULL_NOMBRE_DESCRIPCION';

UPDATE CAPAC_ATRIBUTOS_PLANES
SET VALOR = '2'
WHERE IATRIBUTO = 3 AND VALOR IN ('MINI_DESCRIP_COMPLETA_PUR', 'MINI_FULL_INFO');

UPDATE CAPAC_ATRIBUTOS_PLANES
SET VALOR = '3'
WHERE IATRIBUTO = 3 AND VALOR IN ('MINI_NOMBRE_DESCRIPCION_VER', 'MINI_DESCRIP_COMPLETA_VER');

UPDATE CAPAC_ATRIBUTOS_PLANES
SET VALOR = '4'
WHERE IATRIBUTO = 3 AND VALOR IN ('GRANDE_FULL', 'IMG_GRANDE_INFOPROFESOR');

UPDATE CAPAC_ATRIBUTOS_PLANES
SET VALOR = '5'
WHERE IATRIBUTO = 3 AND VALOR IN ('SOLODECRIPCION_IMG', 'SOLODESCRIPCION_IMG');

-- Diagnóstico: filas que quedaron con un VALOR no numérico (revisar manualmente)
SELECT ICURSO, IPLAN, IATRIBUTO, VALOR
FROM CAPAC_ATRIBUTOS_PLANES
WHERE IATRIBUTO = 3
  AND VALOR IS NOT NULL
  AND ISNUMERIC(VALOR) = 0
ORDER BY ICURSO, IPLAN;
