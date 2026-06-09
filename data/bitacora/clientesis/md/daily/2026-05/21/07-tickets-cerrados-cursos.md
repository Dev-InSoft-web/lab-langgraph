## 7 · Cierre de tickets adicionales (Capacitación)

Cerrados dos tickets del dominio **Capacitación** con evidencia
visual y commits enlazados:

- **TK-1426900 — Cursos integrados (modo Modificar):** el campo
  *Curso* aparece deshabilitado al modificar un detalle del plan
  porque `(iplanestudio, icurso)` es llave compuesta y
  `pkReadonly(frmItd, Item)` fuerza modo `view`. Se mantiene el
  bloqueo por integridad referencial y se añade un **aviso
  informativo** bajo el campo (opción B Alert) explicando que para
  reemplazar el curso debe eliminar la fila y crearla de nuevo.
- **TK-1428161 — Persistencia de columnas en catálogos:** solicitud
  retroactiva ya resuelta la semana del 13/may./2026 con capa de
  persistencia en `localStorage` por controlador (clave compuesta con
  `entrie`) y rehidratación síncrona en el field initializer del
  controlador; aplica a **todos** los catálogos de ContaPyme U.
  Verificado en `/capacitacion/cursos`: las columnas adicionales
  marcadas se conservan tras recargar.

### 7.1 · Flag `noMaquillarFechas` para tickets retroactivos

Se introduce en la interfaz de tickets el flag opcional
`noMaquillarFechas?: boolean`. Cuando es `true`, `template.ts` pasa
`undefined` como `fechaSolicitud` a `buildCommitsHtml`, y
`maquillarFechas` deja los timestamps reales de los commits sin
recorrer al horario laboral. Útil para tickets que documentan trabajo
ya hecho días/semanas atrás (caso TK-1428161).
