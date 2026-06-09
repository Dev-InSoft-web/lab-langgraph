# Avances ContaPymeU

Reporte del día sobre los componentes ContaPymeU
(`ISW-ClientesIS`, `ISP-ClientesIS`, `ISP-CLientesISServer`,
`ISS-ClientesIS-ContaPymeU`). Cubre los cambios subidos a `origin/main`
durante la jornada.

> Total de commits cubiertos: **15** — 12 en `ISW-ClientesIS`,
> 2 en `ISP-ClientesIS`, 1 en `ISP-CLientesISServer`.

---

## 1. Tickets atendidos

### TK-1422216 — Función cargar recursos en plan de estudio

Se trabajó la totalidad del catálogo de **Plan de Estudio** atacando seis
frentes, todos relacionados con el ticket original y con los hallazgos
encontrados durante su revisión:

- **Drawer "Curso de Plan de Estudio"**. Antes, al pulsar "Crear" desde la
   pestaña *Cursos integrados*, se abría un panel lateral en blanco que daba
   la impresión de que se estaba creando un recurso. Ahora el flujo abre
   directamente el catálogo de cursos como selector y, al elegir uno, los
   datos del curso quedan vinculados al plan. El curso seleccionado se
   muestra en modo solo lectura (nombre, descripción, tema, driver, total de
   recursos, duración y los indicadores de "Activo" y "Genera certificado")
   para que el usuario verifique su elección sin posibilidad de modificarlo
   por error desde este punto.

- **Grid de Cursos integrados**. Se replanteó qué columnas son visibles por
   defecto y cuáles quedan disponibles desde el selector de columnas (campos
   de auditoría como creó/modificó, fechas, equipo). Así la vista inicial es
   más limpia y los datos detallados siguen accesibles bajo demanda.

- **Grid de Prerrequisitos**. Se renombró la pestaña a *Requisitos para
   cursos* y se ajustó el catálogo para que muestre el nombre del curso
   tanto del lado "Curso" como del lado "Requisito" en lugar de los códigos
   internos. Se corrigió un caso en el que, al editar un prerrequisito ya
   guardado, el campo *Curso requerido* mostraba el código en color rojo: la
   lista de candidatos excluía cursos ya usados como prerrequisito de otros
   ítems y eso impedía resolver el nombre del registro en edición. Ahora el
   curso del prerrequisito en edición siempre se incluye en la consulta de
   referencia, así el usuario ve siempre el nombre legible.

- **Pestaña General**. El selector "Tipo de visualización" quedó alineado
   con el resto de catálogos del producto usando el componente estándar de
   selección de enumeraciones, y se incorporó una previsualización
   responsiva con íconos que ilustra al usuario la apariencia del plan
   (Pestañas, Árbol u Organigrama) antes de guardar.

- **Refactor de layout**. Se simplificó el diseño de las pestañas y de los
   detalles internos para que la información ocupe mejor el espacio
   disponible, especialmente el grid de prerrequisitos. Se eliminaron
   estilos repetidos que estaban dispersos en varios archivos y que
   dificultaban el mantenimiento.

- **Robustez del catálogo de columnas**. Se introdujo en los controladores
   del módulo un esquema que protege la configuración de las columnas frente
   a una limitación del componente de grid compartido: cuando el usuario
   ocultaba una columna desde el selector visual, el componente reescribía
   toda la configuración y "olvidaba" las demás columnas. Con el ajuste en
   los controladores del módulo, las columnas se mantienen estables sin
   necesidad de modificar el paquete compartido.

**Despliegue y pruebas.** Los cambios se publicaron en
`clientesis.azurewebsites.net` para que el área de pruebas pueda validar el
flujo completo en *Planes de Estudio* y en *Cursos*. La jornada de trabajo
sobre este ticket finalizó a las **12:50**, tomando 20 minutos extra del
horario de almuerzo para dejar listo el despliegue.

**Versiones publicadas (paquetes ISP):**

- `@ingenieria_insoft/ispclientesis@1.0.162`
- `@ingenieria_insoft/ispclientesisserver@1.0.158`

---

## 2. Cambios estructurales transversales

### Backend de capacitación (`ISP-CLientesISServer`)

- Se ajustó el detalle de plan de estudio y de curso para que viajen los
   datos completos necesarios para la presentación readonly en el front
   (información del curso anidada en cada prerrequisito y en cada curso del
   plan), reduciendo consultas adicionales desde la UI y evitando que la
   interfaz muestre identificadores en lugar de nombres.

### Cliente compartido (`ISP-ClientesIS`)

- Nueva ruta para obtener un plan de estudio con todo su detalle, lista
   para ser consumida por la UI; alimenta los detalles readonly del curso
   en el drawer Plan ↔ Curso y la nueva vista de prerrequisitos.
- Se añadió a la entidad de curso una propiedad que indica los recursos
   marcados como finalizados, base para próximas vistas de seguimiento del
   estudiante.

### Front (`ISW-ClientesIS`)

- Se introdujeron dos componentes reutilizables: uno que abre el selector
   de referencia automáticamente cuando corresponde (evita el panel en
   blanco descrito en el ticket) y otro que muestra los datos de un curso
   en modo solo lectura, hoy usado en el drawer de plan de estudio y
   reutilizable en otras vistas.
- El componente *Alert* recibió una transición deslizante para mejorar la
   presentación visual cuando se muestran avisos de validación dentro del
   formulario.
- El árbol de contenidos del curso resolvió un error en runtime de
   *dependencia cíclica* que aparecía al combinar varias asignaciones
   reactivas; se consolidó la lógica derivada en un único punto y se
   reforzó la inicialización de los nodos para mantener su integridad.

---

## 3. Repositorios involucrados

| Repo | Capa | Commits cubiertos |
|---|---|---|
| `ISW-ClientesIS` | Front (Astro + Svelte) | 12 |
| `ISP-ClientesIS` | Cliente compartido (objetos/controllers) | 2 |
| `ISP-CLientesISServer` | Backend de capacitación | 1 |
| `ISS-ClientesIS-ContaPymeU` | Azure Function de capacitación | 0 |

---

## 4. Listado de commits

### `ISW-ClientesIS`

- `314cb63` feat(PlanEstudio): lógica para manejar cursos prerrequisitos activos y mejorar la gestión de candidatos.
- `65f877b` feat(General): optimizar visualización con `SelectEnum`; refactor de gestión de columnas en `PlanDeEstudio` con función para mezclar deltas.
- `8f008b5` feat(TK-1422216): ajustar estilos y lógica de visualización en la tabla de cursos.
- `4bea4bc` feat(TK-1422216): optimizar lógica y diseño en `General`, `ListCursosDePlan`, `ListPrerequisitosDePlan` y `CursoReadOnly`.
- `4d2b93b` feat(components): nuevos componentes `BtnRefAutoOpen` y `CursoReadOnly`; optimización en `ListCursosDePlan`/`ListPrerequisitosDePlan`; permisos en `ListSeguridad`.
- `5a0c045` feat(Alert): transición deslizante al componente de alerta.
- `c010af1` feat(plandeestudio): gestión de prerrequisitos en `ListPrerequisitosDePlan`; diseño en `ListCursosDePlan`; ajustes en `Detail`.
- `ef48d6e` feat(components): renombre a *Cursos integrados* en `ListCursosDePlan`; mejora de exclusión en `PlanDeEstudio` para permitir editar el curso activo.
- `6d15653` feat(components): padding en pestañas de `Formulario`; alertas y detalles en `ListCursosDePlan`; controlador en `PlanDeEstudio` excluye el curso activo de las listas.
- `8a1584a` feat(Alert): propiedad de borde y colores; `RichEditor` en descripción de curso y prerrequisitos; nuevos íconos SVG.
- `5270e8a` feat(ListCursosDePlan): detalles del curso y prerrequisitos; auto-apertura del selector de curso.
- `92dc0ed` feat(TreeView): evitar ciclos estáticos en `Formulario.svelte`; integridad de nodos en `TPlanCursoNode`.

### `ISP-ClientesIS`

- `6b7831a` feat(curso): agrega propiedad a curso de recursos finalizados.
- `b36872c` feat(plan-de-estudio): ruta para obtener plan de estudio con detalle.

### `ISP-CLientesISServer`

- (Cambios sobre `JData2HighDetail` de plan de estudio y curso integrados al despliegue del paquete `1.0.158`).

### `ISS-ClientesIS-ContaPymeU`

- Sin commits hoy.
