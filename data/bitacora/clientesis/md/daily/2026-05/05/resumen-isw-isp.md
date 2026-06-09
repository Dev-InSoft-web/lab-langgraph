# ISW / ISP ClientesIS

## ISW-ClientesIS · Cursos
- Visualizador de cursos: ajustes varios y nueva presentación según el driver del curso.
- `TK-1420813` — Modo visualización en formulario rápido:
  - Simplificada la lógica de `readonly` en `Detail.svelte`, `General.svelte`, `ListEstructura.svelte` y `ListSeguridad.svelte`.
  - Agregadas columnas de opciones en `Cursos.ts`.
  - Comentada la línea que forzaba `TCapacitacionBaseClient.local = true`.
- `TK-1420755` — Títulos y recursos:
  - Mejor manejo de títulos y recursos en `Formulario.svelte` y `ContenidosTreeAdapter.ts`.
  - `TreeContenidos.svelte`: vinculación del `treeAdapter`.
- `TK-1420742` — Alertas y estructura:
  - Ajustes de colores y propiedades de estilo en `Alert.svelte` (semántica de color, simplificación de props).
  - `AlertSimple.svelte` alineado.
  - `TreeContenidos` / `ContenidosTreeAdapter`: nuevos métodos para preparar nodos y optimización de la estructura.
  - `TEstructuraCursoSlaveController`: valores por defecto para estructuras (incluye `Capítulo` / `Título`).
- `TK-1420751` — Catálogo de temas: importaciones y tipos coherentes en `General.svelte` y `Formulario.svelte`.
- `TreeView`:
  - Soporte para `slaveController` y `onviewresource` en `TreeRowView` y `TreeContenidos`.
  - Soporte para `helperRow` en `TreeRowView` y mejora en la estructura de datos de `ContenidosTreeAdapter`.

## ISP-ClientesIS
- Reemplazo de `TTema` por `TTemaSoporte`; eliminada la clase `TTemaClient`. Se alinean los objetos de Capacitación con el catálogo común de temas.
