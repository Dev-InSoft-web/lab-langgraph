# Proyecto ISA-DOC

- Bitácora del 2026-05-11 inicializada consolidando tres jornadas
   (2026-05-09, 2026-05-10 y 2026-05-11) que quedaron sin documentar tras
   el cierre del día 2026-05-08.
- **Cobertura.** Esta bitácora consolida **~120 commits** en `ISW-ClientesIS`,
   **12 commits** en `ISP-SvelteComponents`, **1 commit** en
   `ISP-CLientesISServer` y **1 commit** en `ISS-ClientesIS-ContaPymeU`.
   `ISP-ClientesIS` no tuvo cambios.
- **Publicaciones del paquete ISP.** Se publicaron tres releases consecutivos
   de `ispsveltecomponents`: `0.0.106`, `0.0.107` y `0.0.108`. Los consumers
   ISW/ISS deben sincronizar al último.
- **Frente principal.** El trabajo se concentró en cerrar el ciclo del
   TreeView de Capacitación (historial deshacer/rehacer, candado de
   protección, modo solo-lectura, estabilización de re-evaluaciones bajo
   Svelte 5, ajustes finos de UX) y en preparar el resto del módulo
   Capacitación (Cursos, Estructura, Seguridad, Plan de estudio) para
   reusar el mismo patrón de controladores y componentes generales
   (`AccionesGen`, `CatalogoGen`).

## Estrategias y notas para próximos desarrolladores

### Reentradas / ciclos de derived en Svelte 5

Durante el 2026-05-10 aparecieron varios ciclos de auto-disparo en el
TreeView al migrar componentes compartidos a runas (Svelte 5). Patrones
que resolvieron el problema:

- **Memoizar adapters por `node.pathInit`** en `RowItem` para que el
   derived no se recalcule por identidad de objeto.
- Envolver constructores de controladores de fila (`mkRowController`) con
   `untrack` cuando se llaman desde un derived que depende de `$$props`,
   para que la lectura de props no re-suscriba el derived.
- Estabilizar la **referencia de la configuración de fila**: emitir el
   mismo objeto entre evaluaciones (cachear por nodo) en lugar de devolver
   un literal nuevo en cada lectura.
- Añadir **guards de cascada** (contador de profundidad o flag
   `_lastXxxOpen`) en los bloques reactivos que sincronizan modelo→UI y
   UI→modelo para no sobreescribir un cambio que el bind acaba de emitir.

Regla práctica: cuando un componente Svelte 5 alcanza el límite de
profundidad de effects, sospechar primero del derived que devuelve un
objeto recién construido. Pasar a memoización por clave estable.

### Tree historial — captura no destructiva

El historial deshacer/rehacer del árbol se implementó con **instantáneas
no destructivas** (no se mutan los nodos restaurados; se reemplaza la
referencia). El candado de protección es **independiente del modo
solo-lectura externo**: el botón candado se deshabilita cuando el árbol
está en lectura por causas externas, y el modal de "Árbol protegido" tiene
sincronización bidireccional con el controller (cierre por X o backdrop
no se sobreescribe). La acción "Rehacer al actual" rehace todo el futuro
pendiente y desprotege en un solo paso.

### Roles del nodo como dimensiones independientes

Los nodos del TreeView dejaron de tener un flag "tipo" único y ahora
exponen **dimensiones independientes vía getters por nodo** (contención:
`group`/`atom`/`cell`; mutación: visible/oculto/disabled). La decisión de
mostrar marcadores, acciones de añadir hijos o liberar se toma leyendo el
getter de rol, no inspeccionando metadatos. Los nodos atómicos ignoran la
dimensión de contención automáticamente: el consumer no tiene que
limpiarla a mano.

### Erradicación de casts estructurales del adapter

El adapter del árbol quedó sin un solo `as Foo` estructural. Se logró
mediante:

- Declaraciones abstractas en las clases base que el consumer concreta.
- Tipado fuerte de los **contratos internos** (`IContract`, `IModel`)
   para que la inferencia funcione end-to-end.
- Eliminación de la **envoltura de objeto**: los nodos quedaron como
   registros del dominio decorados in-place (no `{ data, meta }`).
- Eliminación de campos derivados del nivel (`nivel`, `bUltimoNivel`,
   `levelTitle`) del nodo: ahora se calculan vía hooks del consumer.

Regla: si aparece un `as` estructural en el adapter, está mal modelado un
contrato. Volver al contrato base y abstraerlo.

### Componentes generales `AccionesGen` y `CatalogoGen`

`ispsveltecomponents@0.0.107+` expone interfaces más completas de
propiedades para los componentes generales `AccionesGen` y `CatalogoGen`,
pensados para reutilizarse en cualquier módulo (Capacitación los está
usando en Seguridad, Estructura y Plan de estudio). El consumer ya no
debe declarar tipos locales: importarlos del paquete.
