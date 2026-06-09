-- =====================================================================
-- Fase 2a · Rollback · Borrar valores migrados de Imagen y Documento
-- ---------------------------------------------------------------------
-- Elimina de CAPAC_ATRIBUTOS_PLANES todas las filas asociadas a los
-- atributos "Imagen del profesor" y "Documento". Pensado para
-- deshacer la Fase 2 antes de re-ejecutarla. No toca CAPAC_PLANDECURSO_OLD
-- ni CAPAC_ATRIBUTOS_X_DRIVERS.
-- =====================================================================
SET XACT_ABORT ON;
BEGIN TRAN;

DELETE p
FROM CAPAC_ATRIBUTOS_PLANES p
JOIN CAPAC_ATRIBUTOS_X_DRIVERS x ON x.IATRIBUTO = p.IATRIBUTO
WHERE x.NATRIBUTO IN (N'Imagen del profesor', N'Documento');

COMMIT TRAN;
