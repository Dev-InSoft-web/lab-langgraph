### Fase 1 — Sembrar atributo `iplanpadre` por driver

Crea, **con un mismo `IATRIBUTO` compartido** entre todos los drivers, una fila en `CAPAC_ATRIBUTOS_X_DRIVERS` con `NATRIBUTO = 'iplanpadre'`, `TDATRIBUTO = 1` (Texto), `QNIVEL = 2`.

- `IATRIBUTO` se elige **una sola vez** (igual que el resto de atributos del catálogo: 1=URL diapositivas, 2=Imagen, …) para que sea consistente entre drivers.
- `QNIVEL = 2` (no 0): el atributo aparece a nivel de plan en el formulario.
- Idempotente vía `NOT EXISTS`.
