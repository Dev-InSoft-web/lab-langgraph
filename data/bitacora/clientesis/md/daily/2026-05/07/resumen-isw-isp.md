# ISW / ISP ClientesIS

## ISW-ClientesIS · TreeContenidos · Formulario.svelte
- Resuelto error en runtime **`Cyclical dependency detected: currentPath → frmObj → currentPath`** (https://svelte.dev/e/reactive_declaration_cycle).
  - Causa: `$: currentPath = ...` dependía de `frmObj`, mientras tres `$:` adicionales reasignaban `frmObj = frmObj` dentro de autofill / herencia de `itema` / autofill de `titulo` → ciclo en el grafo reactivo de Svelte.
  - Fix: `currentPath` pasó de `$:` a `let`. Toda la lógica derivada (recalcular `attrEntries`, herencia de `itema` desde el padre, autofill de `titulo` desde `recurso.nrecurso`) se consolidó en una única función `applyFrmObj(obj)` invocada por `$: applyFrmObj(frmObj)`.
  - Guarda por referencia (`_lastFrmObjRef` + path) para corto-circuitar re-ejecuciones disparadas por reasignaciones desde handlers (`ontemaselected`, `onrecurseselected`).
- Ajuste de inicialización de `objRow` en `TPlanCursoNode` para mantener integridad de los nodos cuando se reciben datos parciales.

## ISW-ClientesIS · Plan de Estudio · ListCursosDePlan.svelte
- Drawer de creación de relación Plan ↔ Curso reescrito:
  - **Bug raíz**: el formulario quedaba vacío porque `<BtnRef bind:value={Item.icurso}>` y `<InputNumber bind:value={Item.qorden}>` accedían a `Item` aún `undefined` (la `use:syncItem` corre tras el primer render → crash silencioso).
  - Fix: bindings del slot ahora usan directamente el `Obj` del slot (renombrado a `co` vía `{@const co = frmObj as TCursoDePlanDeEstudio}` para conservar el tipo concreto y permitir `bind:value={co.icurso}`).
- **Auto-open en `create`**: nueva action `self.autoOpenBtnRef` sobre el wrapper del BtnRef. Si `itdForm === "create"` y `co.icurso` está vacío, dispara `click()` en `:scope button[aria-label="Open BtnRef"]` mediante `queueMicrotask`. Bandera `_autoOpenedFor` por referencia para no re-disparar.
- **Detalles readonly del curso seleccionado**:
  - Inputs readonly: Nombre, Descripción, Tema (`curso.tema.ntema`), Driver (`curso.driver.ndriver`), Recursos, Duración.
  - `Switch` disabled: Curso activo, Genera certificado.
  - `InputNumber` Orden en el plan + sub-sección de Prerrequisitos solo cuando ya hay curso seleccionado.
- **Bug "carga el nombre pero no setea el id"** (mismo patrón histórico en `ListSeguridad.svelte` con permisos): `bind:value` a expresión casteada `(frmObj as ...).icurso` no actúa como setter bidireccional. Solución replicada del patrón existente:
  - Asignación explícita de la PK en el callback (`co.icurso = record.icurso`).
  - Reasignación de la entidad anidada (`co.curso = record`).
  - Trigger de refresco con contador `refresh++` y `{#key refresh}` para forzar remontaje del subárbol.
  - Adicionalmente se eliminó el cast inline al introducir `{@const co}`, evitando reproducir el problema.
- Controlador slave: se reutiliza `TCursosDePlanDeEstudioControllerSlave` (`APIPivotController(TCursoController)` con `isysrecurso="PlanDeEstudio"`) que además filtra cursos ya asignados al plan en su `Lista()`.

## ISP-ClientesIS
- `b36872c` — Nueva ruta para obtener plan de estudio con detalle, lista para ser consumida por la UI (alimenta los detalles readonly del curso en el drawer Plan ↔ Curso).
- `1884bee` — Bump del día a **1.0.162** (publicado en npm).

## ISW-ClientesIS
- Plan de Estudio · pestaña **Prerrequisitos**: fix del texto en rojo del `BtnRef "Curso requerido"` cuando se editaba un prerrequisito ya guardado.
   - Causa: `TPrereqCandidateAPIController.listSlave` excluía cursos ya usados como prereq por OTROS items, lo que también excluía al curso del item en edición → el lookup del `BtnRef` no resolvía el nombre y mostraba la PK en `<span style="color:red">`.
   - Fix en `PlanDeEstudio.ts`:
      - Asignar `entityActivePrereq = Item` en el `$:` reactivo de `ListPrerequisitosDePlan.svelte` y `ListCursosDePlan.svelte`.
      - En `listSlave`, **siempre incluir** el curso referenciado por `entityActivePrereq.icursorequerido` además de los candidatos válidos.
- Plan de Estudio · helper local `cursoCols(suffix, label, getId)` reduce 20 columnas duplicadas (Owner/Requerido) a una arrow fn parametrizada.
- Plan de Estudio · 3 controllers usan ahora el patrón **init-once + merge-setter** para `Columns`:
   - `get Columns()` retorna `this._columns ??= { … }`.
   - `set Columns(delta)` invoca `mergeColumnDeltas(this._columns ??= this.Columns, delta)`.
   - Evita que el bug de `Grid.svelte` (línea ~624) borre las columnas no tocadas al ocultar/mostrar una.
- Pestaña **General**: `SelectEnum` de `ispsveltecomponents` para tipo de visualización + previsualización con íconos. CSS reescrito con anidamiento nativo bajo `.f-tab-content`.

## Estrategias y notas para próximos desarrolladores

### `bind:value` no setea la PK aunque cargue el nombre
Patrón histórico (visto en `ListSeguridad.svelte` y reproducido en `ListCursosDePlan.svelte`): `bind:value` a una expresión casteada (`(frmObj as ...).icurso`) no actúa como setter bidireccional. Síntoma: el BtnRef muestra el nombre del registro elegido pero al guardar la PK queda vacía.

**Estrategias de fix (cualquiera funciona, combinables):**
1. Reemplazar el cast inline por `{@const co = frmObj as TX}` y bindear `bind:value={co.icurso}`.
2. Asignación explícita en el callback `onSelectedRecord`:
   ```ts
   onCursoRequeridoSelected(obj, record) {
      obj.icursorequerido = record.icurso;
      obj.cursorequerido = record;
   }
   ```
3. Si el render del subárbol depende de la asignación, contador `refresh++` con `{#key refresh}` para forzar remontaje.

### Bug de `Grid.svelte` al ocultar columnas
Si un grid pierde columnas al usar el selector visual, **no editar el paquete**: aplicar el patrón init-once + merge-setter en el controller local (ver bloque `Columns` arriba). El bug está en `onColumnVisible` línea ~624 de `ispsveltecomponents/src/lib/base/Grid.svelte`.

### Refactor de columnas duplicadas
Cuando un controller declare múltiples columnas con la misma estructura (p. ej. los campos del `curso` repetidos como Owner y Requerido), extraer una arrow fn:
```ts
private cursoCols = (suffix: string, label: string, getId: (o) => string) => ({
   [`ncurso${suffix}`]: { caption: `Nombre ${label}`, hide: true, GetDisplayText: ... },
   /* … 9 columnas más … */
});
get Columns() {
   return this._columns ??= {
      // … columnas únicas …
      ...this.cursoCols("Owner", "Curso", (o) => o.icurso),
      ...this.cursoCols("Requerido", "Requisito", (o) => o.icursorequerido),
   };
}
```

### Layout: priorizar `FlexLayout` / `GridLayout` sobre estilos inline
- No setear `gap` en `FlexLayout` ni `GridLayout` (lo aplica el componente).
- `TabItem`: padding de contenido `0.5rem`.
- `display:flex` ad-hoc → `<FlexLayout direction="…">`. Para inline-flex, `<FlexLayout inline>`.

### Ciclo de actualización end-to-end
1. **ISS** (si hay cambios de schema/función): merge → despliegue de la Azure Function.
2. **ISP-CLientesISServer**: bump de versión → `npm publish` → `npm i` en ISW (registrar la versión publicada solo si la hizo el desarrollador del día).
3. **ISP-ClientesIS** (modelos de UI): bump de versión → `npm publish` → `npm i` en ISW (misma regla de registro de versión).
4. **ISP-SvelteComponents** (componentes UI): bump de versión → `npm publish` → `npm i` en ISW (misma regla).
5. **ISW**: `npm run build` → desplegar a Azure → smoke test en `clientesis.azurewebsites.net`.
6. **ISA-DOC**: documentar el ticket y subir bitácora del día.

