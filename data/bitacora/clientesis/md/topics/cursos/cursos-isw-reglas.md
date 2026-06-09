# Cursos (ISW) — Reglas, restricciones y avances

> Documento único de seguimiento del módulo **Capacitación → Cursos** del ISW.
> Cubre `Acciones.svelte`, `Catalogo.svelte`, `Formulario.svelte` y los `_Details/*`.
> Concentra reglas de negocio, restricciones de UI y pendientes para evitar que
> se pierdan entre commits.

---

## 1. Estructura de archivos

```
ISW-ClientesIS/src/components/views/contapymeu/capacitacion/cursos/
├── Acciones.svelte
├── Catalogo.svelte
├── Formulario.svelte
└── _Details/
    ├── General.svelte
    ├── ListEstructura.svelte
    ├── ListSeguridad.svelte
    └── TreeContenidos/...
```

Controllers asociados: `ISW-ClientesIS/src/lib/ContaPymeU/2.Capacitacion/Cursos.ts`.

---

## 2. Reglas de negocio implementadas

### 2.1 Pestaña **General** — selección de Driver
- **Tooltip de descripción del Driver**: el componente `TipInfo` muestra
  `Obj.driver.descripcion`. Si el texto plano (sin HTML) supera **120 caracteres**
  se abre en un **modal** en lugar de tooltip.
- **Restricción de cambio de Driver con contenidos asociados**:
  - Aplica solo en `itdForm === "edit"` y cuando `Obj.planescurso?.length > 0`.
  - El `BtnRef` de Driver lista únicamente drivers cuyo `qniveles` coincida con
    el `qniveles` del driver actual del curso, para preservar la coherencia con
    la estructura y los contenidos ya cargados.
  - Implementado vía `TDriverSlaveController.requiredQniveles` (filtro aplicado
    en `Lista()` tanto sobre `LocalData` como sobre `GetListado`).
  - El `TipInfo` cambia a `kind="warn"` (icono triangular naranja) y describe
    la restricción con el número de niveles requerido.
- En **create** o cuando no hay `planescurso`, no hay restricción de niveles.

### 2.2 Pestaña **Estructura**
- Las filas se **autogeneran** desde `driver.qniveles` (ver
  `TEstructuraCursoSlaveController.enforceFromList`).
- El usuario **no debe** crear ni eliminar filas manualmente. El controlador
  borra `ActCrear`, `ActEliminar`, `addItem` y `removeFromList` mediante
  `restrictProps([...])` en su constructor.
- `CatalogoGen` solo renderiza el botón **Crear** si existe
  `Controller.ActCrear`; al borrarlo, el botón desaparece automáticamente.
- Operaciones permitidas sobre cada fila: **Modificar** y **Visualizar** (para
  editar `nnivel`).

### 2.3 Pestaña **Seguridad**
- `BtnRef` de Permiso **excluye** los permisos ya presentes en
  `Obj.seguridades`. Cada permiso aparece una sola vez por curso.
  - Implementado vía `TPermisoCursoController.excludeIds` y override de
    `Lista()`. Cableado desde `ListSeguridad.svelte` dentro de
    `getsecuritycontroller(entityMaster)`.
- **Selección por modal (BtnRef)** en Svelte 5 (legacy): se mantiene el
  binding `let:Obj` sin renombrar y se envuelve la `Card` + `BtnRef` en
  `{#key refresh}` para forzar el re-render del nombre del permiso al
  seleccionar.
- **Modificar fila refresca el grid**: `ActVisualizar` toma snapshot del PK
  original en `Symbol(ListSlave.origPk)`. `editItem` localiza la fila por PK
  actual (`Object.assign`) y, si cambió, reemplaza `splice(idx, 1, item)`
  usando el PK original para evitar duplicados.

---

## 3. APIs y patrones agregados (genéricos pero usados aquí)

| API                            | Archivo                                | Propósito                                                          |
|--------------------------------|----------------------------------------|--------------------------------------------------------------------|
| `APICRUDLController.restrictProps(keys)` | `_RefControllerBase.ts`                | Borra props heredadas (microtask + delete + asignar `undefined`). |
| `ListSlaveController.editItem`           | `_RefControllerBase.ts`                | Fallback con snapshot PK para sobrevivir cambios de PK.            |
| `Symbol("ListSlave.origPk")`             | `_RefControllerBase.ts`                | Snapshot no enumerable del PK original al entrar a `ActVisualizar`.|
| `TPermisoCursoController.excludeIds`     | `Cursos.ts`                            | Lambda `() => Iterable<string>` evaluada en cada `Lista()`.        |
| `TDriverSlaveController.requiredQniveles`| `Cursos.ts`                            | Filtra drivers por `qniveles` cuando se asigna; `undefined` = sin restricción. |
| `TipInfo` (`kind`, `modalThreshold`)     | `_comps/especial/TipInfo.svelte`       | `info` (círculo, azul) o `warn` (triángulo, naranja); modal si texto plano > umbral (120 por defecto). |

---

## 4. Convenciones Svelte 4 obligatorias en estos componentes

- Sin runas (`$state/$derived/$effect/$props/$bindable`): usar `let`, `$:`, `export let`, `onMount`.
- Eventos con `on:click`, `on:change`, etc.
- Sin `{#snippet}/{@render}`: usar `<slot />`.
- En el template **nunca** leer getters de `const self` que dependan de `let`/stores;
  pasar la variable como argumento o consumir directamente.
- Render asíncrono con `{#await promise}` y promise asignada solo en init/onMount/handler.

---

## 5. Pendientes / próximas reglas

- [ ] Confirmar comportamiento de **Visualizar** sobre fila de Estructura
      cuando `itdForm === "view"` (debe mantenerse readonly).
- [ ] Validar que al **cambiar el Driver** estando en `edit` sin `planescurso`,
      la pestaña **Estructura** se refresque automáticamente (las filas auto
      deben recalcularse al cambiar `driver.qniveles`).
- [ ] Considerar bloquear el cambio de **Tema** una vez existe certificación
      generada para el curso (regla aún por confirmar con producto).
- [ ] Validar **persistencia de `bgeneracertificado`** y reglas asociadas a
      contenidos requeridos para certificar.
- [ ] Definir comportamiento del botón **Eliminar** en `Catalogo.svelte`
      cuando el curso tiene seguridades, contenidos o planes asociados
      (¿soft delete? ¿cascade?).
- [ ] Documentar reglas de validación de **`icurso`** (longitud, charset)
      una vez confirmadas en backend.

---

## 6. Cambios recientes (cronología corta)

- **2026-05-03**
  - Filtro de Driver por `qniveles` cuando hay `planescurso` (edit only).
  - `TipInfo` con icono triangular `warn` y apertura en modal para textos
    largos (> 120 caracteres de texto plano).
  - `BtnRef` de Permiso oculta permisos ya seleccionados.
  - Estructura: deshabilitado `Crear`/`Eliminar`; filas autogeneradas por driver.
  - Refresh de grid tras `Modificar` (snapshot PK original en `ActVisualizar`).
  - Fix de selección por modal en `BtnRef` de Permiso (Svelte 5 legacy).
  - **Docs**: DER actualizado a mano en `public/imgs/DER Capacitación.jpg`.
    Agregadas referencias a `DER GET.png` (propagación de lectura: las APIs
    `driver`, `curso` y `plan/estudio` leen anidando todo dentro del dominio
    hasta salir a `RECURSOS`) y `DER UPDATE.png` (en escritura cada API
    actúa **solo** sobre su sub-dominio; las equis rojas marcan tablas fuera
    de su propagación). Eliminado el `mermaid` "Mapa de entidades" en
    `04-iss-capacitacion.md`: ese mapa ya estaba cubierto por el JPG/PNG
    oficiales y duplicarlo en `mermaid` se quedaba desactualizado.

## 7. Reglas de documentación (DER y diagramas)

- **No crear `mermaid` de relaciones de tablas** si el diagrama equivalente
  ya existe en `doc/ISA-DOC/public/imgs/`. Antes de generar un nuevo
  diagrama, revisar:
  - `DER Capacitación.jpg` — modelo de datos (canónico).
  - `DER GET.png` — propagación de lectura por API.
  - `DER UPDATE.png` — propagación de escritura por API.
  - `030 Capacitación.png` — UML de componentes.
- El JPG/PNG es la **fuente de verdad**. Si una relación cambia, primero se
  actualiza la imagen y luego, si aplica, las tablas de `02-modelo-datos.md`.
- `mermaid` se reserva para flujos que **no** estén ya en una imagen
  (secuencias de llamadas, máquinas de estado, pipelines).
