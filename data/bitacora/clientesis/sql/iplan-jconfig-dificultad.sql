-- =====================================================================
-- Fase 4 · JConfig para atributos de dificultad → select B / M / A
-- ---------------------------------------------------------------------
-- Setea JCONFIG = {"options":["B","M","A"]} en todo atributo cuyo
-- NATRIBUTO contenga "dificultad" (case-insensitive) y que aún no
-- tenga options definidas.
-- =====================================================================
SET XACT_ABORT ON;
BEGIN TRAN;

UPDATE CAPAC_ATRIBUTOS_X_DRIVERS
SET JCONFIG = N'{"options":["B","M","A"]}'
WHERE LOWER(NATRIBUTO) LIKE N'%dificultad%'
  AND (JCONFIG IS NULL OR JCONFIG NOT LIKE N'%"options"%');

COMMIT TRAN;
