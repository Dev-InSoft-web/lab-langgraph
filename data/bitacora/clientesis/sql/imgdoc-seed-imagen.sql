-- =====================================================================
-- Fase 1a · Sembrar atributo "Imagen del profesor" por driver
-- ---------------------------------------------------------------------
-- "Imagen del profesor" ya existe en algunos drivers. Reusamos su IATRIBUTO
-- y TDATRIBUTO para mantener el patrón compartido (mismo IATRIBUTO en
-- todos los drivers). Si no existiera en ningún driver todavía, se asigna
-- un IATRIBUTO nuevo con TDATRIBUTO=1 (texto/URL).
--
-- Idempotente: sólo inserta la fila por driver si todavía no existe.
-- =====================================================================
SET XACT_ABORT ON;
BEGIN TRAN;

DECLARE @nImg NVARCHAR(64) = N'Imagen del profesor';

-- Reusa IATRIBUTO existente o asigna el siguiente disponible (rango bajo).
DECLARE @iAtrImg BIGINT = (
    SELECT TOP 1 IATRIBUTO FROM CAPAC_ATRIBUTOS_X_DRIVERS WHERE NATRIBUTO = @nImg
);
DECLARE @tdImg INT = ISNULL((
    SELECT TOP 1 TDATRIBUTO FROM CAPAC_ATRIBUTOS_X_DRIVERS WHERE NATRIBUTO = @nImg
), 1);

IF @iAtrImg IS NULL
    SET @iAtrImg = ISNULL((SELECT MAX(IATRIBUTO) FROM CAPAC_ATRIBUTOS_X_DRIVERS WHERE IATRIBUTO < 100), 0) + 1;

INSERT INTO CAPAC_ATRIBUTOS_X_DRIVERS
    (IATRIBUTO, IDRIVER, NATRIBUTO, TDATRIBUTO, BREQUERIDO, QNIVEL, JCONFIG)
SELECT @iAtrImg, d.IDRIVER, @nImg, @tdImg, 0, 2, NULL
FROM CAPAC_DRIVERS d
WHERE NOT EXISTS (
    SELECT 1 FROM CAPAC_ATRIBUTOS_X_DRIVERS x
    WHERE x.IDRIVER = d.IDRIVER AND x.NATRIBUTO = @nImg
);

SELECT @iAtrImg AS IATRIBUTO_Imagen;

COMMIT TRAN;
