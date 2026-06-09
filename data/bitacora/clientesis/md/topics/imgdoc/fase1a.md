### Fase 1a — Sembrar `Imagen del profesor` por driver

`Imagen del profesor` ya existe en `CAPAC_ATRIBUTOS_X_DRIVERS` para algunos drivers. Esta fase **reusa** su `IATRIBUTO` y `TDATRIBUTO` para garantizar que sea el mismo número en todos los drivers (patrón compartido del catálogo). Si no existiera todavía, asigna el siguiente `IATRIBUTO` en el rango bajo (`< 100`) con `TDATRIBUTO = 1` (texto/URL) y `QNIVEL = 2`.

- Idempotente vía `NOT EXISTS` (no duplica filas por driver).
- Devuelve el `IATRIBUTO_Imagen` resuelto al final.
