-- =====================================================================
-- Migración: convertir columnas TEXT a VARCHAR(MAX) en tablas de
-- capacitación. SQL Server deprecó TEXT en 2005; las operaciones del
-- framework de Consolidar generan expresiones como
--   COALESCE(NULLIF(col, ''), ...)
-- que fallan con "The data types text and varchar are incompatible in
-- the equal to operator." cuando la columna es TEXT.
--
-- Tablas y columnas afectadas:
--   CAPAC_DRIVERS.DESCRIPCION
--   CAPAC_PLANES_ESTUDIO.DESCRIPCIONPLAN
--   CAPAC_CURSOS.DESCRIPCION
--
-- Idempotente: solo altera la columna si todavía es TEXT.
-- =====================================================================

SET NOCOUNT ON;

DECLARE @cambios TABLE (TableName SYSNAME, ColumnName SYSNAME);
INSERT INTO @cambios (TableName, ColumnName) VALUES
    ('CAPAC_DRIVERS', 'DESCRIPCION'),
    ('CAPAC_PLANES_ESTUDIO', 'DESCRIPCIONPLAN'),
    ('CAPAC_CURSOS', 'DESCRIPCION');

DECLARE @tbl SYSNAME, @col SYSNAME, @sql NVARCHAR(MAX), @tipo SYSNAME;

DECLARE cur CURSOR LOCAL FAST_FORWARD FOR
    SELECT TableName, ColumnName FROM @cambios;
OPEN cur;
FETCH NEXT FROM cur INTO @tbl, @col;
WHILE @@FETCH_STATUS = 0
BEGIN
    IF OBJECT_ID(@tbl, 'U') IS NULL
    BEGIN
        PRINT @tbl + ' no existe en esta base de datos. Operación omitida.';
    END
    ELSE
    BEGIN
        SELECT @tipo = DATA_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = @tbl AND COLUMN_NAME = @col;

        IF @tipo IS NULL
        BEGIN
            PRINT @tbl + '.' + @col + ' no existe. Operación omitida.';
        END
        ELSE IF UPPER(@tipo) = 'TEXT'
        BEGIN
            SET @sql = N'ALTER TABLE ' + QUOTENAME(@tbl) + N' ALTER COLUMN ' + QUOTENAME(@col) + N' VARCHAR(MAX) NULL;';
            EXEC sp_executesql @sql;
            PRINT @tbl + '.' + @col + ' · convertido de TEXT a VARCHAR(MAX).';
        END
        ELSE
        BEGIN
            PRINT @tbl + '.' + @col + ' · ya es ' + @tipo + '. Sin cambios.';
        END
    END
    FETCH NEXT FROM cur INTO @tbl, @col;
END
CLOSE cur;
DEALLOCATE cur;
