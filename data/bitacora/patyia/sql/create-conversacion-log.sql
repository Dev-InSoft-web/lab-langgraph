-- CONVERSACION_LOG · DDL (AYUDASCP_IA_STAGING, solo creación de tabla)
-- AGENTES: sin constraints (ver .cursor/rules/patyia-sql-ddl.mdc y sql/README.md)
-- JSON como logs/conversaciones/conv-*.json · /api/patyia/db/exec

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID(N'dbo.CONVERSACION_LOG', N'U') IS NULL
BEGIN
	CREATE TABLE [dbo].[CONVERSACION_LOG] (
		[ICONVERSACION] BIGINT NOT NULL,
		[CONTENT]       NVARCHAR(MAX) NOT NULL
	);
END;

SELECT c.name AS columna, ty.name AS tipo, c.max_length, c.is_nullable
FROM sys.tables t
INNER JOIN sys.columns c ON c.object_id = t.object_id
INNER JOIN sys.types ty ON ty.user_type_id = c.user_type_id
WHERE t.name = N'CONVERSACION_LOG'
ORDER BY c.column_id;
