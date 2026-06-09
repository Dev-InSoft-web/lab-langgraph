-- =============================================================
-- DELETE INSTRUCCION sin contenido
-- Base de datos: AYUDASCP_IA  |  Tabla: INSTRUCCION
-- Borra filas cuya columna INSTRUCCION y DESCRIPCION están vacías
-- o nulas (típicamente premisas auto-insertadas por la rutina vieja
-- `generarPremisasInput` → `InsertarIInstrucciones`).
-- No toca registros con cuerpo de prompt o descripción funcional.
-- Compatible con /api/patyia/db/exec (sin USE / sin GO).
-- =============================================================

SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRAN;

-- Vista previa antes del borrado (lo que se va a eliminar)
SELECT
	[IINSTRUCCION],
	[NINSTRUCCION],
	[INSTRUCCION],
	[DESCRIPCION],
	[BACTIVO]
FROM [dbo].[INSTRUCCION]
WHERE (INSTRUCCION IS NULL OR LTRIM(RTRIM(INSTRUCCION)) = N'')
  AND (DESCRIPCION IS NULL OR LTRIM(RTRIM(DESCRIPCION)) = N'');

DELETE FROM [dbo].[INSTRUCCION]
WHERE (INSTRUCCION IS NULL OR LTRIM(RTRIM(INSTRUCCION)) = N'')
  AND (DESCRIPCION IS NULL OR LTRIM(RTRIM(DESCRIPCION)) = N'');

PRINT CONCAT('Filas eliminadas: ', @@ROWCOUNT);

COMMIT;
