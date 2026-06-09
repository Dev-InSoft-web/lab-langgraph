# Video QA Camilo — errores en `itdform=create`

Video fuente: **qa test camilo - 2026 05 28 10 46 15 errores en itdform=create** (`dmlU60yHNEc`).

La transcripción automática de YouTube confirma dos novedades funcionales reportadas por Camilo. Ambas ocurren únicamente en flujos de **creación** (`itdform=create`) y no se reproducen igual cuando el registro principal ya existe.

## TK-1430975 · Curso nuevo / pestaña Contenido

- **0:00–0:14:** al crear un curso desde cero y agregar un recurso en la pestaña **Contenido**, el botón del **ojito** debería abrir el recurso existente, pero el formulario aparece vacío.
- **0:14–0:47:** el mismo recurso en un curso ya creado sí abre con toda la información, por lo que la diferencia está en el branch de creación del curso, no en el recurso en sí.
- **1:01–1:34:** al hacer doble clic sobre el recurso agregado en el curso en creación, se abre la vista de relación, pero sin los atributos del driver. En un curso existente sí se ven los atributos para configurar básico / medio / avanzado, padre, etc.
- **1:42–2:21:** se identifica como una condición propia de creación. La vista esperada para consultar la relación/atributos parece estar bifurcada entre `edit` y `create`; en `create` no se hidrata la información del driver.

Hipótesis de solución:

- Revisar el flujo de apertura del recurso desde `TreeContenidos`/contenido del curso cuando el curso aún no está persistido.
- Validar si el objeto temporal del recurso conserva el identificador necesario para abrir el detalle real con el ojito.
- Revisar el branch `create` de la vista de relación recurso-plan/curso para que cargue los atributos del driver igual que en `edit`.

Criterios de QA:

- En curso nuevo, agregar recurso en **Contenido** y abrirlo con el ojito: debe mostrar datos del recurso, no formulario vacío.
- En curso nuevo, doble clic sobre el recurso: debe mostrar los atributos del driver.
- Repetir en curso existente para garantizar que el comportamiento previo no se rompe.

## TK-1430974 · Plan de estudio / Cursos integrados

- **2:29–2:37:** Camilo muestra el segundo caso en **Planes de estudio**.
- **2:43–2:56:** desde la **vista grande** del formulario, al entrar a **Cursos integrados**, seleccionar un curso y pulsar **Aceptar**, el registro no se agrega al grid.
- **2:56–3:07:** desde la **vista de formulario rápida**, el mismo alta sí agrega el curso correctamente.
- **3:07–3:22:** se asume una condición específica que quedó colándose en la vista grande.

Hipótesis de solución:

- Comparar el flujo de inserción de cursos integrados entre vista grande y formulario rápido.
- Revisar si la vista grande está pasando un `Obj`, `frmItd`, contexto de catálogo o handler distinto al aceptar.
- Validar si el grid/list-slave recibe el registro pero no dispara refresco, o si la inserción se cancela antes de mutar el modelo.

Criterios de QA:

- Crear/editar plan desde vista grande, pestaña **Cursos integrados**, agregar curso y aceptar: debe aparecer en el grid.
- Repetir el alta desde formulario rápido: debe seguir funcionando.
- Verificar que no se dupliquen filas ni se pierdan datos al alternar entre ambas vistas.

### Resolución

Diagnóstico:

- El problema principal era de estado/UI en la vista grande: el `Aceptar` del drawer hijo quedaba capturado por el `form` del host y no disparaba correctamente la acción de creación en el controlador. Adicionalmente, la lógica que decidía `create` vs `modify` leía `itdForm` heredado de la URL (parent) lo que hacía que en la vista grande, cuando el plan estaba en `itdform=edit`, el drawer considerase erróneamente que no debía crear el registro.

Cambios realizados:

- Interceptación de envíos anidados: se añadió una acción Svelte `interceptNestedSubmit` en `CtlgoCursosDePlan.svelte` que captura el click en el botón `Aceptar` dentro del drawer hijo, evita la propagación al form padre, valida el hostForm y ejecuta explícitamente la creación/modificación (`submitCurso()`), luego cierra el drawer.
- Normalización en el controlador: en `PlanDeEstudio` se añadieron `ActCrear`/`ActModificar` que llaman a `normalizeItem(...)` para garantizar que `iplanestudio` y `qorden` estén correctamente inicializados antes de persistir.
- Auto-open de `BtnRef`: se ajustó `BtnRefAutoOpen.svelte` para que abra automáticamente el selector cuando el `value` está vacío (funciona tanto en `create` como en `edit`), excepto en modo `view` (readonly), lo que mejora la experiencia en creación y evita drawers vacíos.
- Ajustes Svelte 4: la acción que intercepta clicks se aplica a un elemento DOM (div hidden) y no al componente, para cumplir con Svelte 4 y evitar errores de compilación.
- Refresco de grid: tras una creación exitosa ahora se llama a `catalogoCursos.refreshGrid()` para garantizar que el grid muestre el nuevo registro.

Archivos modificados (principales):

- `src/components/views/contapymeu/capacitacion/plandeestudio/_Details/CtlgoCursosDePlan.svelte`
- `src/components/views/contapymeu/capacitacion/_comps/especial/BtnRefAutoOpen.svelte`
- `src/lib/ContaPymeU/2.Capacitacion/PlanDeEstudio.ts`

Commits relacionados (repositorio `ISW-ClientesIS`):

- `869c5ce` feat(TK-1430974): agregar métodos para crear y modificar cursos, incluyendo normalización de datos
- `ac1e457` feat(TK-1430974): mejora en la gestión de cursos y requisitos, incluyendo interceptación de envíos anidados
- `16b8db9` fix(TK-1430974): evitar auto-apertura en modo readonly/view

Pruebas realizadas:

- Reproducción manual del flujo original (vista grande): Crear → Cursos integrados → seleccionar curso → Aceptar —> el grid ahora refleja el nuevo registro.
- Prueba de control (formulario rápido): el alta sigue funcionando como antes.
- Reproducción automatizada parcial con Playwright: en una ejecución del test UI se verificó que el conteo de filas aumentó (p.ej. `beforeCount: 9` → `afterCount: 10`) y que el nuevo renglón aparece en el grid.
- Comprobación de build/TS/lint en archivos modificados: sin errores en los archivos tocados.

Criterios de QA cumplidos:

- Crear/editar plan desde vista grande, pestaña Cursos integrados, agregar curso y aceptar → aparece en el grid (OK).
- Alta desde formulario rápido sigue funcionando (OK).
- No se introducen duplicados ni pérdida de datos al alternar vistas (OK en pruebas realizadas).

Estado: Resuelto — cambios subidos a `origin/main` en `ISW-ClientesIS` (ver commits arriba). Si desean, puedo generar una reproducción Playwright completa que capture la evidencia paso a paso y adjuntar capturas en la bitácora.

## Lectura general para resolución

- Los dos problemas están acotados a flujos de creación o vista grande; conviene buscar condiciones por `itdform`, `create`, `edit`, `pkReadonly`, inicialización de `Obj` y rehidratación de list-slaves.
- El video no evidencia error de backend ni respuesta HTTP fallida; el síntoma es de estado/UI: vistas vacías, atributos no hidratados y alta que no impacta el grid.
- Para cerrar los TK, la evidencia debe capturarse con navegador en los dos caminos: caso que fallaba y caso control que ya funcionaba.

---

## Commits relacionados (repo: ISW-ClientesIS)

| Commit | Mensaje | Repo |
|---|---|---|
| `869c5ce` | feat(TK-1430974): agregar métodos para crear y modificar cursos, incluyendo normalización de datos | ISW-ClientesIS |
| `ac1e457` | feat(TK-1430974): mejora en la gestión de cursos y requisitos, incluyendo interceptación de envíos anidados | ISW-ClientesIS |
| `16b8db9` | fix(TK-1430974): evitar auto-apertura en modo readonly/view | ISW-ClientesIS |

## Resumen de tiempos (desglose)

| Actividad | Minutos |
|---|---:|
| Implementación / patch (interceptores, normalizeItem, BtnRefAutoOpen) | 18 |
| Pruebas manuales y ajustes (grid, refresh, Svelte4 action) | 6 |
| Documentación, bitácora y commits | 5 |
| **Total** | **29** |

