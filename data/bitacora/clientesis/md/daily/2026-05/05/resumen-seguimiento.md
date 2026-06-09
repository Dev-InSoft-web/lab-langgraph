# Avances ContaPymeU

Reporte técnico de los componentes ContaPymeU
(`ISW-ClientesIS`, `ISP-ClientesIS`, `ISP-CLientesISServer`, `ISS-ClientesIS-ContaPymeU`).
Cubre los cambios actualmente publicados (incluye el push del día y los commits
del día anterior que llegaron al `origin/main` en este push).

> Total de commits cubiertos: **66** — 56 en `ISW-ClientesIS`, 4 en
> `ISP-ClientesIS`, 7 en `ISP-CLientesISServer`, 1 en `ISS-ClientesIS-ContaPymeU`.

---

## 1. Tickets atendidos

### TK-1420742 — Opciones para agregar contenido al crear curso
- **Front (`ISW-ClientesIS`)**:
  - `capacitacion/_comps/containers/Alert.svelte`: refactor de props para usar
    semántica de color (`kind: 'info' | 'warning' | 'error' | 'success'`) en
    lugar de propiedades de estilo dispersas; alineación con el patrón de
    `AlertSimple.svelte`.
  - `capacitacion/_comps/containers/AlertSimple.svelte`: simplificación de
    props alineada con la nueva semántica.
  - `capacitacion/cursos/_Details/ListEstructura.svelte`: actualización de
    importaciones tras el refactor de `Alert`.
  - `capacitacion/cursos/_Details/TreeContenidos/ContenidosTreeAdapter.ts`:
    nuevos métodos para preparar nodos del árbol al crear contenido (estado
    inicial, relaciones padre/hijo, defaults de tipo).
  - `capacitacion/cursos/_Details/TreeContenidos/TreeContenidos.svelte`:
    optimización en la construcción de la estructura del árbol.
  - `lib/ContaPymeU/2.Capacitacion/Cursos.ts`: defaults para `Capítulo` /
    `Título` en `TEstructuraCursoSlaveController` (asegura presentación correcta
    cuando el driver del curso es de 2 niveles).
- **Commits**: `2ca58b1`, `18fcc40`.

### TK-1420751 — Catálogo de temas en cursos (consistencia de tipos)
- **Front (`ISW-ClientesIS`)**:
  - `capacitacion/cursos/_Details/General.svelte` y
    `_Details/TreeContenidos/Formulario.svelte`: importaciones y tipos
    consistentes tras el rename `TTema` → `TTemaSoporte` en el cliente
    compartido.
  - `lib/ContaPymeU/2.Capacitacion/Cursos.ts`: ajustes de tipos derivados.
- **Commits**: `1cde3e2`.

### TK-1420754 — Defaults `Capítulo` / `Título` en estructuras de curso
- **Front (`ISW-ClientesIS`)**: incluido en el refactor de `Cursos.ts`
  (`TEstructuraCursoSlaveController`) — defaults para drivers de 2 niveles
  (commit `18fcc40`).
- **Backend (`ISP-CLientesISServer`)**: rename `todoStruct` →
  `JData2HighDetail` en `00_Base.ts`, `01_PlanDeEstudio.ts`, `02_Cursos.ts`
  (alineación con la nomenclatura `JData2*`). **Commit**: `a4bd0ed`.

### TK-1420755 — Listado básico de cursos (mostrar fecha de creación)
- **Backend (`ISP-CLientesISServer`)**:
  - `02_Cursos.ts`: nuevo método `getFieldsListar` que define el subconjunto de
    campos del listado básico (incluye fecha de creación).
  - `00_Base.ts` + `02_Cursos.ts`: nuevo `JData2List` en `TCapacitacionServer`
    (genérico) y override en `TCursoServer` para enriquecer la fila con `tema`
    y `driver` anidados.
- **Front (`ISW-ClientesIS`)**:
  - `capacitacion/cursos/_Details/TreeContenidos/Formulario.svelte`,
    `ContenidosTreeAdapter.ts` y `TreeContenidos.svelte`: mejor gestión de
    títulos/recursos y vinculación del `treeAdapter` desde el árbol.
- **Commits**: `e2ac837`, `55ca9d8` (back), `a740dd4` (front).

### TK-1420813 — Modo visualización en formulario rápido del curso
- **Front (`ISW-ClientesIS`)**:
  - `capacitacion/_comps/containers/form/Detail.svelte`,
    `cursos/_Details/General.svelte`, `ListEstructura.svelte`,
    `ListSeguridad.svelte`: lógica de `readonly` simplificada (un único origen
    desde el contenedor padre, eliminación de banderas redundantes).
  - `lib/ContaPymeU/2.Capacitacion/Cursos.ts`: nuevas columnas de opciones
    (acciones rápidas en el grid) y se completaron `ColOptionDatosCre` /
    `ColOptionDatosUlt` en `lib/const.ts` para incluir `iusuariocre`,
    `iequipocre`, `iusuarioult`, `iequipoult` (la grid ahora muestra los 10
    campos de auditoría según contrato `TObjectBase`).
  - Comentada la línea que forzaba `TCapacitacionBaseClient.local = true`
    (commit `b4745b8`) — habilita uso del backend remoto.
- **Backend (`ISP-CLientesISServer`)**:
  - `02_Cursos.ts`: el servicio de plan de curso ahora incluye datos del
    recurso asociado (commit `4fd7421`, también bumpea `package.json`).
- **Commits**: `c9b7784`, `b4745b8` (front); `4fd7421` (back).

### TK-1420819 — Campos vacíos en grid de curso (Tema/Driver)
- **Backend (`ISP-CLientesISServer`)**: resuelto en `TCursoServer.JData2List`
  incluyendo `tema` y `driver` anidados (mismo cambio que TK-1420755 — commit
  `55ca9d8`).

---

## 2. Cambios estructurales transversales

### Renombrado del catálogo de temas
- **`ISP-ClientesIS`** (commit `53dbf62`):
  - `010 Objetos/6.ContaPymeU/2.Capacitacion/02.Cursos/02.Datos.ts`:
    `TTema` → `TTemaSoporte`.
  - **Eliminado**: `010 Objetos/6.ContaPymeU/2.Capacitacion/130_UlTema.ts`
    (clase `TTemaClient` retirada).
  - `020 Controllers/6.ContaPymeU/2.Capacitacion/UlCapacitacionClient.ts`:
    actualización de referencias.
- **`ISP-CLientesISServer`** (commit `af027af`):
  - `02_Cursos.ts`: `TTemaServer` → `TTemasController` en las configuraciones
    anidadas (consistente con la consolidación en cliente).
- **`ISS-ClientesIS-ContaPymeU`** (commit `439df9d`):
  - `src/functions/FN-Capacitacion.ts`: se elimina el registro de tema dentro
    de la función de capacitación (alineado al rename — el catálogo lo aporta
    `TTemasController`).

### Visualizador de cursos (nuevo)
- **`ISW-ClientesIS`** (commits `84f489b`, `6ce7d49`):
  - **Nueva ruta**: `src/pages/contapymeu/cursos/[id]/index.astro`.
  - **Nuevos componentes**:
    `views/contapymeu/cursos/curso/Curso.svelte`, `_CursoSkeleton.svelte`,
    `_DriverColumnas.svelte`, `_DriverLista.svelte`, `_Header.svelte`.
  - Presentación del curso varía según el driver (`Lista` vs. `Columnas`).
  - Ajustes en cards de recursos (`recursos/drivers/_CardGrandeInfo.svelte`,
    `_CardLista.svelte`, `_CardListaMini.svelte`, `_CardMinTitulo.svelte`,
    `_CardMiniInfo.svelte`).
  - Touch en formulario de recursos: `catalogos/recursos/Formulario.svelte`,
    `_Especificaciones.svelte`, `_General.svelte`,
    `contapymeu/recursos/recurso/_Recurso.svelte`.

### TreeView de contenidos — refactor mayor
> Bloque de **~38 commits** en `ISW-ClientesIS` (la mayoría sin ticket
> asociado; trabajo arquitectónico que llegó al `origin/main` en este push).
> Todos sobre `src/components/views/contapymeu/capacitacion/_comps/TreeView/`.

**Arquitectura:**
- Se introdujo el adaptador de filas `_asRow/` separado del `_treeAdapter/`,
  consolidando el árbol indexado por **ruta plana** (`flatPath`) en lugar de
  `id`. Migración cubierta por `e3cc390` y `6d944c9`.
- Se implementó la gestión de roles `TARoles` (`06-roles.ts`) y la cascada
  `TreeRowAdapter` con sub-mixins `_rowAdapter/` (`00-base`, `01-drag`,
  `02-events`). Commit fundacional: `786fbc0`.
- Se introdujo `TreeNodeUX` como mixin/clase para encapsular la lógica común
  de los nodos (`isAtom`, `master`, etc.). Commits `64ca28a`, `df2a4c6`,
  `5e5c87b`, `5f93f2c`.
- Se consolidaron los `*.svelte.ts` (runas) a `*.ts` (Svelte 4 puro):
  `ContenidosTreeAdapter`, `TPlanCursoUX` (commit `7503911`).
- Documentación interna actualizada: `__TreeView.md`, `__asRow.md`,
  `__TreeAdapter.md`, `__RowAdapter.md`.

**Renombrados clave (consistencia del modelo):**
- `obj` → `objRow` (`94e5b9d`).
- `objWorking` → `objRowWorking` → `itemSlave` → vuelta a `objWorking` con
  cambio de genérico a `TSlave` (`ad62b8a`, `e711402`, `2a9cd65`, `df2a4c6`).
- `children` → `childrens` (`2a9cd65`).
- `CatalogoController` → `slaveController` (`1dbadbb`, `af7c043`).
- `actor` → `roleVector` en gestión de roles (`b5db60d`).
- `bdrag` → `draggable`, `showToolbar` → `showOptions`, slot `pre` → `header`
  (`10a669d`).
- `sortFnBuildTree` → `sortNodes`; eliminados `istack` / `nistack`
  (`90b723b`).
- Eliminados: `TouchGestures.svelte`, `Chip.svelte`, `getlevelname()`,
  `nextLevelTitle`, `isPenultimate`, `_rowAdapter/index.ts`,
  `00-tree-data-cursos.ts`, `_rowAdapter/00-node-mixin.ts`, `CatalogoStub`
  obsoleto (`a158256`, `23401d8`, `a8acd21`, `26356ce`, `10a669d`).

**Funcionalidad nueva en `TreeView`:**
- Soporte para `slaveController` y `onviewresource` en `TreeRowView` y
  `TreeContenidos` (`aff929c`).
- Soporte para `helperRow` en `TreeRowView` + iconografía nueva
  (`public/icons/Iconify/mdi/exit-run.svg`,
  `hand-back-right-off-outline.svg`) — commit `b389ef5`.
- Slots `caret` y `dragHandle` en `TreeRowView` / `TARowBase` / `RowItem`
  (`8815a28`, `9c89284`).
- `currentDragNodeId` para mejor manejo del drag-and-drop (`c5ac233`).
- `getNodeIcon` / `iconParts` / `filterRowActions` (`58b6d28`, `664957d`).
- `uiTick` reemplazando `rowLayoutEpoch` (`5945cd6`).
- Tipos de toolbar: `FlexOptionsInput` → `FlexOptionsAction` (`6e339cc`).

---

## 3. Repositorios involucrados

| Repo | Capa | Commits cubiertos |
|---|---|---|
| `ISW-ClientesIS` | Front (Astro + Svelte) | 56 |
| `ISP-ClientesIS` | Cliente compartido (objetos/controllers) | 4 |
| `ISP-CLientesISServer` | Backend de capacitación | 7 |
| `ISS-ClientesIS-ContaPymeU` | Azure Function de capacitación | 1 |

---

## 4. Listado de commits

### `ISW-ClientesIS` — ContaPymeU / Capacitación (con ticket)
- `b389ef5` feat(TreeView): helperRow en TreeRowView; mejora datos `ContenidosTreeAdapter`.
- `aff929c` feat(TreeView): `slaveController` y `onviewresource` en `TreeRowView` / `TreeContenidos`.
- `1cde3e2` refactor(TK-1420751): importaciones y tipos en `General.svelte` / `Formulario.svelte`.
- `18fcc40` refactor(TK-1420742): semántica de color en `Alert`/`AlertSimple`; preparar nodos en `ContenidosTreeAdapter`; defaults en `TEstructuraCursoSlaveController`.
- `2ca58b1` feat(TK-1420742): colores y propiedades de estilo en `Alert.svelte`; importaciones en `ListEstructura.svelte`.
- `a740dd4` feat(TK-1420755): gestión de títulos/recursos en `Formulario` / `ContenidosTreeAdapter`; vinculación del `treeAdapter` en `TreeContenidos`.
- `c9b7784` refactor(TK-1420813): `readonly` en `Detail`/`General`/`ListEstructura`/`ListSeguridad`; columnas de opciones en `Cursos.ts`.
- `b4745b8` refactor(TK-1420813): comentar `TCapacitacionBaseClient.local = true`.
- `84f489b` feat(cursos): presentación de cursos con diferentes drivers + nueva ruta.
- `6ce7d49` feat(cursos): ajustes varios en visualizador.

### `ISW-ClientesIS` — TreeView (refactor sin ticket)
- `eff93d6` refactor(TreeView): renombrar métodos y actualizar documentación.
- `8d7856e` fix: corregir importaciones de `TPlanCursoUX` y `ContenidosTreeAdapter`.
- `7503911` feat(TreeContenidos): consolida `*.svelte.ts` → `*.ts` (`ContenidosTreeAdapter`, `TPlanCursoUX`).
- `ad62b8a` refactor: `objWorking` → `objRowWorking` para consistencia.
- `94e5b9d` refactor: `obj` → `objRow` en `TreeAdapter` y `ContenidosTreeAdapter`.
- `17e250f` refactor: renombrar métodos de cierre en `TreeRowView` / `TAModel` / `TARoles` / `TPlanCursoUX`.
- `998890f` refactor: encadenamiento opcional en manejo de errores.
- `a8acd21` refactor: eliminar `getlevelname` de `TTreeAdapterContract`.
- `68b8aa9` refactor: eliminar propiedades innecesarias en `TreeRowView` / `TreeContenidos`.
- `1b24961` refactor(`TARowBase` / `TARoles`): simplificar etiquetas y acciones de toolbar.
- `fe1c5c7` refactor(`TARoles` / `TPlanCursoUX`): roles con dimensiones constantes.
- `7ee83cf` refactor(`TAModel`): renombrar parámetros de acción.
- `a158256` refactor: eliminar `Chip.svelte`, reemplazar por `Text` en `TreeContenidos`.
- `23401d8` refactor(`TPlanCursoUX`): eliminar `nextLevelTitle` e `isPenultimate`.
- `676a48a` refactor(`TARoles` / `TreeData`): simplificar gestión de roles.
- `b5db60d` refactor: `actor` → `roleVector` en `TreeRoles` / `TreeContenidos`.
- `e3cc390` refactor(TreeView): migración `id` → `flatPath` (componentes).
- `6d944c9` refactor(TreeView): migración `id` → `flatPath` (adaptadores y contextos).
- `5f93f2c` refactor(`TreeNodeUX`): eliminar propiedades innecesarias.
- `a2179a7` refactor(`TAMutations` / `ITreeData` / `ContenidosTreeAdapter`): propiedades opcionales.
- `700df7c` refactor(`TreeRowViewAdapter` / Events): mover toolbar a clase base.
- `50062ae` refactor: unificar `getRowConfig` en `TreeRowViewAdapter`.
- `664957d` refactor: agregar `filterRowActions` e `iconParts`.
- `c5ac233` refactor: `currentDragNodeId` en gestión de drag-and-drop.
- `e711402` refactor: `itemSlave` → `objWorking` (rollback parcial).
- `b141624` refactor(`TRABase` / `TAModel`): `mergedDisabled` booleano + limpieza.
- `f0e971d` refactor(`ContenidosTreeAdapter` / `TPlanCursoUX`): ordenamiento por `orden`.
- `1dbadbb` refactor: `CatalogoController` → `slaveController`.
- `5945cd6` refactor: `rowLayoutEpoch` → `uiTick`.
- `64ca28a` refactor: `isLeaf` / `isLast` → `isAtom`; introduce `TreeNodeUX`.
- `8815a28` refactor: agregar slots `caret` y `dragHandle`.
- `9c89284` refactor: idem (extiende a `TARowBase` y `RowItem`).
- `1223131` refactor(`TreeRowAdapter`): clic / doble clic con referencias directas.
- `2a9cd65` refactor: `objWorking` → `itemSlave`; `children` → `childrens`.
- `5e3b78e` refactor: corregir errores tipográficos en mensajes de borrado.
- `265a1ec` refactor: optimizar gestión de identificadores y referencias.
- `5e5c87b` refactor: mejorar tipos en adaptadores de filas; mover `TreeNodeUX`.
- `58b6d28` refactor: agregar `getNodeIcon` para iconos por estado.
- `af7c043` refactor: eliminar referencias obsoletas a `CatalogoController`.
- `3f93c20` refactor: simplificar gestión de estado y acciones.
- `26356ce` refactor: simplificar imports; eliminar `_rowAdapter/00-node-mixin.ts` y `CatalogoStub` viejo.
- `6e339cc` refactor: `FlexOptionsInput` → `FlexOptionsAction`.
- `90b723b` refactor: eliminar `istack` / `nistack`; `sortFnBuildTree` → `sortNodes`.
- `df2a4c6` refactor: `TWorking` → `TSlave`; `stack` → `master`; alinear adaptadores.
- `10a669d` refactor F1: eliminar `TouchGestures` y barrel `_rowAdapter/index`; `bdrag` → `draggable`, `showToolbar` → `showOptions`, slot `pre` → `header`.
- `786fbc0` feat(TreeView): TARoles + TreeRowAdapter en cascada + TreeAdapterCatalogoStub + ComplexControl.
- `441a04a` fix(`Cursos`): simplificar inicialización de `seguridades` en `TSeguridadCursoSlaveController`.

### `ISP-ClientesIS`
- `53dbf62` refactor: `TTema` → `TTemaSoporte`; eliminada `TTemaClient`.
- `b625cae` feat(curso): agrega `qprogres` para calcular el progreso de un curso.
- `1e45f26` chore(package): bump a 1.0.158.
- `885f67d` refactor: elimina `planpadre` de `TPlanCurso` y actualiza README.

### `ISP-CLientesISServer`
- `af027af` refactor(cursos): `TTemaServer` → `TTemasController`.
- `e2ac837` feat(TK-1420755): `getFieldsListar` para listado básico.
- `55ca9d8` feat(TK-1420755): `JData2List` en `TCapacitacionServer` con override en `TCursoServer`.
- `a4bd0ed` refactor(TK-1420813): rename `todoStruct` → `JData2HighDetail`.
- `4fd7421` feat(curso): plan de curso entrega datos del recurso.
- `cd80ba2` refactor(cursos): elimina `planpadre` de `iInfoPlanCurso`; ajusta `todoStruct` en `TPlanCursoServer`.
- `01da2fd` chore(package): bump a 1.0.156.

### `ISS-ClientesIS-ContaPymeU`
- `439df9d` fix(capacitacion): elimina registro de tema en la función.
