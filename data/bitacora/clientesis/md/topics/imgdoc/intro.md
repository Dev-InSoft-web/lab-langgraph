## Migración `IMAGENDRIVER` / `DOCUMENTODRIVER` → atributos plan

`CAPAC_PLANDECURSO_OLD` tiene dos columnas (`IMAGENDRIVER`, `DOCUMENTODRIVER`) que deben pasar a filas de `CAPAC_ATRIBUTOS_PLANES`, vinculadas a `CAPAC_ATRIBUTOS_X_DRIVERS`. Para ello:

- `IMAGENDRIVER` → atributo **`Imagen del profesor`** (ya existe en algunos drivers; se reusa el mismo `IATRIBUTO`).
- `DOCUMENTODRIVER` → atributo **nuevo** llamado **`Documento`** (`TDATRIBUTO=1`, mismo patrón que `Url del documento` / `Documento url` en `RECURSOS_TDRECURSOSATRIBUTOS`).

Cada fase es idempotente y se ejecuta de manera independiente.
