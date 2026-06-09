# Avances ContaPymeU

Reporte consolidado de los días 2026-05-09, 2026-05-10 y 2026-05-11.
Cubre los componentes ContaPymeU (`ISW-ClientesIS`, `ISP-ClientesIS`,
`ISP-CLientesISServer`, `ISS-ClientesIS-ContaPymeU`) y el paquete
compartido `ispsveltecomponents`.

> Total de commits cubiertos: **~120 ISW + 12 ISP-SvelteComponents +
> 1 ISP-Server + 1 ISS** = **~134 commits**.
> Publicaciones de paquete: **`ispsveltecomponents@0.0.106`, `0.0.107` y
> `0.0.108`**. Sin publicación de `ispclientesis` ni
> `ispclientesisserver`.

---

## 1. Frentes principales

### 1.1 TreeView de Capacitación · cierre del ciclo

El TreeView del módulo **Capacitación → Cursos → Plan de contenidos**
recibió tres días continuos de trabajo:

- **2026-05-09 · Historial, candado y erradicación de casts.** Se
   incorporó un historial completo de deshacer/rehacer con instantáneas
   no destructivas; el candado de protección quedó como toggle visual
   independiente del modo solo-lectura; el adapter del árbol se quedó
   sin un solo cast estructural (todo vía contratos abstractos).
- **2026-05-10 · UX, scroll y ciclos Svelte 5.** Se estabilizó el
   componente bajo Svelte 5 (memoización por `pathInit`, `untrack` en
   `mkRowController`, guards de cascada). El scroll vertical se centralizó
   en `.isp-tree-body`; el toolbar quedó sticky; el modal de protección
   cierra correctamente por X/backdrop. Se separó el lock del modo
   readonly y se agregó la opción "Rehacer al actual".
- **2026-05-11 · Limpieza, debug producción y módulos derivados.** Se
   añadió debug instrumentado para diagnosticar un problema reportado
   en producción; se limpió la configuración del árbol; se documentó la
   vista de árbol y los adapters. Los nuevos componentes de Capacitación
   (Estructura, Seguridad, Plan de estudio) ya reutilizan la base.

### 1.2 Componentes generales `AccionesGen` / `CatalogoGen`

`ispsveltecomponents@0.0.107` y `0.0.108` consolidaron las **interfaces
públicas** de los componentes generales `AccionesGen` y `CatalogoGen`.
Esto desbloquea a los consumers para reutilizarlos sin declarar tipos
locales. Capacitación los está adoptando como base de Seguridad,
Estructura y Plan de estudio.

### 1.3 Plan de estudio · de extremo a extremo

- **ISS (`ab230bb`)** · Nuevo servicio Function que devuelve el detalle
   completo del plan de estudio en un solo viaje.
- **ISP-Server (`cb69a5c`)** · El server descarta atributos sin valor
   antes de persistir el plan, evitando registros vacíos en la BD.
- **ISW (`c91a52c`, `6b95136`)** · El frontend de ContaPymeU agregó la
   pantalla del Plan de estudio y los componentes para gestionar
   estructura, seguridad y cursos del plan.

---

## 2. Tickets atendidos

### TK-1420690 — Datos del formulario adicional en `localStorage`

(`ispsveltecomponents@0.0.106`)

El flujo del formulario adicional ahora **persiste los datos registrados
en `localStorage`** para autocompletar la información cuando el usuario
vuelve a la pantalla, y **remueve el objeto una vez cargado** para que
no se reutilice en otra sesión y cause efectos colaterales.

### TK-1420654 — Error visual del `BtnRef` durante la carga

(`ispsveltecomponents@0.0.107`)

El `BtnRef` mostraba el `span` con el valor renderizado mientras apenas
estaba cargando el catálogo, produciendo un parpadeo visual. El fix
preserva el placeholder de carga hasta que el catálogo confirma el
estado.

---

## 3. Cambios estructurales transversales

### TreeView · roles del nodo como dimensiones independientes

Los nodos del TreeView dejaron de tener un único "tipo" y ahora exponen
**dimensiones independientes** por getter por nodo:

- **Contención:** `group` (puede tener hijos), `atom` (no), `cell` (default).
- **Mutación:** visible / oculto / disabled.

Las decisiones de UI (mostrar marcadores, acciones de añadir hijos,
liberar) se toman leyendo los getters de rol, no inspeccionando
metadatos del nodo. Los nodos `atom` ignoran automáticamente la dimensión
de contención; el consumer no tiene que limpiarla.

### TreeView · erradicación de casts estructurales

El adapter del árbol quedó **sin un solo cast estructural**. Se logró:

- Declaraciones abstractas en las clases base que el consumer concreta.
- Tipado fuerte de los contratos internos (`IContract`, `IModel`).
- Eliminación de la envoltura de objeto: los nodos quedaron como
   registros del dominio decorados *in-place*.
- Campos derivados del nivel (`nivel`, `bUltimoNivel`, `levelTitle`)
   salieron del nodo y se calculan vía hooks del consumer.

### TreeView · estabilización bajo Svelte 5

Los ciclos de re-evaluación del derived se rompieron con:

- **Memoización por `node.pathInit`** del adapter en `RowItem`.
- **`untrack`** en `mkRowController` cuando se llama desde un derived
   que depende de `$$props`.
- **Estabilización de referencias** de la configuración de fila (no
   devolver objeto literal en cada lectura).
- **Guards de cascada** (`_lastXxxOpen`) en los bloques reactivos que
   sincronizan controller↔UI para no sobreescribir un cambio que el bind
   acaba de emitir.

### Renombre transversal `brapido` → `bRapido`

Convención reafirmada: todos los booleanos en props/modelos siguen
**camelCase con prefijo `b`** (`bRapido`, `bAllowed`, `bShow`). Se
unificó en componentes de formulario y sus imports correspondientes
(cursos, prerequisitos, seguridad, estructura).

### Server local de Astro · errores asíncronos

Se expusieron los errores asíncronos del `listen` y los *handlers*
globales (`uncaughtException`, `unhandledRejection`) para que el
desarrollador vea el stack cuando Astro dev se cuelga sin mostrar el
error. Si el server local deja de responder, revisar la consola: el
handler ahora imprime el error con stack completo.

---

## 4. Estado de despliegue

| Componente | Versión / Tag | Estado |
|---|---|---|
| `ispsveltecomponents` | `0.0.108` | **Publicado** en npm |
| `ispclientesis` | `1.0.162` | Sin cambios |
| `ispclientesisserver` | `1.0.158` | **Pendiente release** (`cb69a5c`) |
| `ISS-ClientesIS-ContaPymeU` (Function) | — | **Pendiente despliegue** (`ab230bb`) |
| `ISW-ClientesIS` (Astro) | — | **Pendiente despliegue** a `clientesis.azurewebsites.net` |

---

## 5. Plan de pruebas QA · trabajo de los tres días

### A. Historial deshacer/rehacer

1. Sobre un curso con Plan de contenidos abierto, realizar 3 mutaciones
   secuenciales (Insert above, Insert child, Delete).
2. Pulsar **deshacer** las 3 veces. Verificar que cada paso restaura
   exactamente el estado anterior; los nodos restaurados no traen
   mutaciones residuales (no destructivo).
3. Pulsar **rehacer** las 3 veces. Verificar que el árbol vuelve al
   estado tras las 3 mutaciones.
4. Tras una mutación nueva en mitad del historial, verificar que el
   futuro pendiente se borra (rama lineal).
5. Tras varias mutaciones, pulsar **"Rehacer al actual"**: verificar que
   se rehace todo el futuro pendiente y se desprotege en un solo paso.

### B. Candado de protección

1. Activar el candado. Verificar que cualquier acción mutativa abre el
   modal "Árbol protegido".
2. Cerrar el modal con la X, con el backdrop y con el botón "Cancelar":
   en los tres casos el modal cierra y el árbol queda protegido.
3. Aceptar el modal: el árbol se desprotege y la acción procede.
4. Cuando el árbol está en lectura por causa externa (p. ej. `viewing-past`
   del historial), el candado se ve **deshabilitado**, pero el doble
   clic sobre él sigue abriendo el modal para desproteger explícitamente.

### C. Modo solo-lectura

1. Forzar modo readonly desde el consumer. Verificar:
   - Las acciones de fila **no mutativas** (Ver formulario, Ver recurso)
      siguen visibles.
   - Las acciones **mutativas** quedan ocultas o deshabilitadas; no se
      ejecutan al pulsarlas.
   - La cascada "Más opciones" se abre si tiene al menos una acción
      utilizable; se bloquea solo cuando todas están `disabled`.
   - "Añadir hermanos" en la cascada queda visible pero deshabilitado
      (no oculto).

### D. Scroll y toolbar sticky

1. Crear un curso con muchos capítulos (>30 nodos en el árbol). Verificar:
   - El scroll vertical funciona sobre `.isp-tree-body` y no sobre el
      contenedor exterior.
   - El **toolbar superior queda sticky** y no se oculta al hacer scroll.
   - El *floating card* (toolbar flotante de la fila) no queda recortado
      por el `overflow` del scroll (offset `ty:15` desde el adapter).
   - El scroll usa el estilo personalizado del sistema (`custom-scrollbar`).

### E. Reactividad / Svelte 5

1. Abrir el TreeView con el devtools de Svelte. Verificar que **no hay
   re-evaluaciones cíclicas** del derived al:
   - Cambiar la selección de fila.
   - Editar atributos del drawer y aceptar.
   - Mover una fila con drag and drop o con subir/bajar.
2. Verificar que **no aparece** el mensaje "effects exceeded depth"
   en consola.

### F. Plan de estudio (Function + Server + ISW)

1. Abrir el módulo Plan de estudio en ContaPymeU. Verificar que el
   detalle del plan se carga en **un único viaje** (revisar la
   pestaña Network: una sola request al endpoint nuevo de la Function).
2. Crear un nuevo plan con varios nodos y atributos. Verificar que los
   atributos **sin valor no se envían** al backend (revisar el payload
   de POST).
3. Modificar un atributo a valor vacío. Verificar que el server lo
   descarta (intencionalmente).

### G. `AccionesGen` / `CatalogoGen` (Estructura, Seguridad, Cursos)

1. Abrir Estructura, Seguridad y Cursos del plan de estudio. Verificar:
   - Los componentes generales renderizan correctamente con las nuevas
      interfaces de propiedades.
   - No hay errores de tipos en consola.
   - Las acciones (CRUD) funcionan en cada módulo.

### H. Regresiones del TK-1420690 y TK-1420654

1. **TK-1420690.** Llenar el formulario adicional y cerrar sin guardar.
   Volver a abrir el módulo: el formulario aparece autocompletado con
   los datos previos. Tras guardarlo, salir y volver a entrar: el
   formulario aparece **vacío** (el objeto se removió tras la carga).
2. **TK-1420654.** Abrir un módulo con `BtnRef`. Verificar que durante
   la carga del catálogo aparece solo el **placeholder de carga**
   (no el `span` parpadeante con el valor renderizado).
