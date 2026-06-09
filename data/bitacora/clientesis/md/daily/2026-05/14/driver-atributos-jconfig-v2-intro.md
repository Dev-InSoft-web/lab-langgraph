# JCONFIG v2 · Nomenclatura alineada a nombres de componente + `iplanpadre` → BtnRef

Actualiza el campo `JCONFIG` en `CAPAC_ATRIBUTOS_X_DRIVERS` para los 6 atributos compartidos por los drivers 1, 2 y 3, con dos objetivos:

1. **Estándar de nomenclatura**: el `type` del JSON coincide ahora exactamente con el nombre del componente Svelte que lo renderiza.
2. **`iplanpadre` editable**: pasa de `InputText` (`text` legacy) `readonly` a `BtnRef` con `controllername: "iplanpadre"`. El controlador filtra los hermanos del capítulo actual y se define en código ISW.

## Renominación de `type`

| v1 (2026-05-06) | v2 (hoy)      | Componente Svelte |
| :-------------- | :------------ | :---------------- |
| `text`          | `InputText`   | `<Input>` (`InputText` alias semántico) |
| `number`        | `InputNumber` | `<InputNumber>`   |
| `switch`        | `Switch`      | `<Switch>` (vía `SwitchField`) |
| `richeditor`    | `RichEditor`  | `<RichEditor>`    |
| `selectEnum`    | `SelectObject`| `<SelectObject>`  |
| `btnref`        | `BtnRef`      | `<BtnRef>`        |
| `catalogo`      | `CatalogoGen` | `<CatalogoGen>`   |

El mapeo en `Adapter.jconfig2FieldDef` (ISW) admite ambas formas (case-insensitive) durante la transición.

## Cambio funcional · `iplanpadre`

| IATRIBUTO | NATRIBUTO  | v1 type           | v2 type | Notas |
| :-------: | :--------- | :---------------- | :------ | :---- |
| 5         | iplanpadre | `text` (readonly) | `BtnRef` | `controllername: "iplanpadre"` — el controlador filtra hermanos del capítulo actual. |

## Script

`update-driver-atributos-jconfig-v2.sql` — idempotente, solo `UPDATE` sobre filas existentes filtradas por `IDRIVER IN (1, 2, 3)` y `IATRIBUTO IN (1..6)`. Termina con un `SELECT` de verificación.

## Dependencias en código (no incluido en este modificador)

- `Adapter.jconfig2FieldDef` ya mapea los nuevos nombres y conserva soporte legacy.
- Registrar en el formulario consumidor un `Controllers["iplanpadre"]` (`ICtxBtnRef`) que liste los hermanos del capítulo actual filtrando por `flatPath`/`pathInit`.
- Inyectar `controllers` al `<Attr2Input>` del `Formulario.svelte` de TreeContenidos.
