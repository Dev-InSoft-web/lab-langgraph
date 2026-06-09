### Fase 1b — Crear atributo NUEVO `Documento` por driver

Atributo **nuevo** en el catálogo. Se asigna un `IATRIBUTO` nuevo (siguiente disponible en el rango bajo, `< 100`) con `TDATRIBUTO = 1` (URL/texto, mismo patrón que `Url del documento` = 22 y `Documento url` = 53 en `RECURSOS_TDRECURSOSATRIBUTOS`) y `QNIVEL = 2`.

- Si por algún motivo el atributo ya existe en algún driver (corrida previa), reusa su `IATRIBUTO`.
- Idempotente vía `NOT EXISTS`.
- Devuelve el `IATRIBUTO_Documento` resuelto al final.
