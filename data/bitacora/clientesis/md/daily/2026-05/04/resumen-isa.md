# ISA-DOC

## UI / Componentes
- `ConfirmDialog`:
  - Padding interno aumentado y ancho mínimo 360 px.
  - Variantes y colores de los botones configurables por prop (`confirmVariant/cancelVariant/neutralVariant` y `*ColorOverride`).
  - Cada botón envuelto en `<div class="btn-fit">` para que use `width: fit-content` dentro de un `FlexLayout` (no obliga a tamaños iguales).
  - Variantes alineadas con `Button` de `ispsveltecomponents`: `solid | outlined | ghost | text`.
- `RevisadoCheck`: en estado mixto, "Marcar todos" → `solid primary`, "Desmarcar todos" → `outlined primary`, "Cancelar" → `outlined neutral`.
- `SqlExecCard` / confirmación de ejecución: "Ejecutar" → `solid primary`; "Cancelar" → `outlined neutral`.

## Reconstrucción de tablas `CAPAC_*_OLD`
- Cada `create_*` quedó envuelto con `IF OBJECT_ID('T','U') IS NULL BEGIN CREATE TABLE … END;` (idempotente).
- Las tarjetas `INSERT` se ocultan cuando hay `0` filas en el snapshot.
- Los CSV embebidos pasaron a ser **fotografía actual** de la base de datos (no del esquema `_OLD`).

## Snapshots / Fotografías
- Endpoint `/api/db/take-snapshot` acepta `{ all: true }` y guarda los 10 CSV con un único `stamp`.
- Convención de nombres: `YYYYMMDDhhmmss-<TABLA>.csv` (incluye hora, minuto y segundo).
- Botón **Descargar estado** (`mdi:cloud-download-outline`) en `OldRebuildSection`: llama al endpoint global, refresca y muestra toast.
- Selector global de fotografía con `SelectObject` de `ispsveltecomponents`, etiquetas formateadas como `YYYY-MM-DD hh:mm:ss` (la más reciente lleva el sufijo *(más reciente)*).
- El `stamp` seleccionado se propaga por prop a cada `RebuildOldTableMigration` (se eliminó el select per-tabla).

## Operaciones
- Se eliminaron los 10 CSV con la convención antigua (8 dígitos) y se regeneraron con `stamp` `20260504142204`.
- Filas regeneradas: `CAPAC_DRIVERS=3`, `CAPAC_PLANES_ESTUDIO=2`, `CAPAC_CURSOS=233`, `CAPAC_CURSOS_DE_PLANES_ESTUDIO=5`, `CAPAC_CURSOS_PREREQUISITOS=1`, `CAPAC_ATRIBUTOS_X_DRIVERS=15`, `CAPAC_SEGURIDADES_CURSOS=323`, `CAPAC_PLANES_CURSOS=4642`, `CAPAC_ATRIBUTOS_PLANES=9057`, `CAPAC_ESTRUCTURAS_CURSOS=454`.
