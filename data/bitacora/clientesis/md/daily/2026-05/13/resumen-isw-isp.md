# ISW / ISP ClientesIS

Bitácora del 2026-05-13. Continuación del cierre de la batería de QA del
módulo Capacitación (Plan de estudio y Cursos), con foco en la
propagación de readonly a list-slaves, restauración del consumo del
catálogo de cursos vía API, ajuste fino de las acciones expuestas en
catálogos maestros y habilitación de scroll en los Details.

## ISW-ClientesIS · Capacitación · acciones y readonly en list-slaves

- **`616f602` · `fix(plan-estudio)`** — Se propaga `readonly` a los
   list-slaves de **Cursos integrados** y **Prerrequisitos** del plan
   para que sus acciones reflejen el modo del maestro.
- **`30572ce` · `fix(grid-columns)`** — Se resuelve el valor de columnas
   **booleanas con path anidado** en la grid del catálogo.
- **`2e4541f` · `chore(atributo-input)`** — Limpieza: se elimina una
   variable reactiva no utilizada.
- **`ff7d6e3` · `docs(qa-capacitacion)`** — Se agrega la **batería
   exhaustiva de QA cross-módulo** que sirve de checklist de cierre.
- **`f6fe6cf` · `feat(capacitacion-deep-link)`** — Se propaga el
   `itdform` del query string al componente `Acciones`, para que el
   modo (`view`/`edit`/`new`) sobreviva al deep-link.
- **`88885fb` · `fix(capacitacion)`** — Se **habilita** `Eliminar` y
   `Crear` en list-slaves del plan **derivando del permiso `Modificar`
   del maestro** (workaround temporal mientras se rediseña la
   propagación de permisos).
- **`bd77d38` · `fix(capacitacion)`** — Refinamiento del anterior: las
   acciones de los list-slaves **se controlan solo por el `itd` externo
   (readonly)**, ignorando los permisos individuales del slave. El
   maestro decide; el slave obedece.
- **`d1c54a1` · `fix(capacitacion)`** — Se **restaura el `Lista()` vía
   API** en el BtnRef de Curso del plan. El override del slave
   sobrescribe el `filter2ReturnList` del pivot y evita que el caption
   del registro activo se pinte en rojo cuando no estaba en el listado
   local.
- **`248f76c` · `fix(capacitacion)`** — Se marca `Controller` como
   opcional en los `$$Props` de los dos `Acciones.svelte` (plan de
   estudio y cursos) usando `Omit`. Como ya hay default
   (`new TPlanEstudioController()` / `new TCursoController()`), Astro
   deja de exigirlo desde fuera.

## ISW-ClientesIS · Capacitación · scroll de los Details

- **`58668af` · `fix(capacitacion)`** — Se habilita `overflow-y: auto`
   en el wrapper de `_comps/containers/form/Detail.svelte` para que el
   contenido extenso (p. ej. el tab General de Plan de estudio) sea
   navegable.
- **`bfe4059` · `style(capacitacion)`** — Se aplica la clase
   `custom-scrollbar` al contenedor para alinear el estilo del scroll
   con el resto de la aplicación.
- **`17ba732` · `refactor(capacitacion)`** — Se sustituye el `<div>`
   por `<BlockLayout>`. El helper `LayoutHelpers.hasOverflowStyle`
   detecta el `overflow-y: auto` del `style` e **infiere** la clase
   `custom-scrollbar` automáticamente. Queda eliminada la clase
   hard-codeada en el HTML.

## Estrategias y notas para próximos desarrolladores

### Acciones en list-slaves de un pivot

`makeResourceWrappers(...)` retorna `{ Master, ListSlave, Pivots[] }`.
El `ListSlave` no consume el resource del maestro, por lo que su JWT
no trae permisos significativos para resources como `PlanDeEstudio`.
Conclusión: **el permiso del list-slave NO debe gobernar su UI**. Las
acciones del list-slave (`Crear`, `Modificar`, `Eliminar`, `Visualizar`)
deben derivarse exclusivamente del modo externo (`readonly`/`itd`) que
viene del maestro. Esto evita falsos `disabled` cuando el JWT no
incluye el array de acciones del recurso.

### BtnRef del registro activo en una pestaña de pivot

El `APIPivotController.Lista()` usa el `listSlave` local + un
`filter2ReturnList`. Si el registro activo no está en ese array local,
el `BtnRef` no puede resolver su label y lo pinta en `<span
style="color:red;">`. La solución es **overridear `Lista()`** en el
slave del plan para que pida el catálogo al API
(`this.GetListado(filtro)`), excluyendo los ids ya integrados y dejando
el activo. Ver `TCursosDePlanDeEstudioControllerSlave.Lista` en
`src/lib/ContaPymeU/2.Capacitacion/PlanDeEstudio.ts`.

### `Controller` opcional en componentes Astro

Astro no respeta los defaults de Svelte cuando el `$$Props` los declara
como obligatorios. Para que un componente `Acciones.svelte` con un
default funcional (`new TPlanEstudioController()`) no exija el prop
desde un `.astro`, hay que declarar:

```ts
interface $$Props extends Omit<SeguridadAccionesProps<TPlanDeEstudio>, "Controller"> {
   Controller?: SeguridadAccionesProps<TPlanDeEstudio>["Controller"];
}
export let Controller: $$Props["Controller"] = new TPlanEstudioController();
```

### Inferir `custom-scrollbar` con `BlockLayout`

`BlockLayout` analiza el `style` recibido y si detecta `overflow(-x|-y)?:
auto|scroll` aplica `custom-scrollbar`. Preferir `<BlockLayout
style="overflow-y: auto;">` sobre `<div class="custom-scrollbar">` en
componentes propios para uniformidad y centralización del criterio.

## Cierre del día

- Todos los bugs de dominio Capacitación del backlog inmediato quedaron
   resueltos.
- Bugs reportados fuera de dominio (Bug 2 reactivity `SeguridadAcciones`,
   Bug 3 onError `AccionesGen`, Bug 4 `_LabelInput`, Bug 7 stack modales,
   fallback rojo en `BtnRef` cuando el id no se encuentra) quedan
   pendientes y NO se tocaron en este ciclo.
