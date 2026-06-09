-- =====================================================================
-- Actualizar CAPAC_CURSOS.IDRIVER usando CAPAC_CURSOS_OLD.DRIVERSTRUCT
-- ---------------------------------------------------------------------
-- En CAPAC_CURSOS_OLD la columna DRIVERSTRUCT trae el NOMBRE del driver
-- (no el id). En CAPAC_CURSOS la columna IDRIVER debe ser el ID que vive
-- en CAPAC_DRIVERS. Este script resuelve el nombre → id por cada curso
-- y actualiza IDRIVER en CAPAC_CURSOS.
--
-- Reglas:
--  - Match exacto (case-sensitive según el COLLATE de la BD) entre
--    LTRIM(RTRIM(DRIVERSTRUCT)) y CAPAC_DRIVERS.NDRIVER.
--  - Si hay más de un driver con el mismo nombre, se toma el de menor
--    IDRIVER (TOP 1 ORDER BY IDRIVER).
--  - Sólo actualiza filas donde el IDRIVER actual difiere del resuelto
--    (idempotente).
--  - Filas con DRIVERSTRUCT vacío o sin match se ignoran (no se tocan).
--    Usa el script de diagnóstico previo para detectar pendientes.
-- =====================================================================
SET XACT_ABORT ON;
BEGIN TRAN;

;WITH resolved AS (
    SELECT
        c.ICURSO,
        c.IDRIVER AS CurrentIdriver,
        d.IDRIVER AS NewIdriver
    FROM CAPAC_CURSOS c
    JOIN CAPAC_CURSOS_OLD o ON o.ICURSO = c.ICURSO
    OUTER APPLY (
        SELECT TOP 1 dd.IDRIVER
        FROM CAPAC_DRIVERS dd
        WHERE dd.NDRIVER = LTRIM(RTRIM(o.DRIVERSTRUCT))
        ORDER BY dd.IDRIVER
    ) d
    WHERE o.DRIVERSTRUCT IS NOT NULL
      AND LTRIM(RTRIM(o.DRIVERSTRUCT)) <> ''
      AND d.IDRIVER IS NOT NULL
)
UPDATE c
SET c.IDRIVER = r.NewIdriver
FROM CAPAC_CURSOS c
JOIN resolved r ON r.ICURSO = c.ICURSO
WHERE ISNULL(c.IDRIVER, -1) <> r.NewIdriver;

DECLARE @rows INT = @@ROWCOUNT;
PRINT CONCAT(N'Filas actualizadas: ', @rows);

COMMIT TRAN;
