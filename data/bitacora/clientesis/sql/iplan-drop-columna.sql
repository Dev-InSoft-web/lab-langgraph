-- =====================================================================
-- Fase 3 · Eliminar columna CAPAC_PLANES_CURSOS.IPLANPADRE
-- ---------------------------------------------------------------------
-- Quita FK e índices dependientes y dropea la columna.
-- Idempotente: sólo opera si la columna/constraint todavía existe.
-- EJECUTAR sólo después de validar Fase 1 y Fase 2.
-- =====================================================================
SET XACT_ABORT ON;
BEGIN TRAN;

DECLARE @sql NVARCHAR(MAX);

-- Drop FK que apunten a IPLANPADRE
DECLARE @fk NVARCHAR(256);
DECLARE cur_fk CURSOR LOCAL FAST_FORWARD FOR
    SELECT fk.name
    FROM sys.foreign_keys fk
    JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
    JOIN sys.columns c
      ON c.object_id = fkc.parent_object_id AND c.column_id = fkc.parent_column_id
    WHERE fk.parent_object_id = OBJECT_ID('CAPAC_PLANES_CURSOS')
      AND c.name = 'IPLANPADRE';
OPEN cur_fk;
FETCH NEXT FROM cur_fk INTO @fk;
WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = N'ALTER TABLE CAPAC_PLANES_CURSOS DROP CONSTRAINT ' + QUOTENAME(@fk);
    EXEC sp_executesql @sql;
    FETCH NEXT FROM cur_fk INTO @fk;
END
CLOSE cur_fk; DEALLOCATE cur_fk;

-- Drop índices no-PK que incluyan IPLANPADRE
DECLARE @ix NVARCHAR(256);
DECLARE cur_ix CURSOR LOCAL FAST_FORWARD FOR
    SELECT DISTINCT i.name
    FROM sys.indexes i
    JOIN sys.index_columns ic ON ic.object_id = i.object_id AND ic.index_id = i.index_id
    JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
    WHERE i.object_id = OBJECT_ID('CAPAC_PLANES_CURSOS')
      AND c.name = 'IPLANPADRE'
      AND i.is_primary_key = 0
      AND i.is_unique_constraint = 0
      AND i.name IS NOT NULL;
OPEN cur_ix;
FETCH NEXT FROM cur_ix INTO @ix;
WHILE @@FETCH_STATUS = 0
BEGIN
    SET @sql = N'DROP INDEX ' + QUOTENAME(@ix) + N' ON CAPAC_PLANES_CURSOS';
    EXEC sp_executesql @sql;
    FETCH NEXT FROM cur_ix INTO @ix;
END
CLOSE cur_ix; DEALLOCATE cur_ix;

-- Drop default constraint sobre IPLANPADRE (si existe)
DECLARE @df NVARCHAR(256);
SELECT @df = dc.name
FROM sys.default_constraints dc
JOIN sys.columns c
  ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
WHERE dc.parent_object_id = OBJECT_ID('CAPAC_PLANES_CURSOS')
  AND c.name = 'IPLANPADRE';
IF @df IS NOT NULL
BEGIN
    SET @sql = N'ALTER TABLE CAPAC_PLANES_CURSOS DROP CONSTRAINT ' + QUOTENAME(@df);
    EXEC sp_executesql @sql;
END

-- Drop columna
IF COL_LENGTH('CAPAC_PLANES_CURSOS', 'IPLANPADRE') IS NOT NULL
    ALTER TABLE CAPAC_PLANES_CURSOS DROP COLUMN IPLANPADRE;

COMMIT TRAN;
