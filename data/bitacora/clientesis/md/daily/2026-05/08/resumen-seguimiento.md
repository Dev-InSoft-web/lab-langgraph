# Avances ContaPymeU

Reporte del día sobre los componentes ContaPymeU
(`ISW-ClientesIS`, `ISP-ClientesIS`, `ISP-CLientesISServer`,
`ISS-ClientesIS-ContaPymeU`).

> Total de commits cubiertos: **35** — todos en `ISW-ClientesIS`. No hubo
> publicaciones de paquetes ISP ni cambios en el server hoy.

---

## 1. Tickets atendidos

### TK-1423165 — Hallazgos en Plan de contenidos del curso

El ingeniero reportó cuatro hallazgos del módulo **Capacitación → Cursos →
Plan de contenidos** (vista del árbol de capítulos/títulos del curso). Se
atendieron los cuatro en la misma jornada.

- **Nomenclatura de campos por nivel.** Antes los campos del formulario del
   nodo del árbol se llamaban genéricamente "Código", "Nombre", "Atributos".
   Ahora se ven como **"Código del capítulo"**, **"Nombre del subcapítulo"**,
   **"Atributos del título"**, etc., usando el nombre del nivel definido en
   la estructura del curso. Las etiquetas dinámicas usan minúsculas para que
   se lean como prosa natural.

- **Atributos de los capítulos según el nivel.** Antes los atributos
   adicionales (URL diapositivas, imagen del profesor, dificultad,
   documento, etc.) se mostraban en todos los niveles del árbol, incluso en
   los capítulos intermedios donde no aplican. Se restringieron al **último
   nivel** (donde el nodo es ya un título de un recurso). Adicionalmente:
   - El selector de **Tema** quedó visible en **todos los niveles** (porque
      cualquier capítulo intermedio puede tener un tema asociado), y
      **hereda automáticamente** el tema del ancestro más cercano que lo
      tenga definido cuando se crea un nodo nuevo.
   - El selector de **Recurso** quedó exclusivo del último nivel.

- **Apertura del catálogo del recurso.** Al crear un nuevo título (último
   nivel), el selector de Recurso ahora **se abre automáticamente** para
   que el usuario seleccione directamente el recurso, sin tener que hacer
   un clic adicional. Si el usuario no había escrito un nombre para el
   título, al elegir el recurso el **nombre del recurso pasa al nombre del
   título**; si ya había escrito uno, se preserva.

- **Creación del recurso bajo el padre correcto.** Las acciones
   *Insert Above*, *Insert Below* e *Insert Child* ahora respetan el padre
   real del nodo solicitante. Antes la ruta del nuevo nodo se calculaba
   contra el cursor del árbol y, en escenarios de varios niveles abiertos,
   el nuevo registro caía en la rama equivocada. El drawer del formulario
   también abre con los **datos del nuevo registro** (no con los del nodo
   sobre el que se invocó la acción).

**Despliegue.** Pendiente de despliegue formal a
`clientesis.azurewebsites.net` (pendiente de definir ventana).

---

## 2. Cambios estructurales transversales

### Refactor del componente TreeView (Plan de contenidos)

La mayor parte del día se invirtió en un **refactor profundo del componente
TreeView** del módulo Capacitación. La meta: eliminar todo conocimiento del
dominio dentro del componente compartido del módulo y dejar que el side
consumer (la vista del curso) declare lo específico (nombres de niveles,
herencia de campos, apertura del selector, atajos no navegacionales).

Resultado:

- El componente compartido ya no instancia adaptadores específicos del
   consumidor; los recibe vía `customs.updateNode` y una clase de dominio
   mínima.
- La cascada de adaptadores quedó como `00-context → 01-contract → 02-model
   → 03-tree → 04-view → 05-mutations → 06-roles`, sin "adaptadores hoja"
   por consumidor.
- Las acciones de fila quedaron generalizadas en un único *runtime* que
   procesa la interacción (clic, navegación, atajos).
- Los íconos de carpetas y la *augmentation global* del tipo de plan
   desaparecieron en favor de aliases locales del consumidor (no contaminan
   los demás módulos).

Esta limpieza es prerrequisito del trabajo siguiente sobre el plan de
contenidos: con el componente "tonto" respecto al dominio, los próximos
ajustes tocan únicamente el side consumer.

### Front (`ISW-ClientesIS`)

- Drawer del nodo ahora abre con los datos del nuevo registro al insertar
   arriba/abajo/hijo (fix de rebind del record fresco tras `onrefresh`).
- Estado expandido/colapsado del árbol se preserva tras mutaciones que
   reconstruyen el árbol.
- Etiquetas del formulario reflejan el nombre del nivel ("Código del
   capítulo", "Atributos del título", …) en minúsculas.
- Inyección de agrupadores intermedios ausentes detrás de un flag QA en
   `false` por defecto.
- Selectores de Tema (todos los niveles) y Recurso (último nivel) con
   herencia de tema desde el ancestro más cercano y autoapertura del modal
   de Recurso al crear un título nuevo.
- `BtnRefAutoOpen` simplificado: usa el callback canónico
   `onSelectedRecord` del `BtnRef` (el nombre `onRecursoSelected` no existe
   en la API y se ignoraba silenciosamente). Cuando el usuario selecciona
   un recurso desde el modal autoabierto y el nombre del título está vacío,
   se autocompleta con `nrecurso`; si ya tenía nombre, se preserva.

### Documentación (ISA-DOC)

- Migración del helper de íconos en bitácora/tickets para correos
   email-safe: los helpers `note`/`h3Iconized` y los locales del
   `TK-1418894.ts` ahora renderizan `<img src="https://api.iconify.design/&hellip;?color=&hellip;">`
   en vez de embeber SVG inline. Outlook no pinta SVG inline; el `<img>` lo
   renderiza nativo.

---

## 3. Repositorios involucrados

| Repo | Capa | Commits cubiertos |
|---|---|---|
| `ISW-ClientesIS` | Front (Astro + Svelte) | 35 |
| `ISP-ClientesIS` | Cliente compartido (objetos/controllers) | 0 |
| `ISP-CLientesISServer` | Backend de capacitación | 0 |
| `ISS-ClientesIS-ContaPymeU` | Azure Function de capacitación | 0 |

---

## 4. Listado de commits

### `ISW-ClientesIS`

#### Cierre funcional del Plan de contenidos

- `9ecab82` fix(capacitacion): se autocompleto el nombre del titulo con el nombre del recurso seleccionado cuando el titulo estaba vacio
- `bae5e32` fix(capacitacion): se corrigieron los tipos del selector autoabierto del recurso
- `69d6c66` feat(capacitacion): se incluyo el selector de tema en niveles intermedios y se abrio el selector de recurso al crear un nuevo titulo, ademas de heredar el tema del ancestro mas cercano
- `1f242d4` fix(capacitacion): se restringio los selectores de tema y recurso al ultimo nivel del plan de contenidos

#### Hallazgos en mutaciones del árbol

- `4f75c36` fix(treeview): se abrio el formulario con los datos del nuevo registro al agregar arriba, abajo o como hijo
- `fb5829f` fix(treeview): se preservo el estado expandido de los nodos despues de mutaciones que reconstruyen el arbol
- `39f8f9f` chore(treeview): se dejo la inyeccion de huerfanos detras de un flag QA en falso por defecto
- `1bd146c` style(treeview): se paso a minusculas el nombre del nivel en las etiquetas del formulario
- `a3b13d5` feat(treeview): se ajustaron las etiquetas del formulario para reflejar el nombre del nivel en codigo, nombre y atributos
- `031068f` feat(treeview): se asignaron nomenclaturas legibles a los agrupadores autoconstruidos usando el nombre del nivel
- `d21af38` feat(treeview): se autoconstruyen los agrupadores faltantes para que ningun nodo quede huerfano sin importar su profundidad
- `8b1fefe` fix(treeview): se corrigió la ruta de los hijos y hermanos para que respeten el padre solicitante

#### Refactor estructural del componente

- `cce80cf` refactor(treeview): se externalizaron los atajos no navegacionales hacia el customs
- `019e30c` refactor(treeview): se eliminó la abstracción de la cascada de adaptadores
- `77aa6c3` refactor(treeview): se eliminó el controlador esclavo y se trasladó la apertura del selector al consumidor
- `8298090` refactor(treeview): se erradicaron las propiedades del componente que pertenecen al consumidor
- `0b14cd0` refactor(treeview): se removieron las propiedades de profundidad y rótulo de nivel en favor de updateNode
- `b3c8afc` refactor(treeview): se incorporó la extinción de nodo guiada por el rol de contención
- `50d3ae9` refactor(treeview): se generalizaron las acciones de fila con un runtime enriquecido
- `ca5d946` refactor(treeview): se trasladaron la profundidad máxima y el rótulo de nivel a propiedades del componente
- `c91b8f4` refactor(treeview): se compactaron las preparaciones de nodos en un único hook updateNode
- `8d0de6c` refactor(treeview): se infirió la creación del nodo a partir de la clase de dominio
- `f44d8e5` refactor(treeview): se trasladó el manejador de Ctrl+Enter al contrato de customs
- `3533fcb` refactor(treeview): se erradicó el controlador de listado del side consumer
- `84c52af` refactor(treeview): se eliminó el alias de fila y se expuso desde el componente
- `1c5c6f5` refactor(treeview): se trasladó la instanciación del adaptador al componente
- `95365ba` refactor(treeview): se reemplazó la augmentation global del tipo de plan por un alias local del consumidor
- `19db3e5` refactor(treeview): se eliminó la clase de nodo específica y se restauraron los iconos de carpetas por defecto
- `9b00e2d` refactor(treeview): se redujo el nodo del consumer a un envoltorio estructural y se separó la rutina de envío
- `16a1dad` refactor(treeview): se eliminó el adaptador específico del consumer en favor de configuración declarativa
- `9364eae` refactor(treeview): se trasladó la construcción de la configuración de fila al adaptador base
- `e812ad9` refactor(treeview): se trasladó la lógica de refresco de nodos al adaptador base
- `27305a4` chore: se añadió la exclusión de artefactos temporales del refactor
- `5eba551` refactor(capacitacion): se renombró la propiedad de título de detalles para clarificar su rol como etiqueta de pestaña

### `ISP-ClientesIS`

- Sin commits hoy.

### `ISP-CLientesISServer`

- Sin commits hoy.

### `ISS-ClientesIS-ContaPymeU`

- Sin commits hoy.
