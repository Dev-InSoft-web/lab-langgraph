-- =====================================================================
-- Fase 2a · Rollback · Eliminar IPLAN erróneos del atributo "iplanpadre"
-- ---------------------------------------------------------------------
-- Borra de CAPAC_ATRIBUTOS_PLANES TODAS las filas asociadas al atributo
-- "iplanpadre" (en cualquier driver). Pensado para deshacer una
-- ejecución previa incorrecta de la Fase 2 antes de re-ejecutarla.
-- No toca CAPAC_PLANES_CURSOS ni CAPAC_PLANDECURSO_OLD.
-- =====================================================================
SET XACT_ABORT ON;
BEGIN TRAN;

DECLARE @nAtributo NVARCHAR(64) = 'iplanpadre';

DELETE p
FROM CAPAC_ATRIBUTOS_PLANES p
JOIN CAPAC_ATRIBUTOS_X_DRIVERS x ON x.IATRIBUTO = p.IATRIBUTO
WHERE x.NATRIBUTO = @nAtributo;

COMMIT TRAN;
