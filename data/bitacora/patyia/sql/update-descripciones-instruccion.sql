SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRAN;


UPDATE i
SET i.descripcion = v.descripcion
FROM INSTRUCCION i
INNER JOIN (VALUES
	(N'ASESORIA_PERSONALIZADA',     N'Casos específicos de la empresa del usuario, validación de datos particulares o análisis que requiere acceso a información interna o contexto que el asistente no posee.'),
	(N'COMERCIAL',                  N'Consultas comerciales sobre precios, licencias, funcionalidades, módulos, adquisición del sistema o contacto con el área comercial.'),
	(N'CONSULTA_NORMATIVA_NEGOCIO', N'Consultas de normativa legal, tributaria, contable o laboral. Evita interpretaciones y redirige a fuentes oficiales o asesores especializados.'),
	(N'ERROR_ACCESO',               N'Problemas de acceso al sistema: inicio de sesión, usuarios bloqueados, contraseñas, licencias o autenticación.'),
	(N'ERROR_CONFIGURACION',        N'Falsos errores originados por configuraciones incompletas, uso incorrecto, falta de permisos o interpretación errónea del comportamiento esperado.'),
	(N'ERROR_DIAN',                 N'Rechazos o errores en validaciones de la DIAN. Identifica si corresponde a una regla documentada o redirige a soporte.'),
	(N'ERROR_TECNICO',              N'Fallas técnicas reportadas (cierres inesperados, bloqueos, errores internos, accesos denegados) que no admiten diagnóstico funcional desde el asistente.'),
	(N'FUERA_DE_ALCANCE_TECNICO',   N'Solicitudes de desarrollo técnico, programación, integraciones, APIs o SQL fuera del alcance funcional documentado de ContaPyme.'),
	(N'INTERPRETACION_RESULTADO',   N'Explicación de por qué el sistema generó un resultado específico (valores, saldos, cálculos, asientos) relacionándolo con configuraciones y procesos documentados.'),
	(N'PASO_A_PASO',                N'Guía operativa paso a paso para ejecutar un proceso dentro de ContaPyme, respetando estructura, orden y contenido de las fuentes recuperadas.'),
	(N'REQUIERE_CONTEXTO',          N'Solicitud de información adicional cuando el clasificador no logra identificar con precisión el proceso, módulo, documento o acción requerida.'),
	(N'SALUDO_OTRO',                N'Saludos, agradecimientos, despedidas o mensajes sin intención funcional. Respuesta natural, cercana y amable.'),
	(N'SOLICITUD_NO_PERMITIDA',     N'Solicitudes que vulneran políticas de seguridad, privacidad, normativa o buenas prácticas. Rechazo respetuoso, claro y firme.')
) AS v (iinstruccion, descripcion)
	ON v.iinstruccion = i.iinstruccion;

COMMIT;
