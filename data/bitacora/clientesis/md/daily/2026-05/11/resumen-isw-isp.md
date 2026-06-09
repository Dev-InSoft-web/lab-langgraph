# ISW / ISP ClientesIS

Bitácora consolidada que cubre el trabajo del 2026-05-09, 2026-05-10 y
2026-05-11. Esos tres días no se documentaron individualmente; el cierre
anterior fue el 2026-05-08.

## 2026-05-09 · TreeView · historial + protección + erradicación de casts

Día dedicado a tres frentes paralelos sobre `ISW-ClientesIS`:

### Historial deshacer/rehacer del árbol

- **`6e6c28f` · `feat`** — Se incorporó un **historial de deshacer y
   rehacer** en el árbol con captura de instantáneas y restauración
   **no destructiva** (no se mutan los nodos restaurados; se reemplazan
   por copias).
- **`1357936`** — Refinamientos del flujo de deshacer y rehacer.
- **`0c26b4d`** — Se reparó un error de asignación a propiedades de
   solo-lectura durante la restauración del historial.
- **`5270f60`** — El botón "Recuperar estado" se ubica entre los de
   deshacer y rehacer y alterna su icono según el estado del historial.
- **`910bac3`** — El botón candado del historial se reemplazó por un
   **toggle de modo protección** con confirmación visual al editar.
- **`5ada599`** — El botón candado de protección se **deshabilita** cuando
   el árbol está en modo lectura por causas externas; se afinaron iconos.
- **`7f0c025`** — El TreeView **reusa el adapter del Controller maestro**
   para preservar el estado del candado y del historial al cambiar de
   pestaña; se simplificaron los `title` de la barra superior eliminando
   descripciones del modo lectura y usando `|` para los atajos.

### Refactor · erradicación de casts estructurales

- **`74bb89e`, `72c8736`** — Se **erradicaron los casts estructurales** del
   adapter mediante tipado fuerte de los contratos internos y declaraciones
   abstractas. La cascada de adapters quedó tipo-segura end-to-end.
- **`9c01259`** (cierre del 2026-05-08, mencionado en bitácora previa) +
   **`6c1b075`** — Las acciones de eliminar y liberar se mantienen visibles
   en modo lectura, aunque deshabilitadas (no se ocultan).
- **`d63e898`** — Se consolidó en el adapter la **mutación in-place** y la
   opcionalidad de hooks; se unificó la nomenclatura de filas.
- **`dd6c3c0`** — Se eliminaron extensiones vacías del adapter; se reforzó
   el tipado del formulario; se ajustó el identificador jerárquico.
- **`371ab60`** — Se **renombraron módulos internos** del adapter a nombres
   de dominio; la resolución de atributos por nivel se trasladó al consumer.
- **`1405d78`** — La capa interna del árbol se separó en **dos módulos por
   responsabilidad**; se expuso un sanitizador de identificadores.
- **`9fd1688`** — Se introdujo un **hook configurable para el rótulo de
   nivel**; se removieron campos de nivel del nodo y se reforzó el tipado.
- **`b2cda15`** — Se sacaron del sistema general los campos derivados del
   nivel y se **particularizaron en el consumer** mediante hooks.
- **`4a956bb`** — Se erradicó el alias específico de fila en el consumer;
   la API pública acepta el tipo base infiriendo la fila aumentada.

### Modal de eliminación y refinamientos visuales

- **`6582b48`** — Encabezado del modal de eliminación en **color de peligro**,
   textos auxiliares en etiqueta reducida y barra de acciones del árbol.
- **`5a86364`** — Se alinearon a la derecha las acciones del modal con un
   margen superior.
- **`63bb07e`** — El **rol de contención por defecto** pasa a `cell`; los
   nodos atómicos no exponen "liberar"; la tarjeta flotante aplica
   `scale(0.8)`.
- **`6185f92`** — Se mantienen visibles las acciones de fila de solo-lectura
   en modo lectura, ocultando únicamente las mutaciones.
- **`c97d53c`** — Forma de **píldora** al área interactiva del marcador
   de agrupación.
- **`7f9dd09`** — Se quitó el botón eliminar de las acciones rápidas de
   fila; se unificó el factor de escala del menú contextual.
- **`616e0cd`** — Refinamientos visuales del refactor de erradicación de
   casts.
- **`856c23f`** — Se refactorizó el **slot del marcador** a un nombre
   semántico; se expusieron banderas de vacío y un hook de expansión.
- **`cf2fe23`** — Se simplificó el subformulario; se eliminó el `import()`
   inline; se consumió el nuevo slot del marcador.
- **`fc63dfe` · `docs`** — Se conservó solo la descripción general por
   interfaz y se removieron las anotaciones documentales por miembro.
- **`438464c`** — Se eliminó la envoltura del adapter para las acciones de
   la barra superior; el hook se llama directamente.

### Fixes funcionales del día

- **`71a8aec`** — El **bind del input de atributos** persiste tras aceptar
   el drawer al usar `onChange/onTypingEnd` y re-localizar la entrada tras
   el setter de `TArray`.
- **`df30b82`** — Los movimientos del árbol **sincronizan `iplan`** y
   remapean `iplanpadre` de inmediato para no perder atributos al reabrir
   el drawer.

## 2026-05-10 · TreeView · UX, scroll, ciclos Svelte 5

Día dedicado a estabilizar el TreeView bajo Svelte 5 y a pulir el UX:

### Estabilización contra ciclos de re-evaluación

- **`83aca4c`** — Se estabilizan referencias de configuración de filas y se
   añade un **guard contra cascadas** para evitar el límite de profundidad
   de effects.
- **`2e29300`** — `mkRowController` se envuelve con **`untrack`** para
   evitar cascada de derived sobre `$$props` en `_rowItem`.
- **`278cd32`** — **Memoización de adapter por `node.pathInit`** en
   `RowItem` para romper el ciclo de re-evaluación del derived.
- **`fe9fd29`, `f59bc35`, `3c2356d`** — Optimización general de la gestión
   de adapters; sincronización sin invalidaciones innecesarias; ajuste de
   bloques reactivos para evitar ciclos de auto-disparo.
- **`2175964`** — Gestión de notificaciones de UI sin reentradas excesivas.

### Scroll del cuerpo y toolbar sticky

- **`cd71129`** — El **scroll vertical** del TreeView vive ahora **solo en
   `.isp-tree-body`** (`overflow-y:auto`, `min-height:0`, `flex 1 1 auto`),
   removiendo el sticky del toolbar superior. El toolbar queda como
   `flex:0 0 auto` fuera del área scrolleable. Además, el **modal de
   protección** ya cierra al hacer click en la X o el backdrop: el bloque
   reactivo controller→UI compara contra `_lastControllerPromptOpen` para
   no sobreescribir el `bshow=false` que el bind hace cuando el usuario
   cierra externamente; se agregó sync UI→controller (`dismissProtectionPrompt`).
- **`89da6cc`** — **Toolbar superior sticky** (`position:sticky, top:0,
   z-index:5`) para que no se oculte al hacer scroll; copy del modal a
   "Árbol protegido" / "El árbol está protegido contra edición".
- **`9d4f3a6`, `72144b7`, `cb3b81d`, `ea47fe9`** — Iteraciones de
   `padding-top` del `.isp-tree-body` (20→10→15→0) hasta dejar el offset
   del *floating card* configurado en el adapter (`ty:15`).
- **`baad1eb`** — `custom-scrollbar` (vía prop `cscroll` + clase explícita)
   para que el scroll use el estilo personalizado del sistema.

### Modo solo-lectura y candado

- **`83fd9ac`** — El click en el candado **desprotege inmediatamente** sin
   importar el origen del lock (manual o `viewing-past` del historial). Se
   agregaron logs de debug exhaustivos en historial/protección y se
   ajustaron los layouts de botones de los modales con `style="width:100%"`
   inline (las reglas scoped `:global` no aplican al portal del Modal). El
   QA se actualizó con bloques I–M (invariantes de flags, modal, layout,
   selección visual y reactividad).
- **`e703a78`** — Se separa el lock del modo solo-lectura del TreeView
   usando un **candado independiente** con icono `mdi:lock-outline` en el
   handle; `canToggleProtection` siempre activo en modo edición; doble
   clic abre el modal incluso cuando la protección proviene de
   `viewing-past` del historial; se agregó la opción **"Rehacer al actual"**
   (variant `ghost`) que rehace todo el futuro pendiente y desprotege en
   un solo paso; distribución de botones de modales a 50/50 o 33/33/33
   según cantidad; se restauró el fondo gris translúcido sutil en
   *grouppers* seleccionados.
- **`d2279a9`** — El botón "Más opciones" (cascade del row) ya no se
   deshabilita por completo en *readonly*; solo se bloquea cuando todas
   las acciones internas están `disabled` o no hay acciones utilizables,
   permitiendo abrir el menú para usar acciones no mutativas (p. ej. ver
   formulario) en *readonly*.
- **`b98df08`** — Se muestra "Ver formulario" en la cascada cuando el árbol
   está en solo-lectura, y vuelve a "editar" al entrar en modo edición.
- **`eade176`** — Se mantienen visibles las opciones de añadir hermanos en
   la cascada cuando el árbol está en solo-lectura, mostrándolas
   deshabilitadas en vez de ocultarlas.
- **`7e77533`** — Se cambia el icono de "ver formulario" por uno de
   documento para diferenciarlo del icono "ver recurso".
- **`6ad84ec`** — Se restaura el efecto de confirmación verde al mover
   filas con las acciones subir/bajar (igual que con drag and drop).

### Roles, hooks y deferred updates

- **`a9e7045`** — Cuando un nodo es **atom** se ignora la dimensión de
   contención para que el consumer no tenga que limpiarla manualmente.
- **`1f7ad5c`** — El ajuste vertical del primer root se aplica desde el
   adapter base; se permite abrir la cascada de "más opciones" aun cuando
   todas sus acciones estén deshabilitadas.
- **`3631295`** — Se difiere el hook de actualización de nodos
   materializados para exponer el árbol completo y permitir identificar
   el primer root.
- **`feb4218`** — Se quita el offset por defecto del *floating* del árbol;
   se permite definirlo por nodo desde el hook de actualización del consumer.

### Iconos y tema

- **`d16ccda` · `feat(icons)`** — Se agregaron íconos SVG para mejorar la
   carga en UI.
- **`9912ad2`** — Se simplificó la lógica de **preferencia de tema** en el
   script de carga.

### Limpieza pre-despliegue

- **`4aa1e17`** — Se retiraron los indicadores de depuración visibles en
   las filas y los registros de consola del árbol previos al despliegue.

## 2026-05-11 · Limpieza, debug producción y módulos Capacitación

### Diagnóstico de producción del Tree

- **`ecca1d7`, `c2bae31`** — Se incorporó **debug en producción** para
   capturar un problema del árbol; un commit por iteración.
- **`8f298a9`** — `TreeRowView` actualizó logs para mejorar la depuración;
   `rowItem` optimizó importaciones y simplificó clases; `TreeContenidos`
   ajustó importaciones y mejoró la gestión de recursos; `Cursos` comentó
   código innecesario para claridad.
- **`630e52f`** — Limpieza y optimización de la configuración del árbol
   de contenidos.

### Server local y handlers globales (Astro dev)

- **`32dacd0`** — Se exponen los errores asíncronos del `listen` y los
   *handlers* globales del server local para diagnóstico (Astro dev no
   estaba reportando errores no capturados).
- **`94fb179`** — Se manejan errores al iniciar el server y se eliminan
   eventos innecesarios.
- **`2a0f0a9`** — Se recuperan tabulaciones anteriores del layout.

### Refactor cross-módulo · Capacitación

- **`20eb5e3` · `feat(TreeView)`** — Se añaden componentes de **vista de
   árbol** y la **documentación técnica general** sobre vistas, adapters
   y elementos compartidos.
- **`f6922cd`** — Refactor de la **lógica interna de los adapters del
   árbol** y estandarización de los componentes para la gestión de
   seguridad.
- **`c91a52c` · `feat(plan-de-estudio)`** — Ajustes en planes de estudio y
   cursos para ContaPymeU.
- **`6b95136`** — Componentes para la **gestión de estructura, seguridad y
   cursos del plan de estudio**.
- **`e60f2bc`, `a0cf4ba`, `d88cb78`** — Renombre de interfaces y ajuste
   de propiedades en componentes de detalle para estandarizar la
   nomenclatura.
- **`19b3925`, `472473c`** — Corrección de nomenclatura `brapido` → `bRapido`
   en componentes de formulario; actualización de imports en seguridad,
   estructura y cursos/prerequisitos.
- **`36102d0`** — Se eliminan logs de consola innecesarios en `TreeRowView`.
- **`3f54a0d`, `68ea14a`, `28b3100`** — Refactor de tipificación en
   `SeguridadAcciones` y `SeguridadCatalogo`; reorganización de
   importaciones y estructura en `Detail`, `GridResponsiveForm`,
   `SecurityLayout`, `SeguridadAcciones`, `SeguridadCatalogo`.
- **`57c19d5`** — Mejora de imports de tipos; eliminación de dependencias
   innecesarias en `SecurityLayout` y `TreeRowView`.
- **`1af9081`** — Renombre y reorganización de acciones de menú en
   `TreeView`; mejora de tipificación; eliminación de dependencias
   innecesarias.
- **`bdc04fd` · `refactor(treeview)`** — Se corrigen bugs de eliminación
   y se **renombran identificadores internos al inglés**.
- **`945b70b`, `6659412`** — Mejora de definición de columnas y filtrado
   de listas; optimización de utilidades de texto; restricciones de
   métodos; **refactor de gestión de recursos en controladores**;
   simplificación del flujo de datos; unificación de columnas;
   actualización de documentación.

## ISP-SvelteComponents — releases `0.0.106` → `0.0.108`

Tres releases consecutivos publicados durante la jornada del 2026-05-11.
Los consumers ISW/ISS deben sincronizar al último (`0.0.108`).

### `0.0.106`

- **`921bb74` · CI** — Despliegue npm para `TK-1420690`.
- **`c0d6667` · TK-1420690** — Agrega datos registrados al `localStorage`
   para completar info en el formulario adicional.
- **`94abd02` · TK-1420690** — Remueve el objeto una vez cargado para que
   no sea reutilizado y cause errores en la aplicación.

### `0.0.107`

- **`32d1e0f` · TK-1420654** — Corrige el error visual del **`BtnRef`** que
   muestra el `span` cuando apenas está cargando.
- **`d69949a`** — `AccionesGen` / `CatalogoGen`: refactor de interfaces y
   mejora de la gestión de propiedades.

### `0.0.108`

- **`47ebac1`** — `AccionesGen` / `CatalogoGen`: refactor y mejora de la
   gestión de propiedades (segunda iteración).
- **`f64a57b`** — `AccionesGen`: corrige indentación y elimina estilos no
   utilizados.
- **`71c0810`** — Mejora las **interfaces de propiedades** en `AccionesGen`
   y `CatalogoGen`.

### Notas adicionales

- **`1c41530`** — Revert del tag `0.0.102` (rollback previo a la rama
   actual).

## ISP-ClientesIS

Sin commits en el periodo. La librería cliente no requirió cambios; los
contratos consumidos por ISW siguen vigentes.

## Estrategias y notas para próximos desarrolladores

### Patrón `AccionesGen` + `CatalogoGen`

`ispsveltecomponents@0.0.108` consolidó las interfaces públicas de los
componentes generales `AccionesGen` y `CatalogoGen`. El consumer ya no
debe declarar tipos locales: importarlos desde el paquete. Los módulos
de Capacitación (Cursos, Estructura, Seguridad, Plan de estudio) los
están reutilizando como base.

### `BtnRef` en estado de carga (TK-1420654)

Antes el `BtnRef` mostraba el `span` del valor renderizado mientras
apenas estaba cargando el catálogo, produciendo un parpadeo visual. El
fix muestra el placeholder de carga hasta que el catálogo confirma. Si
un consumer envuelve `BtnRef`, debe propagar el estado de carga (no
asumir que el span siempre está listo).

### Datos del formulario adicional en `localStorage` (TK-1420690)

El flujo del formulario adicional ahora persiste los datos registrados
en `localStorage` para completar la información cuando el usuario vuelve
a la pantalla. El objeto se **remueve una vez cargado** para que no se
reutilice y cause efectos colaterales en otras sesiones del mismo
navegador.

### Renombre `brapido` → `bRapido`

Convención reafirmada: todos los booleanos en props/modelos usan **camelCase
con prefijo `b`** (`bRapido`, `bAllowed`, `bShow`). Cualquier referencia
en `brapido`, `bAllowed.eliminar` o similar es un bug de tipado a corregir.

### Server local de Astro · errores asíncronos

`32dacd0` expuso los errores asíncronos del `listen` y los *handlers*
globales (`uncaughtException`, `unhandledRejection`) del server local
para que el desarrollador vea el stack cuando Astro dev se cuelga sin
mostrar el error. Si el server local deja de responder pero la terminal
no muestra error, revisar la consola: el handler ahora lo imprime con
stack completo.
