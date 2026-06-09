## Reconstrucción `CAPAC_*_OLD → CAPAC_*` desde CSV

Sección que agrupa, **una entrada por tabla destino**, el flujo de tres pasos para vaciar y volver a llenar las tablas vivas con los datos exportados desde sus contrapartes `*_OLD` en formato CSV.

> **Por qué CSV y no `INSERT ... SELECT FROM old`:** desacoplamos la migración de la conexión origen. El CSV es portable, auditable, versionable y permite filtros / saneamientos manuales antes de ejecutar el INSERT. Adicionalmente el ejecutor del panel acepta cualquier SQL que ponemos en la tarjeta, así que el CSV sirve también como fuente de verdad de los datos que entrarán.

### Convención de cada acordeón anidado

Cada tabla expone un acordeón con:

1. **Editor CSV** — encabezado fijo igual a las columnas destino. Pega allí el export del `*_OLD`. La tabla se reconstruye en orden top-down respecto al modelo, así que ten en cuenta dependencias (FKs lógicas) al cargar.
2. **Paso 1 · DROP TABLE** — elimina la tabla destino si existe.
3. **Paso 2 · CREATE TABLE** — recrea la DDL canónica (igual a `init_capacitacion.sql`).
4. **Paso 3 · INSERT desde CSV** — un único `INSERT INTO ... VALUES (...)` con `TRY_CAST` por columna según el tipo destino.

### Orden recomendado de ejecución (respeta dependencias)

```text
1. CAPAC_DRIVERS
2. CAPAC_PLANES_ESTUDIO
3. PERMISOS
4. CAPAC_CURSOS                       (depende: CAPAC_DRIVERS)
5. CAPAC_CURSOS_DE_PLANES_ESTUDIO     (depende: CAPAC_CURSOS, CAPAC_PLANES_ESTUDIO)
6. CAPAC_CURSOS_PREREQUISITOS         (depende: CAPAC_CURSOS, CAPAC_PLANES_ESTUDIO)
7. CAPAC_ATRIBUTOS_X_DRIVERS          (depende: CAPAC_DRIVERS)
8. CAPAC_SEGURIDADES_CURSOS           (depende: CAPAC_CURSOS, PERMISOS)
9. CAPAC_PLANES_CURSOS                (depende: CAPAC_CURSOS)
10. CAPAC_ATRIBUTOS_PLANES            (depende: CAPAC_PLANES_CURSOS, CAPAC_ATRIBUTOS_X_DRIVERS)
11. CAPAC_ESTRUCTURAS_CURSOS          (depende: CAPAC_CURSOS)
```

### Riesgos / advertencias

- `DROP TABLE` es destructivo e irreversible sin backup.
- `CREATE TABLE` no recrea índices/FKs adicionales; revisa `init_capacitacion.sql` y `alter-capac-ddl-2026.sql` si hay índices secundarios necesarios.
- Si una columna `NOT NULL` recibe valor vacío o un `TRY_CAST` falla, la fila falla y el `BEGIN TRAN ... COMMIT` revierte todo el bloque (gracias a `XACT_ABORT ON`).
- Strings con coma o salto de línea en el CSV deben ir entre comillas dobles.
