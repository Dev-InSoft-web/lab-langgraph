-- =====================================================================
-- Fase 5 · Vaciar audit fields dejados por la migración
-- ---------------------------------------------------------------------
-- Pone a NULL las columnas IUSUARIOCRE / IAPPCRE / IUSUARIOULT / IAPPULT
-- en CAPAC_ATRIBUTOS_PLANES cuando contengan los marcadores que dejó
-- la Fase 2 ('migration-iplanpadre' / 'ISA-DOC'). Las filas se conservan;
-- sólo se limpian esas columnas. Idempotente.
-- =====================================================================
SET XACT_ABORT ON;
BEGIN TRAN;

UPDATE CAPAC_ATRIBUTOS_PLANES
SET
    IUSUARIOCRE = CASE WHEN IUSUARIOCRE IN (N'migration-iplanpadre', N'ISA-DOC') THEN NULL ELSE IUSUARIOCRE END,
    IAPPCRE     = CASE WHEN IAPPCRE     IN (N'migration-iplanpadre', N'ISA-DOC') THEN NULL ELSE IAPPCRE     END,
    IUSUARIOULT = CASE WHEN IUSUARIOULT IN (N'migration-iplanpadre', N'ISA-DOC') THEN NULL ELSE IUSUARIOULT END,
    IAPPULT     = CASE WHEN IAPPULT     IN (N'migration-iplanpadre', N'ISA-DOC') THEN NULL ELSE IAPPULT     END
WHERE
       IUSUARIOCRE IN (N'migration-iplanpadre', N'ISA-DOC')
    OR IAPPCRE     IN (N'migration-iplanpadre', N'ISA-DOC')
    OR IUSUARIOULT IN (N'migration-iplanpadre', N'ISA-DOC')
    OR IAPPULT     IN (N'migration-iplanpadre', N'ISA-DOC');

COMMIT TRAN;
