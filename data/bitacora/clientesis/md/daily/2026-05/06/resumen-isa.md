# Proyecto ISA-DOC

## Documentación
- Nuevos TSV agregados para `CAPAC_PLANES_ESTUDIO` y `CAPAC_SEGURIDADES_CURSOS` en el catálogo de datos de bitácora.
- Documentación de atributos de drivers y procesos de auditoría incorporada al panel.

## Migraciones SQL (ejecutables desde Bitácora)
- `update-driver-atributos-jconfig.sql` — Completa `JCONFIG` de los 6 atributos en `CAPAC_ATRIBUTOS_X_DRIVERS` para drivers 1, 2 y 3 (configuración interpretada por `AtributoInput`: `text` / `selectEnum`, `inputProps`, `descripcion`, `readonly`). Idempotente.
- `replace-driver-recurso-codes.sql` — Reemplaza códigos legacy de `TTDriverRecurso` (`FULL_NOMBRE_DESCRIPCION`, `MINI_*`, `GRANDE_FULL`, `SOLODECRIPCION_IMG`) en `CAPAC_ATRIBUTOS_PLANES.VALOR` (IATRIBUTO=3) por los valores numéricos 1..5 del enum. Idempotente, cierra con SELECT de filas residuales no numéricas.

## Panel
- Sección `2026-05-06` agregada al `BitacoraPanel` con dos sub-acordeones (drivers JCONFIG + atributos de plan).
- `JsonViewer` integrado para mostrar el JSON esperado de cada uno de los 6 atributos de driver.
