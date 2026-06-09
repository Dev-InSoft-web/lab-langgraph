-- =====================================================================
-- Marca BACTIVO = 1 para todas las filas en CAPAC_CURSOS.
-- Idempotente: solo afecta filas que aún no estén activas.
-- =====================================================================

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID('CAPAC_CURSOS', 'U') IS NULL
BEGIN
    PRINT 'CAPAC_CURSOS no existe en esta base de datos. Operación omitida.';
END
ELSE
BEGIN
    UPDATE CAPAC_CURSOS
       SET BACTIVO = 1
     WHERE BACTIVO IS NULL OR BACTIVO <> 1;

    PRINT 'CAPAC_CURSOS · filas afectadas: ' + CAST(@@ROWCOUNT AS VARCHAR(20));
END
