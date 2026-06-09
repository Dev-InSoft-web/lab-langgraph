# ISP-SvelteComponents

Bitácora del 2026-05-13 para el paquete
`@ingenieria_insoft/ispsveltecomponents`.

## Sin actividad en el repositorio

- En esta jornada **no se publicaron cambios** sobre el paquete
  `ISP-SvelteComponents`. Todo el trabajo de QA de Capacitación se
  resolvió íntegramente del lado de ISW-ClientesIS y del registro de
  catálogos en ISS.
- Se mantiene la versión del paquete consumida por ISW
  (`@ingenieria_insoft/ispsveltecomponents@0.0.108`).

## Bugs detectados durante el QA pero fuera de este ciclo

Los siguientes hallazgos quedan pendientes para una próxima jornada,
**no se atendieron hoy** y corresponden a este repositorio:

- **Bug 2 — Reactividad de `SeguridadAcciones`.** Cuando cambia el
  modo del maestro, las acciones expuestas por `SeguridadAcciones`
  pueden no refrescar sin un cambio adicional que dispare el ciclo
  reactivo.
- **Bug 3 — `onError` en `AccionesGen`.** Validaciones que no
  notifican al usuario al fallar Crear/Modificar, sin feedback visible
  en el formulario.
- **Bug 4 — `_LabelInput` intercepta `pointer-events`.** El label
  cubre parcialmente el área del input cuando hay placeholder activo,
  bloqueando el clic en algunos navegadores.
- **Bug 7 — Stack de modales anidados.** Cierre fuera de orden cuando
  se abren `Modal` en cascada desde acciones internas.
- **Bug 8 — Fallback rojo de `BtnRef`.** Cuando el id activo no
  aparece en la lista local del controller, el caption se pinta con
  `color: red;` aunque exista en el catálogo. Hoy se mitigó del lado
  del consumidor (override de `Lista()` en el slave del plan), pero el
  fallback del componente sigue mostrando rojo de forma genérica.
- **Bug 9 — i18n del formato personalizado del `RichEditor`.** El
  selector del nivel de texto muestra etiquetas en inglés cuando el
  modo es custom format.

## Cierre del día

- Repositorio queda **sin commits** del lado del paquete compartido.
- Próximos trabajos a abrir como ramas dedicadas en este repositorio:
  los seis bugs listados arriba, priorizados según el plan de QA.
