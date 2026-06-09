-- =====================================================================
-- Fase 1 · Sembrar atributo "iplanpadre" en cada driver
-- ---------------------------------------------------------------------
-- Crea (idempotente) una fila en CAPAC_ATRIBUTOS_X_DRIVERS por cada
-- driver existente, con NATRIBUTO = 'iplanpadre'. Este atributo
-- reemplaza la antigua columna CAPAC_PLANES_CURSOS.IPLANPADRE.
-- =====================================================================
SET XACT_ABORT ON;
BEGIN TRAN;

DECLARE @nAtributo NVARCHAR(64) = 'iplanpadre';
-- IATRIBUTO compartido entre drivers (mismo número en todas las filas, igual que el resto de atributos)
DECLARE @iAtributo BIGINT = ISNULL((SELECT MAX(IATRIBUTO) FROM CAPAC_ATRIBUTOS_X_DRIVERS WHERE IATRIBUTO < 100), 0) + 1;

INSERT INTO CAPAC_ATRIBUTOS_X_DRIVERS
    (IATRIBUTO, IDRIVER, NATRIBUTO, TDATRIBUTO, BREQUERIDO, QNIVEL, JCONFIG)
SELECT
    @iAtributo,
    d.IDRIVER,
    @nAtributo,
    1, -- TTDAtributo.Texto
    0,
    2,
    NULL
FROM CAPAC_DRIVERS d
WHERE NOT EXISTS (
    SELECT 1 FROM CAPAC_ATRIBUTOS_X_DRIVERS x
    WHERE x.IDRIVER = d.IDRIVER AND x.NATRIBUTO = @nAtributo
);

COMMIT TRAN;
