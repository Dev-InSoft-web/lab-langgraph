# ISW / ISP ClientesIS

## ISW-ClientesIS · TreeView (capacitación) · refactor estructural

Refactor profundo del TreeView (Plan de contenidos del curso) orientado a
**eliminar conocimiento del dominio dentro del componente compartido** y dejar
que el consumidor defina la cascada de adaptadores. El orden cronológico de
los commits permite reconstruir el avance:

- **`5eba551` · `refactor(capacitacion)`** — Renombre de `title` por una
   propiedad explícita que comunica su rol como etiqueta de pestaña.
- **`27305a4` · `chore`** — `.gitignore` ignora `REFACTOR_PLAN.md` y
   `.refactor-snapshots/` (artefactos del refactor, no versionables). El
   directorio se eliminó tras cerrar el ciclo (commit posterior).
- **`e812ad9` → `9364eae`** — La lógica de **refresco** y la **construcción
   de la configuración de fila** se trasladaron al adaptador base, lejos del
   componente Svelte y de adaptadores hoja.
- **`16a1dad`** — Eliminado el adaptador específico del consumer; la
   configuración pasó a ser declarativa.
- **`9b00e2d`** — El nodo del consumer quedó como envoltorio estructural
   puro; la rutina de envío se separó.
- **`19db3e5`** — Se eliminó la clase de nodo específica del consumer y se
   restauraron los íconos de carpetas por defecto del componente compartido.
- **`95365ba`** — Se reemplazó la *global augmentation* del tipo de plan por
   un alias local del consumidor (no contamina los demás módulos).
- **`1c5c6f5`** — La **instanciación del adaptador** se movió al componente
   (antes el consumidor instanciaba a mano y pasaba por prop).
- **`84c52af`** — Eliminado el alias de fila; ahora se expone desde el
   componente.
- **`3533fcb`** — Erradicado el controlador de listado en el side consumer
   (responsabilidad indebida).
- **`f44d8e5`** — `Ctrl+Enter` migra al contrato `customs` (no navegacional).
- **`8d0de6c`** — La creación de nodos se infiere a partir de la clase de
   dominio (sin factory boilerplate).
- **`c91b8f4`** — Las preparaciones de nodos quedan en un único hook
   `updateNode` (antes había varias funciones dispersas).
- **`ca5d946` → `0b14cd0`** — Las propiedades `maxDepth` y `levelTitle` se
   modelan a través de `updateNode`, en lugar de ser props del componente.
- **`50d3ae9`** — Las acciones de fila se generalizan con un *runtime*
   enriquecido (un único pipeline gestiona toda la interacción de fila).
- **`b3c8afc`** — La **extinción** (eliminación) de nodo se guía por el rol
   de contención (atom/group), no por un flag manual.
- **`8298090`** — Se erradicaron props del componente que pertenecen al
   consumidor (limpieza de la API pública).
- **`77aa6c3`** — Se eliminó el controlador esclavo del componente; la
   apertura del selector quedó del lado del consumidor.
- **`019e30c`** — Se eliminó la abstracción de la **cascada** de adaptadores;
   ahora la composición es directa.
- **`cce80cf`** — Atajos no navegacionales (Insert, Ctrl+Insert, Delete) se
   externalizaron al `customs`.

## ISW-ClientesIS · TreeView (capacitación) · cierre funcional

Sobre la base estable del refactor, se atendieron los hallazgos del usuario
en QA del módulo Capacitación → Cursos:

- **`8b1fefe` · `fix(treeview)`** — Insert “arriba/abajo/como hijo” respeta
   el padre del nodo solicitante. Antes la ruta del nuevo nodo se calculaba
   contra el cursor del árbol, no contra el padre real, y el registro caía
   en la rama equivocada.
- **`d21af38`** — Cuando el árbol recibe nodos hijos sin sus agrupadores
   intermedios, el componente los **autoconstruye** para que ningún nodo
   quede huérfano, sin importar la profundidad.
- **`031068f`** — Esos agrupadores autoconstruidos toman su nombre legible
   del nivel correspondiente (Capítulo, Subcapítulo, Título, …).
- **`a3b13d5` + `1bd146c`** — El formulario del nodo refleja el **nombre del
   nivel** en las etiquetas: “Código del capítulo”, “Nombre del título”,
   “Atributos del subtítulo”, etc. Las etiquetas dinámicas usan minúsculas.
- **`39f8f9f`** — La inyección de agrupadores huérfanos quedó detrás de un
   flag QA, en `false` por defecto: solo se activa cuando el dataset trae
   nodos sin sus padres y el ingeniero lo habilita explícitamente.
- **`fb5829f`** — Tras una mutación que reconstruye el árbol (insert/delete)
   se preservó el estado expandido/colapsado de los nodos. Antes todo
   colapsaba y el usuario perdía el contexto visual.
- **`4f75c36`** — Al insertar arriba/abajo/hijo, el **drawer abre con los
   datos del nuevo registro** (no con los del nodo de partida). Causa raíz:
   tras `applySelection` el record apuntaba a un `TListObj` *standalone* con
   `objRow=undefined`; el fix rebindea al `INode` fresco del árbol después
   del `onrefresh()`.

## ISW-ClientesIS · TreeView (capacitación) · reglas de los selectores

Cierre funcional sobre los `BtnRef` del formulario del nodo (Tema y Recurso):

- **`1f242d4`** — Solo el **último nivel** del plan de contenidos muestra
   los selectores de Tema y Recurso (eran visibles en todos los niveles).
- **`69d6c66`** — Se ajustó la regla:
   - El selector de **Tema** se muestra en **todos los niveles** (no solo el
      último), porque incluso los agrupadores intermedios pueden tener tema.
   - El selector de **Recurso** sigue exclusivo del último nivel.
   - Al **crear un nuevo título** (último nivel), el selector de Recurso se
      **autoabre**.
   - Al crear un nodo en cualquier nivel, se **hereda automáticamente** el
      tema del ancestro más cercano que tenga uno definido. La búsqueda
      camina ancestros desde el `treeAdapter` recuperado por el side consumer.
- **`bae5e32`** — Fix de tipos TS del selector autoabierto del recurso
   (`TDForm`, `value: string | number`).
- **`9ecab82`** — Cuando el usuario selecciona un recurso desde el selector
   autoabierto, el **nombre del recurso (`nrecurso`) pasa al `Nombre del
   título`** del plan **solo cuando el campo está vacío**. Si el usuario ya
   escribió un nombre, este se preserva.
   - Causa raíz: el callback `onRecursoSelected` no existe en la API real de
      `BtnRef`; el callback canónico es `onSelectedRecord`. Se renombró en
      `Formulario.svelte` y se eliminó la prop sobrante de
      `BtnRefAutoOpen.svelte`.

## ISP-ClientesIS / ISP-CLientesISServer / ISS-ClientesIS-ContaPymeU

Sin publicaciones nuevas hoy. El refactor del componente TreeView vive
únicamente en `ISW-ClientesIS`.

## Estrategias y notas para próximos desarrolladores

### Cascada de adaptadores en TreeView

El TreeView del módulo Capacitación pasó de tener una cascada de adaptadores
con conocimiento del dominio a una arquitectura donde el componente
compartido NO sabe nada del dominio. La cascada actual queda así:

```
00-context  → 01-contract → 02-model
03-tree     → 04-view     → 05-mutations → 06-roles
```

Y el side consumer aporta:

- Un **alias local** del tipo de dominio (no global augmentation).
- Una clase de dominio mínima cuyo constructor el componente usa para
   inferir cómo crear nuevos nodos.
- Un objeto `customs` con: `updateNode`, atajos no navegacionales,
   apertura del selector, herencia de campos del padre.

### `BtnRef` callbacks: usa el nombre canónico

`BtnRef.svelte` (paquete `ispsveltecomponents`) expone **únicamente**
`onSelectedRecord`. Cualquier otro nombre (`onRecursoSelected`,
`onTemaSelected`, etc.) se ignora silenciosamente porque cae en `$$restProps`
y nunca llega al callback interno. Si se envuelve `BtnRef` en un wrapper
(p. ej. `BtnRefAutoOpen`), exponer **explícitamente** `onSelectedRecord` en
la interface y dejar el resto vía `$$restProps`.

### Autocompletado de campos a partir del registro elegido

Patrón aplicado en `onSelectedRecord` del recurso:

1. Asignar la PK (`obj.irecurso = record.irecurso`).
2. Asignar la entidad anidada (`obj.recurso = record`).
3. Para cada campo derivado, **solo asignar si el destino está vacío**:
   ```ts
   const tituloActual = String(obj.titulo ?? "").trim();
   if (!tituloActual && record.nrecurso) obj.titulo = record.nrecurso;
   ```

Así se respeta el trabajo manual del usuario (si ya escribió un nombre, no
se sobreescribe) y se acelera el caso por defecto (si no escribió nada,
hereda del recurso elegido).

### Herencia desde ancestros

Para campos que se heredan del ancestro más cercano (p. ej. `itema`):

1. El **side consumer** recupera el `treeAdapter` desde la fn `new`/`updateNode`.
2. Camina ancestros con `tree.findByFlatPath(parentFlatPath)` cortando hacia
   arriba hasta encontrar el primero con el campo definido.
3. Asigna `node.objRow.itema = ancestor.objRow.itema` y la entidad anidada.

Mantener esta lógica del lado consumidor (no en el componente compartido)
preserva la limpieza arquitectónica del refactor.

### Preservación del estado de expansión

Toda mutación que reconstruye el árbol (insert/delete) debe **leer el
conjunto de paths expandidos antes** de la reconstrucción y reaplicarlo
después con `tree.expandPaths(...)`. Si no, el usuario pierde el contexto
visual cada vez que crea un nodo.

---

## Plan de pruebas QA · TreeView del Plan de contenidos

Reglas obligatorias de QA para validar cualquier cambio sobre el componente
`TreeView` del módulo Capacitación. Aplicar en orden; cualquier regresión
en uno solo de los pasos invalida el despliegue.

### A. Setup mínimo

1. Abrir un curso con **al menos 3 niveles de estructura** (capítulo →
   subcapítulo → título). Si no hay un curso así, crear uno.
2. Tener al menos **2 capítulos**, cada uno con **2 subcapítulos** y cada
   subcapítulo con **2 títulos**, para validar las reglas de padre y de
   herencia.
3. Asegurarse de tener tema definido **solo en uno** de los capítulos
   (para verificar la herencia hacia descendientes nuevos).
4. Tener al menos 5 recursos disponibles en el catálogo de recursos.

### B. Insert Above / Below / Child — padre y ruta

Para CADA nivel del árbol (capítulo, subcapítulo, título):

1. Posicionarse sobre un nodo del nivel.
2. Pulsar **Insert** (o el menú "Añadir abajo"). Verificar:
   - El nuevo nodo aparece **inmediatamente debajo** del nodo seleccionado.
   - El nuevo nodo está **bajo el mismo padre** que el nodo de partida.
   - El **drawer abre con los datos vacíos del nuevo nodo** (no con los
      datos del nodo de partida).
3. Pulsar **Ctrl+Insert** (o el menú "Añadir como hijo"). Verificar:
   - El nuevo nodo aparece como **primer hijo** del nodo seleccionado.
   - El padre del nuevo nodo es el **nodo seleccionado** (no su abuelo ni
      ningún hermano).
   - El drawer abre con los datos vacíos del nuevo nodo.
4. Cancelar el drawer y verificar que el nuevo nodo **no se persistió**
   (en backend) pero **sigue visible** en el árbol como pendiente, hasta
   que se elimine manualmente o se cierre la edición del curso.

### C. Estado expandido tras mutaciones

1. Expandir manualmente 3 ramas distintas del árbol.
2. Insertar un nodo nuevo (Insert Above) en la rama menos profunda.
3. Verificar que **las 3 ramas siguen expandidas** después de la inserción
   (incluyendo la rama recién mutada).
4. Eliminar el nodo recién creado. Verificar que el estado de expansión
   se preserva.

### D. Etiquetas dinámicas del formulario

1. Abrir el drawer de un nodo de cada nivel.
2. Verificar que las etiquetas reflejan el nombre del nivel:
   - Capítulo → "Código del capítulo", "Nombre del capítulo", "Atributos
      del capítulo".
   - Subcapítulo → "Código del subcapítulo", etc.
   - Título → "Código del título", etc.
3. Verificar que el nombre del nivel está **en minúsculas** dentro de la
   etiqueta.

### E. Atributos por nivel

1. Abrir el drawer de un nodo **intermedio** (capítulo o subcapítulo) y
   verificar que **NO aparece** la sección de atributos adicionales (URL
   diapositivas, Imagen del profesor, Driver de video, Dificultad,
   Documento, etc.). Solo los campos básicos (código, nombre, tema).
2. Abrir el drawer de un nodo del **último nivel** (título) y verificar que
   **SÍ aparecen** los atributos adicionales y el selector de Recurso.

### F. Selector de Tema (todos los niveles)

1. Verificar que el selector de **Tema está visible** en todos los niveles
   (capítulo, subcapítulo, título), no solo en el último.
2. Crear un nodo nuevo en el primer capítulo (que tiene tema definido):
   - El nuevo nodo debe **heredar** el tema del capítulo automáticamente.
3. Crear un nodo nuevo en el segundo capítulo (que NO tiene tema):
   - El nuevo nodo debe **quedar sin tema**.
4. Definir un tema en el segundo capítulo, y crear un nuevo subcapítulo
   bajo él. Verificar la herencia.
5. Modificar manualmente el tema del nodo nuevo y guardar. Verificar que
   el tema del padre **NO se modifica** (la herencia es solo en creación).

### G. Selector de Recurso (último nivel)

1. Crear un nuevo título (Insert sobre un título existente). Verificar:
   - El **catálogo de recursos se autoabre** sobre el drawer.
   - El usuario puede seleccionar un recurso con doble clic.
2. Con el `Nombre del título` **vacío**, seleccionar un recurso. Verificar:
   - El nombre del título **se rellena** con el nombre del recurso.
   - La PK (`irecurso`) queda asignada en el nodo.
3. Repetir el flujo, pero esta vez **escribir un nombre manual** en el
   campo `Nombre del título` antes de abrir el catálogo. Al seleccionar
   un recurso:
   - El nombre manual del título **se preserva** (no se sobreescribe).
4. Cancelar el modal de recursos sin elegir. Verificar que el formulario
   queda con `irecurso = 0` (campo vacío) y el nombre del título intacto.

### H. Atajos no navegacionales

1. `Insert` → añadir abajo (mismo padre).
2. `Ctrl + Insert` → añadir como hijo.
3. `Delete` → eliminar nodo (con confirmación si tiene hijos).
4. `Ctrl + Enter` → guardar y cerrar drawer.
5. `Esc` → cancelar drawer sin guardar.

Verificar que cada atajo se dispara solo cuando el árbol tiene el foco, y
que NO interfiere con la edición de inputs dentro del drawer.

### I. Persistencia y refresco

1. Crear varios nodos en distintos niveles, guardar el curso, recargar la
   página. Verificar que **todos los nodos persisten** y aparecen en el
   árbol con el orden correcto.
2. Modificar un nodo existente, recargar. Verificar que los cambios
   persisten.
3. Eliminar un nodo, recargar. Verificar la eliminación.

### J. Casos límite (regresión)

1. Insertar sobre el **único nodo raíz**: el nuevo nodo debe convertirse
   en hermano del raíz, no en su hijo.
2. Crear un curso **sin estructura definida**: el árbol debe estar vacío,
   sin errores en consola, y el botón "Insert" debe estar deshabilitado o
   crear el nodo en el nivel 1 por defecto.
3. Crear más de **20 nodos en un mismo nivel**: el scroll del árbol debe
   funcionar, el drawer abre correctamente, no hay problemas de rendimiento.
4. Cambiar de pestaña (Contenido → Estructura → Contenido) sin guardar
   cambios pendientes: el árbol debe **conservar el estado** (nodos
   expandidos + nodos pendientes de persistir).

---

## Paso a paso del refactor del componente TreeView

Resumen ordenado de los 21 commits de refactor del día. La meta de cada
paso fue **reducir el conocimiento del dominio dentro del componente
compartido** y trasladarlo al side consumer. Cada commit es atómico y
deja al árbol en estado funcional; se puede leer la cascada como una
secuencia didáctica:

1. **`5eba551` · Renombre semántico** — La propiedad `title` del
   contenedor de detalles pasó a un nombre que comunica explícitamente su
   rol como etiqueta de pestaña. Primer paso: aclarar la API antes de
   tocar la lógica.

2. **`27305a4` · Snapshots y plan en `.gitignore`** — Se agregaron
   `.refactor-snapshots/` y `REFACTOR_PLAN.md` como artefactos
   versionados localmente pero excluidos de git. Permite tener
   "fotografías" de cada paso sin contaminar el historial.

3. **`e812ad9` · Refresco al adaptador base** — La lógica de refresco de
   nodos vivía en el adaptador específico del consumer. Se trasladó al
   adaptador base, igualando el comportamiento entre todos los
   consumidores futuros.

4. **`9364eae` · Configuración de fila al adaptador base** — Misma idea:
   la construcción de la configuración de fila (icono, label, acciones
   por defecto) se centralizó en el adaptador base.

5. **`16a1dad` · Configuración declarativa del consumer** — El consumer
   dejó de tener un adaptador específico y pasó a inyectar configuración
   declarativa (objeto literal) al adaptador base.

6. **`9b00e2d` · Nodo del consumer = envoltorio** — El nodo del consumer
   se redujo a un envoltorio estructural; la rutina de envío al backend
   se separó en un módulo independiente.

7. **`19db3e5` · Sin clase de nodo específica** — Se eliminó la clase de
   nodo del consumer; los nodos del componente compartido recuperaron
   los iconos de carpetas por defecto.

8. **`95365ba` · Sin global augmentation** — La augmentation global del
   tipo de plan (que ensuciaba TS de toda la app) se reemplazó por un
   alias local del consumidor.

9. **`1c5c6f5` · Adaptador instanciado dentro del componente** — El
   consumidor antes instanciaba el adaptador a mano y lo pasaba por
   prop. Ahora el componente lo instancia internamente.

10. **`84c52af` · Alias de fila desde el componente** — El alias del tipo
    de fila se expone desde el componente, no desde el consumidor.

11. **`3533fcb` · Sin controlador de listado en el consumer** — El
    controlador de listado (responsable de paginar/buscar) se eliminó
    del side consumer; ya no aplicaba con el nuevo modelo.

12. **`f44d8e5` · Ctrl+Enter al contrato de customs** — El manejador de
    `Ctrl+Enter` (guardar y cerrar) se trasladó al contrato `customs`.

13. **`8d0de6c` · Inferencia de creación desde la clase de dominio** — El
    componente infiere cómo crear un nodo nuevo a partir del constructor
    de la clase de dominio que recibe del consumidor.

14. **`c91b8f4` · `updateNode` único** — Las preparaciones de nodos
    (varios métodos hooks dispersos) se compactaron en un único hook
    `updateNode` invocable por el consumidor.

15. **`ca5d946` · `maxDepth` y `levelTitle` como props** — Las
    propiedades `maxDepth` y `levelTitle` (rótulos por nivel) se
    movieron al componente, primero como props.

16. **`50d3ae9` · Acciones de fila generalizadas** — Las acciones de
    fila (clic, dblclic, atajos) quedan generalizadas en un único
    runtime enriquecido.

17. **`b3c8afc` · Extinción guiada por rol** — La extinción
    (eliminación) de un nodo se guía por su `roleVector` (atom/group),
    no por flags manuales.

18. **`0b14cd0` · `maxDepth` y `levelTitle` por `updateNode`** — Esas
    propiedades dejan de ser props del componente y se modelan a
    través del hook `updateNode` (más expresivo, permite reglas
    diferentes por nodo).

19. **`8298090` · Erradicación de props del consumidor** — Se eliminan
    todas las props del componente que pertenecen al dominio del
    consumidor.

20. **`77aa6c3` · Sin controlador esclavo** — El controlador esclavo
    (que abría el catálogo del recurso) se eliminó del componente; la
    apertura del selector se delegó al consumidor.

21. **`019e30c` · Sin abstracción de cascada** — La abstracción de la
    cascada de adaptadores (clase intermedia) se eliminó; la
    composición es directa.

22. **`cce80cf` · Atajos al customs** — Los atajos no navegacionales
    (Insert, Ctrl+Insert, Delete) se externalizan al `customs`.

A partir de aquí, el componente compartido está "limpio" (no conoce el
dominio de capacitación) y los siguientes commits ya son cierre
funcional del side consumer (vista del curso): inserts respetando el
padre, etiquetas por nivel, agrupadores autoconstruidos, herencia de
tema, autoapertura del selector y autocompletado del título. Esos
commits están listados en el bloque "Cierre funcional" arriba.
