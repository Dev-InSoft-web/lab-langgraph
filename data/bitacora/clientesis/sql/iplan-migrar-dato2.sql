-- =====================================================================
-- Fase 2 · Migrar CAPAC_PLANDECURSO_OLD.DATO2 → CAPAC_ATRIBUTOS_PLANES
-- ---------------------------------------------------------------------
-- Sólo se conservan filas con DATO2 con valor (no NULL, no vacío trim).
-- IPLAN del OLD viene en 6-dígitos (ej. '055009'); CAPAC_PLANES_CURSOS
-- guarda el IPLAN ya en formato dot-notation ('55.9'), por lo que se
-- aplica la misma transformación (3 dígitos = 1 nivel) tanto al IPLAN
-- como al DATO2 antes de filtrar y cruzar contra la tabla viva.
-- Sólo procesa filas cuyo (ICURSO, IPLAN_dot) EXISTE en
-- CAPAC_PLANES_CURSOS.
-- Idempotente: omite filas ya migradas (PK lógica IPLAN+ICURSO+IATRIBUTO).
-- Pobla audit fields y BACTIVO=1.
-- =====================================================================
SET XACT_ABORT ON;
BEGIN TRAN;

DECLARE @nAtributo NVARCHAR(64) = 'iplanpadre';
DECLARE @user NVARCHAR(255) = N'migration-iplanpadre';
DECLARE @app  NVARCHAR(255) = N'ISA-DOC';
DECLARE @ip   NVARCHAR(255) = ISNULL(CONVERT(NVARCHAR(255), CONNECTIONPROPERTY('client_net_address')), N'127.0.0.1');

;WITH posiciones AS (
    SELECT 1 AS pos UNION ALL SELECT 4  UNION ALL SELECT 7  UNION ALL
    SELECT 10        UNION ALL SELECT 13 UNION ALL SELECT 16 UNION ALL
    SELECT 19        UNION ALL SELECT 22 UNION ALL SELECT 25
), src AS (
    SELECT
        o.ICURSO,
        LTRIM(RTRIM(CONVERT(NVARCHAR(MAX), o.IPLAN))) AS IPLAN_RAW,
        LTRIM(RTRIM(CONVERT(NVARCHAR(MAX), o.DATO2))) AS DATO2_RAW,
        c.IDRIVER
    FROM CAPAC_PLANDECURSO_OLD o
    JOIN CAPAC_CURSOS c ON c.ICURSO = o.ICURSO
    WHERE o.DATO2 IS NOT NULL
      AND LTRIM(RTRIM(CONVERT(NVARCHAR(MAX), o.DATO2))) <> ''
), transformed AS (
    SELECT
        s.ICURSO,
        s.IDRIVER,
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
        END AS IPLAN,
        CASE
            WHEN s.DATO2_RAW NOT LIKE '%[^0-9]%' AND LEN(s.DATO2_RAW) >= 3 AND LEN(s.DATO2_RAW) % 3 = 0
            THEN STUFF((
                SELECT '.' + CAST(CAST(SUBSTRING(s.DATO2_RAW, p.pos, 3) AS INT) AS VARCHAR(10))
                FROM posiciones p
                WHERE p.pos <= LEN(s.DATO2_RAW)
                ORDER BY p.pos
                FOR XML PATH(''), TYPE
            ).value('.', 'NVARCHAR(MAX)'), 1, 1, '')
            ELSE s.DATO2_RAW
        END AS VALOR
    FROM src s
)
INSERT INTO CAPAC_ATRIBUTOS_PLANES
    (IPLAN, ICURSO, IATRIBUTO, BACTIVO, VALOR,
     IUSUARIOCRE, IAPPCRE, IPCRE, FHCRE,
     IUSUARIOULT, IAPPULT, IPULT, FHULT)
SELECT
    t.IPLAN, t.ICURSO, x.IATRIBUTO, 1, t.VALOR,
    @user, @app, @ip, GETDATE(),
    @user, @app, @ip, GETDATE()
FROM transformed t
JOIN CAPAC_PLANES_CURSOS pc ON pc.ICURSO = t.ICURSO AND pc.IPLAN = t.IPLAN
JOIN CAPAC_ATRIBUTOS_X_DRIVERS x
  ON x.IDRIVER = t.IDRIVER AND x.NATRIBUTO = @nAtributo
WHERE t.VALOR IS NOT NULL
  AND LTRIM(RTRIM(t.VALOR)) <> ''
  AND NOT EXISTS (
    SELECT 1 FROM CAPAC_ATRIBUTOS_PLANES p
    WHERE p.IPLAN = t.IPLAN AND p.ICURSO = t.ICURSO AND p.IATRIBUTO = x.IATRIBUTO
);

COMMIT TRAN;
