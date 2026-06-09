-- =============================================================
-- INSTRUCCION · MODELO = gpt-5-nano (todas las filas)
-- Compatible con /api/patyia/db/exec (sin GO)
-- =============================================================

SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRAN;

UPDATE dbo.INSTRUCCION
SET [MODELO] = N'gpt-5-nano';

COMMIT;
