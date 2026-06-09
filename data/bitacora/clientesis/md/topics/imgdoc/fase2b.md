### Fase 2b — Migrar `IMAGENDRIVER` → `Imagen del profesor`

Lee `CAPAC_PLANDECURSO_OLD.IMAGENDRIVER` (sólo no nulos / no vacíos), transforma el `IPLAN` `'001002003'` → `'1.2.3'` para coincidir con `CAPAC_PLANES_CURSOS`, y lo inserta en `CAPAC_ATRIBUTOS_PLANES` referenciando el `IATRIBUTO` del atributo **`Imagen del profesor`** del driver del curso (`CAPAC_CURSOS.IDRIVER`).

Reglas:
- Sólo procesa `(ICURSO, IPLAN_dot)` que **existan** en `CAPAC_PLANES_CURSOS`.
- Idempotente (`NOT EXISTS` por PK lógica `(IPLAN, ICURSO, IATRIBUTO)`).
- `BACTIVO = 1`; audit fields con `migration-img-doc` / `ISA-DOC` / IP / `GETDATE()`.
