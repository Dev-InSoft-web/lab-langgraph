### Fase 2c — Migrar `DOCUMENTODRIVER` → `Documento`

Lee `CAPAC_PLANDECURSO_OLD.DOCUMENTODRIVER` (sólo no nulos / no vacíos), transforma el `IPLAN` `'001002003'` → `'1.2.3'` para coincidir con `CAPAC_PLANES_CURSOS`, y lo inserta en `CAPAC_ATRIBUTOS_PLANES` referenciando el `IATRIBUTO` del atributo **`Documento`** del driver del curso (`CAPAC_CURSOS.IDRIVER`).

Reglas:
- Requiere haber ejecutado la Fase 1b (atributo `Documento` debe existir en `CAPAC_ATRIBUTOS_X_DRIVERS`).
- Sólo procesa `(ICURSO, IPLAN_dot)` que **existan** en `CAPAC_PLANES_CURSOS`.
- Idempotente (`NOT EXISTS` por PK lógica `(IPLAN, ICURSO, IATRIBUTO)`).
- `BACTIVO = 1`; audit fields con `migration-img-doc` / `ISA-DOC` / IP / `GETDATE()`.
