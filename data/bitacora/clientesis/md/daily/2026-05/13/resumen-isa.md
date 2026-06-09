# Proyecto ISA-DOC

Bitácora del 2026-05-13.

- **`62c0218` · `feat(tickets)`** — Se **homogeneizan los datos del
   tiquete** con la **normativa de cierre** en la información general
   del visor de tickets.

## Estructura

- Se agregó la interfaz `TicketNormativa` en `src/lib/features/tickets/index.ts`
   con los 7 campos exigidos por la normativa:
   - `medioAtencion`
   - `tipoSolicitud`
   - `estadoSolicitud`
   - `tipoSolucion`
   - `coberturaEstimada`
   - `aplicacion`
   - `ambiente`
- Se publicó la constante `NORMATIVA_DEFAULT` con los valores estándar
   para tiquetes de ContaPyme U:
   - Medio: `Sistema de soporte`
   - Tipo solicitud: `1 - PQR proyecto (para uso AT e ING únicamente)`
   - Estado: `1 - Atención sin novedades`
   - Tipo solución: `No aplica`
   - Cobertura: `No aplica`
   - Aplicación: `ContaPyme U`
   - Ambiente: `Producción`
- Los 9 tickets registrados (`TK-1423165`, `TK-1422216`, `TK-1420819`,
   `TK-1420813`, `TK-1420755`, `TK-1420754`, `TK-1420751`, `TK-1420742`,
   `TK-1418894`) reciben `normativa: { ...NORMATIVA_DEFAULT }`, listos
   para sobreescribir campo por campo cuando aplique (p. ej. `Pruebas`
   en ambiente o `Con actualización` en tipo de solución para tiquetes
   de error).
- `TicketViewerModal.svelte` muestra los 7 campos de normativa en una
   segunda línea de `small` dentro del header del modal,
   **fuera del HTML del body**. Esto permite copiar y diligenciar los
   campos en el sistema de soporte sin contaminar el cuerpo del ticket
   con metadatos administrativos.

## Estrategias y notas para próximos desarrolladores

### Datos del tiquete vs. cuerpo del tiquete

Convención: la **normativa de cierre** se modela como propiedad
estructurada del registro del ticket (`TicketRegistro.normativa`) y se
renderiza en la **info general del visor** (header del modal). NUNCA va
embebida en el HTML del body. Razones:

1. El body se exporta y se pega en el sistema de soporte como cuerpo
   técnico del cierre. La normativa va en los campos del formulario
   del sistema de soporte, no en el cuerpo.
2. Cambiar la normativa de un ticket no debe modificar el HTML
   resultante (que puede estar versionado).
3. Permite filtrar/agregar tickets por valores normativos sin parsear
   HTML.

### Default por spread, no por referencia

Cada ticket recibe `{ ...NORMATIVA_DEFAULT }`. Compartir la misma
referencia produciría que sobreescribir un campo en un ticket impacte
en todos los demás. El spread garantiza independencia y permite
override puntual: p. ej. `{ ...NORMATIVA_DEFAULT, ambiente: "Pruebas" }`.
