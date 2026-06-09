# Proyecto ISA-DOC

Bitácora del 2026-05-15. Consolida dos jornadas (2026-05-14 y 2026-05-15)
posteriores al último resumen del día (2026-05-13).

> Commits del período (proyecto ISA-DOC): **~50** entre el 14 y el 15.
> Sin publicación de paquetes.

## 1. Visor de tickets · Resumen general de tiempos y commits

Se incorporó al visor de tickets una **sección "Resumen general de tiempos"**
que agrega, por cada ticket, los tres ejes que componen el esfuerzo:

- **Commits relacionados** — listados en una tabla embebida con columnas de
   fecha, hora, inserciones, eliminaciones, repositorio (badge) y
   tiempo estimado dedicado al commit.
- **Cambios en base de datos** — sección con SQL/JSON renderizados por
   renglones, con resaltado de sintaxis Lezer y modo `small` para que
   quepan en el ancho del correo.
- **Diligencia del ticket** — minutos de redacción/atención dedicada al
   ticket fuera de los commits.

La fila de resumen muestra **duración total, inserciones, eliminaciones y
proyectos afectados**, y aplica fondo negro + letra blanca en la cabecera
para compatibilidad con clientes de correo.

### 1.1 Distribución y estimación de tiempos

- Cada ticket declara `estimacionMinutos` con cota por **volumen** (mínimo
   45, máximo 400, tope global de 10 horas) y los minutos se **distribuyen
   entre sus commits ponderando por peso de cambios** (inserciones +
   eliminaciones).
- La columna **tiempo dedicado** del listado de commits muestra el reparto
   resultante.
- Cuando el commit es previo a la fecha de solicitud, se **maquilla la
   hora** distribuyendo en las **4 horas hábiles previas** a la solicitud
   para que el orden cronológico tenga sentido en el correo.
- Diligencia: cota máxima por defecto **90 minutos** y total real mostrado
   en el modal. Tickets sin solución (caso TK-1425170) **no muestran** el
   bloque de "Resumen general de tiempos".

### 1.2 Refinamientos de presentación

- Fila resumen reordenada y renombrada a **"cambios extra y diligencia"**.
- Cuerpo de los tickets reescrito en **lenguaje natural**, en pasado
   impersonal, sin nombres internos ni jerga técnica.
- Título principal sin identificador, negrid forzada en título y
   subtítulos para clientes de correo, color azul homogéneo en subtítulos.
- Tablas con título que incluye el `id` del ticket.
- Imágenes con `min-width/max-width/min-height/max-height` para evitar
   expansión en Outlook y otros clientes.

## 2. Documentación de cambios en base de datos · JCONFIG v2

Se documentó en los tickets correspondientes la migración del campo
`JCONFIG` en `CAPAC_ATRIBUTOS_X_DRIVERS` a la **nomenclatura v2** alineada
al nombre del componente Svelte (`InputText`, `InputNumber`, `Switch`,
`RichEditor`, `SelectObject`, `BtnRef`, `CatalogoGen`).

- Tabla **antes/después** por atributo con `compareTable` cuando hay
   ambos lados; cuando solo hay "después", se renderiza un bloque
   simple (se eliminó la comparativa v1↔v2 redundante).
- Bloques `codeBlock` para los `UPDATE` idempotentes y para los `SELECT`
   de verificación; presentación renglón a renglón con sintaxis Lezer.
- Limpieza adicional de `CAPAC_ATRIBUTOS_PLANES` (filas sin contenido).
- Modificador específico que convierte `iplanpadre` de `InputText`
   (legacy `text`) a `BtnRef` con `controllername: "iplanpadre"`.

El intro técnico vive en
`src/lib/features/bitacora/daily/2026-05/14/driver-atributos-jconfig-v2-intro.md`.

## 3. Bitácora · acordeones y revisado

- **Acordeón de la fecha actual** se abre **cerrado por defecto**, así
   como su sección interna activa, para que la bitácora arranque
   visualmente compacta.
- Cuando se reabre la fecha, las **keys de las secciones internas se
   propagan al check del acordeón padre** para que el "revisado" del día
   refleje el estado consolidado.
- Se quitó el check duplicado de las secciones internas redundantes.
- Se agregó la entrada **JCONFIG v2** del 14 a `revisado.json` y se
   envolvió la matriz JCONFIG en un contenedor con **scroll horizontal**
   cuando excede el ancho disponible.

## 4. Tickets nuevos y reasignaciones

Se registraron en el período:

- **TK-1424892** (catálogo de seguridad) — capturas de soporte
   integradas.
- **TK-1424911** (botón Agregar en pestaña Contenido al crear curso) —
   capturas `contenidoBotonAgregar` y `contenidoPersistido`, diligencia
   30 min.
- **TK-1425173** (plan padre del recurso como catálogo filtrado /
   `iplanpadre` como BtnRef) — resuelto. Tres capturas integradas:
   estado básico oculto, BtnRef en dificultad media y catálogo del
   BtnRef mostrando solo los hermanos del mismo capítulo. Diligencia
   75 min.
- **TK-1425170** (atributos del título no cambian con el driver) —
   ticket de **diálogo de alcance** (sin solución implementada);
   redacción simplificada, sin enumerar driver/dificultad. Diligencia
   30 min. No muestra resumen de tiempos.

Se **reasignaron commits** entre tickets para mantener cada cambio en su
ticket dueño: los cambios de JCONFIG y de `iplanpadre` quedaron en el
ticket de BtnRef del plan padre; el seed de seguridad quedó en su ticket.

## 5. Estrategias y notas para próximos desarrolladores

### Resumen de tiempos · ocultar cuando no aplica

`template.ts → buildResumenTiemposHtml` retorna `""` cuando el ticket no
tiene **ni commits relacionados ni cambios en base de datos**. Esto evita
que tickets puramente de diálogo o de alcance (sin solución
implementada) muestren un bloque de resumen con ceros. La regla: si solo
hay diligencia, el resumen no aparece; la diligencia ya queda implícita
en el cuerpo del ticket.

### Estimación de minutos · cota por volumen y reparto por commit

La estimación total del ticket está acotada por volumen
(`min 45 / max 400 / tope 10h`). El **reparto entre commits** se hace
ponderando inserciones + eliminaciones del commit dentro del total del
ticket. Esto permite que tickets multi-commit muestren tiempos
realistas por commit sin requerir entrada manual.

Cuando los commits son anteriores a la fecha de solicitud (caso típico
de tickets que documentan trabajo entregado antes de abrir el tk), se
**maquillan las horas** distribuyendo en las 4 horas hábiles previas a
la solicitud. La fecha real del commit se conserva; solo se ajusta la
presentación cronológica.

### Tickets de diálogo vs. tickets de solución

Distinguir explícitamente los dos tipos:

- **Solución implementada** → cuerpo con `Causa` + `Solución aplicada`
  `Verificación` (o `Requerimientos` + `Solución aplicada` cuando es
  un cambio funcional). Resumen de tiempos visible.
- **Diálogo de alcance** → cuerpo con `Contexto` + `Acuerdo previo` +
  `Implicaciones de alcance` + `Estado`. Sin bloque de solución. Sin
  resumen de tiempos. `estimacionMinutos: 0` y `commits: []`.

Esto evita confundir tickets que requieren conversación con tickets que
documentan trabajo entregado.

### Lenguaje natural en el cuerpo del ticket

El cuerpo se exporta como cuerpo del cierre en el sistema de soporte.
El destinatario suele ser el ingeniero/usuario que reportó el caso, no
un desarrollador. Reglas de redacción aplicadas:

- Pasado impersonal ("se ajusta…", "se corrige…").
- Sin nombres de archivo, clases ni rutas.
- Sin jerga técnica salvo cuando es indispensable (nombre del módulo).
- Negrid en términos clave; cursiva para nombres internos cuando no
   se pueden evitar (p. ej. `iplanpadre`).

### Imágenes en correo · dimensiones blindadas

Para que los clientes de correo (Outlook en particular) no expandan las
imágenes a anchos arbitrarios, `img(filename, targetW)` emite
**`width`/`height` como atributos HTML** y además
`min-width/max-width/min-height/max-height` en el `style`. El tamaño
final se calcula contra el natural guardado en `imgbb-map.json` con
clamp `[300, 600]` px de altura.
