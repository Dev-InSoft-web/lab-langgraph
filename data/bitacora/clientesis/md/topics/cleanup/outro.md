### Por qué se hizo

Los drivers `IDRIVER = 0` y `IDRIVER > 3` se introdujeron como datos sintéticos durante pruebas; igualmente los `IATRIBUTO` 9xx. No deben llegar a producción ni interferir con la fase 1 de la migración (que asigna un `IATRIBUTO` compartido por driver leyendo el `MAX < 100`).

### Riesgos / advertencias

- Si en tu entorno hay **datos reales** con `IDRIVER > 3`, **no ejecutes** este script: ajusta los rangos antes.
- El borrado en `CAPAC_DRIVERS` puede provocar borrados en cascada (FKs con `ON DELETE CASCADE`) hacia `CAPAC_CURSOS`, `CAPAC_PLANES_CURSOS`, `CAPAC_PLANDECURSO_OLD`. Verifica las FKs antes de correrlo en cualquier entorno con datos reales.
