-- =============================================================
-- UPDATE INSTRUCCION.NINSTRUCCION
-- Base de datos: AYUDASCP_IA  |  Tabla: INSTRUCCION
-- Actualiza los nombres semánticos en español (labels para el cliente).
-- Compatible con el endpoint /api/db/exec (sin GO / sin USE).
-- =============================================================

SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRAN;

UPDATE i
SET i.ninstruccion = v.nombre
FROM INSTRUCCION i
INNER JOIN (VALUES
	(N'ASESORIA_PERSONALIZADA',     N'Asesoría Personalizada'),
	(N'COMERCIAL',                  N'Comercial'),
	(N'CONSULTA_NORMATIVA_NEGOCIO', N'Consulta Normativa Negocio'),
	(N'ERROR_ACCESO',               N'Error Acceso'),
	(N'ERROR_CONFIGURACION',        N'Error Configuración'),
	(N'ERROR_DIAN',                 N'Error DIAN'),
	(N'ERROR_TECNICO',              N'Error Técnico'),
	(N'FUERA_DE_ALCANCE_TECNICO',   N'Fuera de Alcance Técnico'),
	(N'INTERPRETACION_RESULTADO',   N'Interpretación Resultado'),
	(N'PASO_A_PASO',                N'Paso a Paso'),
	(N'REQUIERE_CONTEXTO',          N'Requiere Contexto'),
	(N'SALUDO_OTRO',                N'Saludo Otro'),
	(N'SOLICITUD_NO_PERMITIDA',     N'Solicitud No Permitida')
) AS v (iinstruccion, nombre)
	ON v.iinstruccion = i.iinstruccion;

COMMIT;
