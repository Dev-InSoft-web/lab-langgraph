-- =====================================================================
-- Elimina las columnas de auditoría en las tablas de Capacitación que
-- no las requieren. Las columnas CRE/ULT se conservan ÚNICAMENTE en:
--   - CAPAC_CURSOS
--   - CAPAC_PLANES_ESTUDIO
--   - CAPAC_HISTORIALCURSO
--   - CAPAC_HISTORIALPLANESTUDIO
--
-- Tablas afectadas (se les eliminan IUSUARIOCRE/ULT, IAPPCRE/ULT,
-- IEQUIPOCRE/ULT, IPCRE/ULT, FHCRE/ULT):
--   - CAPAC_DRIVERS
--   - CAPAC_TEMAS
--   - CAPAC_CURSOS_DE_PLANES_ESTUDIO
--   - CAPAC_SEGURIDADES_CURSOS
--   - CAPAC_PLANES_CURSOS
--   - CAPAC_ATRIBUTOS_PLANES
--   - CAPAC_ESTRUCTURAS_CURSOS
--
-- Idempotente: cada columna y constraint se chequea antes de eliminarse.
-- =====================================================================

SET NOCOUNT ON;
SET XACT_ABORT ON;

-- Eliminar índices de auditoría que pudieran existir sobre tablas afectadas
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_CAPAC_CURSOS_DE_PLANES_ESTUDIO_FHCRE' AND object_id = OBJECT_ID('CAPAC_CURSOS_DE_PLANES_ESTUDIO'))
    DROP INDEX IX_CAPAC_CURSOS_DE_PLANES_ESTUDIO_FHCRE ON CAPAC_CURSOS_DE_PLANES_ESTUDIO;

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_CAPAC_CURSOS_DE_PLANES_ESTUDIO_IUSUARIOCRE' AND object_id = OBJECT_ID('CAPAC_CURSOS_DE_PLANES_ESTUDIO'))
    DROP INDEX IX_CAPAC_CURSOS_DE_PLANES_ESTUDIO_IUSUARIOCRE ON CAPAC_CURSOS_DE_PLANES_ESTUDIO;

DECLARE @audit_cols TABLE (col_name SYSNAME);
INSERT INTO @audit_cols(col_name) VALUES
    ('IUSUARIOCRE'), ('IAPPCRE'), ('IEQUIPOCRE'), ('IPCRE'), ('FHCRE'),
    ('IUSUARIOULT'), ('IAPPULT'), ('IEQUIPOULT'), ('IPULT'), ('FHULT');

DECLARE @target_tables TABLE (table_name SYSNAME);
INSERT INTO @target_tables(table_name) VALUES
    ('CAPAC_DRIVERS'),
    ('CAPAC_TEMAS'),
    ('CAPAC_CURSOS_DE_PLANES_ESTUDIO'),
    ('CAPAC_SEGURIDADES_CURSOS'),
    ('CAPAC_PLANES_CURSOS'),
    ('CAPAC_ATRIBUTOS_PLANES'),
    ('CAPAC_ESTRUCTURAS_CURSOS');

DECLARE @tbl SYSNAME, @col SYSNAME, @sql NVARCHAR(MAX), @def_name SYSNAME;

DECLARE pair_cursor CURSOR LOCAL FAST_FORWARD FOR
    SELECT t.table_name, c.col_name
    FROM @target_tables t
    CROSS JOIN @audit_cols c;

OPEN pair_cursor;
FETCH NEXT FROM pair_cursor INTO @tbl, @col;

WHILE @@FETCH_STATUS = 0
BEGIN
    IF OBJECT_ID(@tbl, 'U') IS NOT NULL
       AND EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@tbl) AND name = @col)
    BEGIN
        SET @def_name = NULL;
        SELECT @def_name = dc.name
        FROM sys.default_constraints dc
        JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
        WHERE dc.parent_object_id = OBJECT_ID(@tbl) AND c.name = @col;

        IF @def_name IS NOT NULL
        BEGIN
            SET @sql = N'ALTER TABLE ' + QUOTENAME(@tbl) + N' DROP CONSTRAINT ' + QUOTENAME(@def_name) + N';';
            EXEC sp_executesql @sql;
        END

        SET @sql = N'ALTER TABLE ' + QUOTENAME(@tbl) + N' DROP COLUMN ' + QUOTENAME(@col) + N';';
        EXEC sp_executesql @sql;
        PRINT 'DROP COLUMN ' + @tbl + '.' + @col;
    END
    FETCH NEXT FROM pair_cursor INTO @tbl, @col;
END

CLOSE pair_cursor;
DEALLOCATE pair_cursor;

PRINT 'Migración completada: columnas de auditoría eliminadas en tablas de Capacitación (excepto CAPAC_CURSOS, CAPAC_PLANES_ESTUDIO y tablas de historial).';
