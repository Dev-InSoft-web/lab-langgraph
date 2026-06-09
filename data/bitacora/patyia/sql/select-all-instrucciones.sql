-- =============================================================
-- SELECT INSTRUCCION (catálogo completo)
-- Base de datos: AYUDASCP_IA  |  Tabla: INSTRUCCION
-- Retorna las primeras 1000 filas del catálogo de instrucciones.
-- Compatible con /api/patyia/db/exec (sin USE / sin GO).
-- =============================================================

SET NOCOUNT ON;

SELECT TOP (1000)
	[IINSTRUCCION],
	[NINSTRUCCION],
	[MODELO],
	[INSTRUCCION],
	[DESCRIPCION],
	[VERSION],
	[BACTIVO],
	[FHINI],
	[FHFIN]
FROM [dbo].[INSTRUCCION]
ORDER BY [IINSTRUCCION] ASC;
