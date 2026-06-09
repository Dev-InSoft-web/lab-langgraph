-- =====================================================================
-- Fase 2c · Migrar DOCUMENTODRIVER → "Documento"
-- ---------------------------------------------------------------------
-- Lee CAPAC_PLANDECURSO_OLD.DOCUMENTODRIVER (sólo no nulos / no vacíos)
-- y los inserta en CAPAC_ATRIBUTOS_PLANES referenciando el IATRIBUTO del
-- atributo "Documento" del driver del curso (CAPAC_CURSOS.IDRIVER).
--
-- Requiere haber ejecutado la Fase 1b (atributo "Documento" debe
-- existir en CAPAC_ATRIBUTOS_X_DRIVERS).
--
-- IPLAN del OLD viene en formato 6+ dígitos ('001002003') y se transforma
-- a notación con puntos ('1.2.3') para coincidir con CAPAC_PLANES_CURSOS.
-- Sólo procesa filas cuyo (ICURSO, IPLAN_dot) EXISTE en
-- CAPAC_PLANES_CURSOS.
-- Idempotente: PK lógica IPLAN+ICURSO+IATRIBUTO.
-- =====================================================================
SET XACT_ABORT ON;
BEGIN TRAN;

DECLARE @nAtributo NVARCHAR(64) = N'Documento';

;WITH posiciones AS (
    SELECT 1 AS pos UNION ALL SELECT 4  UNION ALL SELECT 7  UNION ALL
    SELECT 10        UNION ALL SELECT 13 UNION ALL SELECT 16 UNION ALL
    SELECT 19        UNION ALL SELECT 22 UNION ALL SELECT 25
), src AS (
    SELECT
        o.ICURSO,
        LTRIM(RTRIM(CONVERT(NVARCHAR(MAX), o.IPLAN))) AS IPLAN_RAW,
        LTRIM(RTRIM(CONVERT(NVARCHAR(MAX), o.DOCUMENTODRIVER))) AS VALOR_RAW,
        c.IDRIVER
    FROM CAPAC_PLANDECURSO_OLD o
    JOIN CAPAC_CURSOS c ON c.ICURSO = o.ICURSO
    WHERE o.DOCUMENTODRIVER IS NOT NULL
      AND LTRIM(RTRIM(CONVERT(NVARCHAR(MAX), o.DOCUMENTODRIVER))) <> ''
), transformed AS (
    SELECT
        s.ICURSO,
        s.IDRIVER,
        s.VALOR_RAW AS VALOR,
        CASE
            WHEN s.IPLAN_RAW NOT LIKE '%[^0-9]%' AND LEN(s.IPLAN_RAW) >= 3 AND LEN(s.IPLAN_RAW) % 3 = 0
            THEN STUFF((
                SELECT '.' + CAST(CAST(SUBSTRING(s.IPLAN_RAW, p.pos, 3) AS INT) AS VARCHAR(10))
                FROM posiciones p
                WHERE p.pos <= LEN(s.IPLAN_RAW)
                ORDER BY p.pos
                FOR XML PATH(''), TYPE
            ).value('.', 'NVARCHAR(MAX)'), 1, 1, '')
            ELSE s.IPLAN_RAW
        END AS IPLAN
    FROM src s
)
INSERT INTO CAPAC_ATRIBUTOS_PLANES
    (IPLAN, ICURSO, IATRIBUTO, BACTIVO, VALOR)
SELECT
    t.IPLAN, t.ICURSO, x.IATRIBUTO, 1, t.VALOR
FROM transformed t
JOIN CAPAC_PLANES_CURSOS pc ON pc.ICURSO = t.ICURSO AND pc.IPLAN = t.IPLAN
JOIN CAPAC_ATRIBUTOS_X_DRIVERS x
  ON x.IDRIVER = t.IDRIVER AND x.NATRIBUTO = @nAtributo
WHERE NOT EXISTS (
    SELECT 1 FROM CAPAC_ATRIBUTOS_PLANES p
    WHERE p.IPLAN = t.IPLAN AND p.ICURSO = t.ICURSO AND p.IATRIBUTO = x.IATRIBUTO
);

COMMIT TRAN;
