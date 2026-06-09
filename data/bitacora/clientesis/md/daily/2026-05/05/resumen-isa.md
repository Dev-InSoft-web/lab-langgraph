# ISA-DOC

## Bitácora · pestañas y navegación
- La home `/` ahora carga el panel **SQL** (la primera pestaña visible). El nav del header marca `SQL` como activa tanto para `/` como para `/sql`.
- `Actions` (antes en `/`) se movió a la ruta `/actions` y conserva el `ProjectsPanel`.

## Tickets · pipeline de bloques de código
- Migración del rendering de `codeBlock` y `compareTable({kind:"code"})` a **imágenes pre-generadas** vía API de [carbon.now.sh](https://carbon.now.sh) (envuelta por `carbon-api` de Python).
- Cliente `tickets/codeImage.ts` reescrito para ser **browser-safe**: solo hace lookup en `assets/code-imgs.json` con clave `sha1(${lang}\0${src})` (WebCrypto). Si no encuentra la imagen, los snippets caen al render Lezer/CodeMirror clásico (`<pre><code>`).
- Build interno (`npm run code-images:build`):
  - `scripts/build-code-images.mjs` analiza el AST de los `TK-*.ts` (TypeScript Compiler API) y descubre todos los `codeBlock(...)` y `compareTable({kind:"code", ...})` con literales.
  - `scripts/render-code.py` genera los PNG con `carbon-api` (theme `vscode`, fondo negro `rgba(0,0,0,1)`, sin window-controls, paddings `0px`, `Hack 14px`, export `2x`).
  - Se setea `chromium_path` con el Chrome local del equipo para evitar que Pyppeteer descargue Chromium (la revisión hardcodeada ya no existe en el bucket de googleapis).
  - `stdin` forzado a UTF-8 para que `Capítulo`, `ñ` y demás lleguen intactos al renderer.
  - Subida automática a **imgbb** (URL + width + height) y persistencia incremental de `assets/code-imgs.json`.
- Tickets migrados a `await codeBlock(...)` / `await compareTable(...)`: `TK-1420754`, `TK-1420755`, `TK-1420813`.

## Tickets registrados hoy
- `TK-1420819` — Campos vacíos en grid curso (Tema / Driver). Solución aplicada en `TCursoServer.JData2List` (incluye `tema` y `driver` anidados). Ajustada la observación a singular y eliminada la sección de Verificación.
- `TK-1420813` — Campos en modo visualización en formulario rápido del curso. `compareTable` con `isDetailReadonly` antes/después.
- `TK-1420755` — Mostrar fecha de creación de curso (definición de columna en `TGridColumn<TCurso>`).
- `TK-1420754` — Defaults `Capítulo` / `Título` en `TEstructuraCursoSlaveController.ensureLimit` para drivers de 2 niveles.
- `TK-1420751` — Catálogo de temas en cursos (registro).
- `TK-1420742` — Opciones para agregar contenido al crear curso (registro).

## SQL · auditoría en Capacitación
- Nuevo script idempotente `src/lib/sql/migration/sql/add-audit-columns.sql` que recorre `CAPAC_CURSOS` y `CAPAC_PLANES_ESTUDIO` y agrega solo las columnas de auditoría faltantes:
  - `IUSUARIOCRE`, `IAPPCRE`, `IPCRE`, `FHCRE` (`DEFAULT GETDATE()`).
  - `IUSUARIOULT`, `IAPPULT`, `IPULT`, `FHULT` (`DEFAULT GETDATE()`).
- Verificación contra `sys.columns` antes de cada `ALTER TABLE … ADD`. Constraints de default nombradas `DF_<tabla>_<columna>`.
- Registrado como ticket interno `TK-AUDIT-COLS` en la sección de tickets.

## SQL · auditoría restringida a Cursos y Planes de Estudio
> Decisión revisada: la auditoría se conserva **únicamente** en `CAPAC_CURSOS`,
> `CAPAC_PLANES_ESTUDIO` y las tablas de historial. En el resto de entidades de
> Capacitación se eliminan las columnas (`IUSUARIOCRE/ULT`, `IAPPCRE/ULT`,
> `IEQUIPOCRE/ULT`, `IPCRE/ULT`, `FHCRE/ULT`).

- Tablas afectadas (DROP COLUMN): `CAPAC_DRIVERS`, `CAPAC_TEMAS`,
  `CAPAC_CURSOS_DE_PLANES_ESTUDIO`, `CAPAC_SEGURIDADES_CURSOS`,
  `CAPAC_PLANES_CURSOS`, `CAPAC_ATRIBUTOS_PLANES`,
  `CAPAC_ESTRUCTURAS_CURSOS`.
- `public/db/init_capacitacion.sql`: removidas las columnas de auditoría en los
  `CREATE TABLE` de las 7 tablas y eliminados los índices
  `IX_CAPAC_CURSOS_DE_PLANES_ESTUDIO_FHCRE` /
  `IX_CAPAC_CURSOS_DE_PLANES_ESTUDIO_IUSUARIOCRE`.
- Anexado al final del mismo `init_capacitacion.sql` un bloque **idempotente**
  para BDs existentes (cuando los `DROP TABLE` se hayan saltado para preservar
  datos): elimina `default constraints`, índices y columnas si existen.
- Disponible también como script independiente
  `public/db/migration_capacitacion_drop_audit.sql`.

```sql
-- public/db/migration_capacitacion_drop_audit.sql (idempotente)
USE CLIENTES;
GO

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_CAPAC_CURSOS_DE_PLANES_ESTUDIO_FHCRE' AND object_id = OBJECT_ID('CAPAC_CURSOS_DE_PLANES_ESTUDIO'))
    DROP INDEX IX_CAPAC_CURSOS_DE_PLANES_ESTUDIO_FHCRE ON CAPAC_CURSOS_DE_PLANES_ESTUDIO;

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_CAPAC_CURSOS_DE_PLANES_ESTUDIO_IUSUARIOCRE' AND object_id = OBJECT_ID('CAPAC_CURSOS_DE_PLANES_ESTUDIO'))
    DROP INDEX IX_CAPAC_CURSOS_DE_PLANES_ESTUDIO_IUSUARIOCRE ON CAPAC_CURSOS_DE_PLANES_ESTUDIO;
GO

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
            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(@tbl) AND name = @col)
            BEGIN
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
```

- Front (`ISW-ClientesIS/src/lib/ContaPymeU/2.Capacitacion`):
  - `Cursos.ts`: removidos `...ColOptionDatosCre/Ult` en `TPermisoCursoController`,
    `TSeguridadCursoSlaveController`, `TDriverSlaveController` y
    `TEstructuraCursoSlaveController`. Conservados solo en `TCursoController`.
  - `PlanDeEstudio.ts`: agregados a `TPlanEstudioController`.
