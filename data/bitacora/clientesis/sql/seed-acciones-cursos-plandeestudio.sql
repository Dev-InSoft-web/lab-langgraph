-- Capacitación · Seguridad: alta de acciones extendidas para Cursos y PlanDeEstudio
--
-- Los catálogos `Cursos` y `PlanDeEstudio` ya tienen registradas las acciones
-- Compartir, Crear, Exportar, Listar, Modificar, Verificar y Visualizar para
-- el rol INGSENIOR del grupo INGCP del tercero 810000630. Faltan las acciones
-- extendidas que el resto de catálogos maestros (p. ej. `Recursos`) sí trae:
--   Consolidar, Duplicar, Eliminar, Recodificar
--
-- Sin estas filas el JWT del usuario no incluye `bAllowed.{accion}=true` para
-- esos recursos, por lo que el grid del catálogo deshabilita los botones
-- Verificar / Duplicar / Recodificar / Consolidar (Eliminar también queda
-- bloqueado por la misma razón).
--
-- Esta migración es idempotente: cada INSERT verifica con NOT EXISTS sobre
-- las columnas de la clave (ITERCERO, ISYSRECURSO, IACCION, IGRUPO, IROL).
-- Termina con un SELECT de verificación de las filas afectadas.

SET NOCOUNT ON;

DECLARE @ITERCERO   VARCHAR(50) = '810000630';
DECLARE @IGRUPO     VARCHAR(50) = 'INGCP';
DECLARE @IROL       VARCHAR(50) = 'INGSENIOR';
DECLARE @VALOR      VARCHAR(50) = 'true';

;WITH NUEVAS AS (
    SELECT ISYSRECURSO, IACCION
    FROM (VALUES
        ('Cursos',        'Consolidar'),
        ('Cursos',        'Duplicar'),
        ('Cursos',        'Eliminar'),
        ('Cursos',        'Recodificar'),
        ('PlanDeEstudio', 'Consolidar'),
        ('PlanDeEstudio', 'Duplicar'),
        ('PlanDeEstudio', 'Eliminar'),
        ('PlanDeEstudio', 'Recodificar')
    ) AS V(ISYSRECURSO, IACCION)
)
INSERT INTO SEG_ACCIONESXROL (ITERCERO, ISYSRECURSO, IACCION, IGRUPO, IROL, VALOR)
SELECT @ITERCERO, N.ISYSRECURSO, N.IACCION, @IGRUPO, @IROL, @VALOR
FROM NUEVAS N
WHERE NOT EXISTS (
    SELECT 1
    FROM SEG_ACCIONESXROL A
    WHERE A.ITERCERO    = @ITERCERO
      AND A.ISYSRECURSO = N.ISYSRECURSO
      AND A.IACCION     = N.IACCION
      AND A.IGRUPO      = @IGRUPO
      AND A.IROL        = @IROL
);

SELECT ITERCERO, ISYSRECURSO, IACCION, IGRUPO, IROL, VALOR
FROM SEG_ACCIONESXROL
WHERE ITERCERO = @ITERCERO
  AND IGRUPO   = @IGRUPO
  AND IROL     = @IROL
  AND ISYSRECURSO IN ('Cursos', 'PlanDeEstudio')
ORDER BY ISYSRECURSO, IACCION;
