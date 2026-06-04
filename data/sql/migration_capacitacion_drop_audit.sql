-- ============================================================================
-- Migración: eliminar columnas de auditoría de tablas de Capacitación
-- ----------------------------------------------------------------------------
-- Decisión: las columnas de auditoría (IUSUARIOCRE/ULT, IAPPCRE/ULT,
-- IEQUIPOCRE/ULT, IPCRE/ULT, FHCRE/ULT) se conservan ÚNICAMENTE en las
-- entidades raíz `CAPAC_CURSOS` y `CAPAC_PLANES_ESTUDIO`, y en las tablas de
-- historial `CAPAC_HISTORIALCURSO` / `CAPAC_HISTORIALPLANESTUDIO`.
--
-- Este script:
--   1. Elimina los índices de auditoría existentes en las tablas afectadas.
--   2. Hace DROP COLUMN de las columnas de auditoría en cada tabla.
--
-- Tablas afectadas:
--   - CAPAC_DRIVERS
--   - CAPAC_TEMAS
--   - CAPAC_CURSOS_DE_PLANES_ESTUDIO
--   - CAPAC_SEGURIDADES_CURSOS
--   - CAPAC_PLANES_CURSOS         (Plan de Curso: ya no requiere auditoría)
--   - CAPAC_ATRIBUTOS_PLANES
--   - CAPAC_ESTRUCTURAS_CURSOS
-- ============================================================================

USE CLIENTES;
GO

SET NOCOUNT ON;

-- ----------------------------------------------------------------------------
-- 1. Eliminar índices de auditoría que pudieran existir
-- ----------------------------------------------------------------------------

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_CAPAC_CURSOS_DE_PLANES_ESTUDIO_FHCRE' AND object_id = OBJECT_ID('CAPAC_CURSOS_DE_PLANES_ESTUDIO'))
    DROP INDEX IX_CAPAC_CURSOS_DE_PLANES_ESTUDIO_FHCRE ON CAPAC_CURSOS_DE_PLANES_ESTUDIO;

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_CAPAC_CURSOS_DE_PLANES_ESTUDIO_IUSUARIOCRE' AND object_id = OBJECT_ID('CAPAC_CURSOS_DE_PLANES_ESTUDIO'))
    DROP INDEX IX_CAPAC_CURSOS_DE_PLANES_ESTUDIO_IUSUARIOCRE ON CAPAC_CURSOS_DE_PLANES_ESTUDIO;
GO

-- ----------------------------------------------------------------------------
-- 2. Helper: eliminar columnas de auditoría de una tabla si existen
--    (cada columna se chequea individualmente porque ALTER TABLE DROP COLUMN
--     no admite IF EXISTS en todas las versiones de SQL Server).
-- ----------------------------------------------------------------------------

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

DECLARE tbl_cur CURSOR LOCAL FAST_FORWARD FOR SELECT table_name FROM @target_tables;
OPEN tbl_cur;
FETCH NEXT FROM tbl_cur INTO @tbl;
WHILE @@FETCH_STATUS = 0
BEGIN
    IF OBJECT_ID(@tbl, 'U') IS NOT NULL
    BEGIN
        DECLARE col_cur CURSOR LOCAL FAST_FORWARD FOR SELECT col_name FROM @audit_cols;
        OPEN col_cur;
        FETCH NEXT FROM col_cur INTO @col;
        WHILE @@FETCH_STATUS = 0
        BEGIN
            IF EXISTS (
                SELECT 1 FROM sys.columns
                WHERE object_id = OBJECT_ID(@tbl) AND name = @col
            )
            BEGIN
                -- Eliminar default constraint asociado, si existe
                SELECT @def_name = dc.name
                FROM sys.default_constraints dc
                JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
                WHERE dc.parent_object_id = OBJECT_ID(@tbl) AND c.name = @col;

                IF @def_name IS NOT NULL
                BEGIN
                    SET @sql = N'ALTER TABLE ' + QUOTENAME(@tbl) + N' DROP CONSTRAINT ' + QUOTENAME(@def_name) + N';';
                    EXEC sp_executesql @sql;
                    SET @def_name = NULL;
                END

                SET @sql = N'ALTER TABLE ' + QUOTENAME(@tbl) + N' DROP COLUMN ' + QUOTENAME(@col) + N';';
                EXEC sp_executesql @sql;
                PRINT 'DROP COLUMN ' + @tbl + '.' + @col;
            END
            FETCH NEXT FROM col_cur INTO @col;
        END
        CLOSE col_cur;
        DEALLOCATE col_cur;
    END
    FETCH NEXT FROM tbl_cur INTO @tbl;
END
CLOSE tbl_cur;
DEALLOCATE tbl_cur;
GO

PRINT 'Migración completada: columnas de auditoría eliminadas en tablas de Capacitación (excepto CAPAC_CURSOS, CAPAC_PLANES_ESTUDIO y tablas de historial).';
GO
