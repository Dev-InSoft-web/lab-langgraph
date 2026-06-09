# ISW / ISP ClientesIS

## ISW-ClientesIS · TreeView de contenidos (refactor `flatPath`)
- `TPlanCursoNode`: nueva clase de nodo dedicada al árbol de contenidos del curso. Encapsula `flatPath`, `pathInit`, `objRow` y la inicialización en el constructor (antes disperso entre `TreeNodeUX` y `ContenidosTreeAdapter`).
- `TreeNodeUX` → renombrado a `TreeNode` (homogeniza nomenclatura con resto del módulo de TreeView).
- `ContenidosTreeAdapter`:
  - Migración de identificación de nodos: `nodeId`/`iplan` → `flatPath` para reflejar el orden actual del árbol; `pathInit` conserva la ruta original al cargar.
  - Nuevo soporte para resolver `flatPath` ↔ `pathInit` en operaciones de drag & drop, edición y serialización.
  - `flushTreeForSave` realiza commit explícito antes de persistir (evita estados intermedios).
  - Manejo de errores en arrastre y sincronización de adaptadores.
  - Inyecta `flatPath` en `resume()` y administra atributos relacionados (`iplanpadre` calculado vía `parentFlatPath`).
- `Formulario.svelte` (TreeContenidos):
  - Manejo del atributo `iplanpadre` mediante `parentFlatPath`.
  - Estandarización de etiquetas; mejor presentación de componentes.
  - Sustitución de `Input` ad-hoc por `AtributoInput` para distintos tipos de atributo.
- `TreeView` general:
  - Renombrado `onUiTouch` → `onUiRefresh` y `onuirefresh` → `forceRefresh` en `TAView`, `ContenidosTreeAdapter` y `TPlanCursoUX` (consistencia con el resto de adaptadores).
  - Iconos estandarizados con tipos específicos.
  - `FloatingComponent`: contexto para mantenerlo montado al abrir overlays (mejora UX en árboles con popovers).
  - Commit explícito de nodos en `ContenidosTreeAdapter` para reflejar reordenamientos.

## ISW-ClientesIS · Componentes generales
- `Alert`: iconos estandarizados, título opcional, mejor presentación visual.
- `TipInfo` / `Separator` reorganizados:
  - `TipInfo` → `overlays/`.
  - `Separator` → `primitives/`.
  - Nuevo `InvokedFloater` para gestión de tooltips; eliminadas implementaciones obsoletas y actualizadas todas las referencias.
- `CascadeOptions`: integración del nuevo `Separator` para mejorar la separación visual.

## ISW-ClientesIS · Recursos en plan de curso
- Ajustes de presentación de recursos en el plan de curso (alineados con el nuevo `recurso` que el server expone en `JData2HighDetail`).
- Drivers de plan ajustados por recurso.

## ISP-ClientesIS
- `TPlanDeEstudio`: agregadas propiedades `qprogreso` y `qtotalcursos` (progreso del plan + total de cursos asociados, requeridas por la vista de plan de estudio).
