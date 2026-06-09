-- =====================================================================
-- Fase 1b · Crear atributo NUEVO "Documento" por driver
-- ---------------------------------------------------------------------
-- Atributo nuevo: se asigna un IATRIBUTO nuevo (siguiente disponible
-- en el rango bajo, < 100) con TDATRIBUTO=1 (URL/texto, mismo patrón
-- que "Url del documento"=22 y "Documento url"=53 en
-- RECURSOS_TDRECURSOSATRIBUTOS).
--
-- Si el atributo ya existe (por una corrida previa) reusa su IATRIBUTO.
-- Idempotente: sólo inserta la fila por driver si todavía no existe.
-- =====================================================================
SET XACT_ABORT ON;
BEGIN TRAN;

DECLARE @nDoc NVARCHAR(64) = N'Documento';

DECLARE @iAtrDoc BIGINT = (
    SELECT TOP 1 IATRIBUTO FROM CAPAC_ATRIBUTOS_X_DRIVERS WHERE NATRIBUTO = @nDoc
);
IF @iAtrDoc IS NULL
    SET @iAtrDoc = ISNULL((SELECT MAX(IATRIBUTO) FROM CAPAC_ATRIBUTOS_X_DRIVERS WHERE IATRIBUTO < 100), 0) + 1;

INSERT INTO CAPAC_ATRIBUTOS_X_DRIVERS
    (IATRIBUTO, IDRIVER, NATRIBUTO, TDATRIBUTO, BREQUERIDO, QNIVEL, JCONFIG)
SELECT @iAtrDoc, d.IDRIVER, @nDoc, 1, 0, 2, NULL
FROM CAPAC_DRIVERS d
WHERE NOT EXISTS (
    SELECT 1 FROM CAPAC_ATRIBUTOS_X_DRIVERS x
    WHERE x.IDRIVER = d.IDRIVER AND x.NATRIBUTO = @nDoc
);

SELECT @iAtrDoc AS IATRIBUTO_Documento;

COMMIT TRAN;
