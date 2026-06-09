# ISP-ClientesISServer / ISS-ClientesIS-ContaPymeU

Periodo cubierto: 2026-05-09 a 2026-05-11.

## ISP-CLientesISServer

- **`cb69a5c` · `feat(planescurso)`** (2026-05-09) — Antes de persistir el
   **plan del curso**, el server **descarta los atributos sin valor**. El
   objetivo es no enviar a la BD nodos con campos en blanco que luego
   generaban registros vacíos o inconsistencias en el árbol del Plan de
   contenidos.

Sin publicación nueva del paquete `ispclientesisserver` en el periodo
(la versión vigente sigue siendo la última de la jornada anterior). El
cambio queda disponible al hacer el siguiente release.

## ISS-ClientesIS-ContaPymeU

- **`ab230bb` · `feat`** (2026-05-11) — Se agregó el **servicio para
   obtener el detalle del plan de estudio**. Este endpoint alimenta el
   nuevo componente de Plan de estudio del módulo Capacitación en ISW
   (commit `c91a52c` del ISW).

## Despliegue

- Los cambios del server `cb69a5c` y de la Function `ab230bb` quedan
   listos para la siguiente ventana de despliegue. El ISW ya consume el
   detalle del plan de estudio desde producción asumiendo la Function
   publicada; verificar antes de QA.

## Estrategias y notas para próximos desarrolladores

### Descarte de atributos vacíos antes de persistir

El server filtra cualquier atributo del nodo del plan cuyo valor sea
`null`, `undefined`, cadena vacía o array vacío. Esto evita que el
backend reciba campos en blanco que la UI no diferenciaba de campos no
seteados. Si un consumer **necesita persistir intencionalmente un valor
vacío** (p. ej. para limpiar un campo previamente seteado), debe enviar
un sentinel explícito acordado con el server, no `""` o `null`.

### Servicio de detalle del plan de estudio

El nuevo endpoint de la Function devuelve la estructura completa del
plan (nodos + atributos + relaciones tema/recurso) en un solo viaje. El
ISW lo consume al abrir el TreeView del curso para no hacer N+1 al
backend de la BD. Si se extiende el modelo del plan, ampliar el DTO de
la Function antes de tocar el consumer.
