-- =====================================================================
-- Crea las columnas de auditoría faltantes en CAPAC_CURSOS y
-- CAPAC_PLANES_ESTUDIO. Idempotente: cada columna se agrega solo si
-- no existe. No toca columnas ya presentes ni sus datos.
--
-- Conjunto de auditoría (orden lógico CRE / ULT, según TObjectBase):
--   IUSUARIOCRE  VARCHAR(255)
--   IAPPCRE      VARCHAR(255)
--   IEQUIPOCRE   INT
--   IPCRE        VARCHAR(255)
--   FHCRE        DATETIME2     DEFAULT GETDATE()
--   IUSUARIOULT  VARCHAR(255)
--   IAPPULT      VARCHAR(255)
--   IEQUIPOULT   INT
--   IPULT        VARCHAR(255)
--   FHULT        DATETIME2     DEFAULT GETDATE()
-- =====================================================================

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @sql NVARCHAR(MAX);

-- Tablas objetivo
DECLARE @tables TABLE (TableName SYSNAME);
INSERT INTO @tables (TableName) VALUES ('CAPAC_CURSOS'), ('CAPAC_PLANES_ESTUDIO'), ('CAPAC_PLANES_CURSOS');

-- Columnas a garantizar (tipo + default opcional)
DECLARE @cols TABLE (
    ColName    SYSNAME,
    ColType    NVARCHAR(64),
    ColDefault NVARCHAR(64) NULL
);
INSERT INTO @cols (ColName, ColType, ColDefault) VALUES
    ('IUSUARIOCRE', 'VARCHAR(255)', NULL),
    ('IAPPCRE',     'VARCHAR(255)', NULL),
    ('IEQUIPOCRE',  'INT',          NULL),
    ('IPCRE',       'VARCHAR(255)', NULL),
    ('FHCRE',       'DATETIME2',    'GETDATE()'),
    ('IUSUARIOULT', 'VARCHAR(255)', NULL),
    ('IAPPULT',     'VARCHAR(255)', NULL),
    ('IEQUIPOULT',  'INT',          NULL),
    ('IPULT',       'VARCHAR(255)', NULL),
    ('FHULT',       'DATETIME2',    'GETDATE()');

DECLARE @table SYSNAME, @col SYSNAME, @type NVARCHAR(64), @def NVARCHAR(64);

-- Un único cursor sobre el cross join (tablas × columnas) para evitar
-- redeclaración de cursores anidados al iterar la segunda tabla.
DECLARE pair_cursor CURSOR LOCAL FAST_FORWARD FOR
    SELECT t.TableName, c.ColName, c.ColType, c.ColDefault
    FROM @tables t
    CROSS JOIN @cols c;

OPEN pair_cursor;
FETCH NEXT FROM pair_cursor INTO @table, @col, @type, @def;

WHILE @@FETCH_STATUS = 0
BEGIN
    IF OBJECT_ID(@table, 'U') IS NULL
    BEGIN
        PRINT '-- [skip] Tabla no existe: ' + @table;
    END
    ELSE IF EXISTS (
        SELECT 1
        FROM sys.columns
        WHERE object_id = OBJECT_ID(@table)
          AND name = @col
    )
    BEGIN
        PRINT '-- [ok] ' + @table + '.' + @col + ' ya existe';
    END
    ELSE
    BEGIN
        SET @sql = N'ALTER TABLE ' + QUOTENAME(@table) +
                   N' ADD ' + QUOTENAME(@col) + N' ' + @type + N' NULL' +
                   CASE WHEN @def IS NOT NULL
                        THEN N' CONSTRAINT ' +
                             QUOTENAME('DF_' + @table + '_' + @col) +
                             N' DEFAULT ' + @def
                        ELSE N''
                   END + N';';
        PRINT @sql;
        EXEC sp_executesql @sql;
    END

    FETCH NEXT FROM pair_cursor INTO @table, @col, @type, @def;
END

CLOSE pair_cursor;
DEALLOCATE pair_cursor;
