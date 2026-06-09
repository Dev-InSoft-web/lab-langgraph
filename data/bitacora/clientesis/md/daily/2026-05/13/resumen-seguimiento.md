# Avances ContaPymeU

Reporte del 2026-05-13. Continuación del cierre de la batería de QA del
módulo Capacitación de ContaPymeU.

> Commits del día: **9 ISW + 1 ISS + 1 ISA** = **11 commits**.
> Sin publicación de paquetes (`ispsveltecomponents`,
> `ispclientesis`, `ispclientesisserver`).

---

## 1. Frente principal · cierre QA Capacitación

### 1.1 Plan de estudio y Cursos · acciones y readonly

Se cerraron los bugs de dominio Capacitación pendientes del backlog
inmediato:

- **Bug 1 / 6** — Acciones `Eliminar` y `Crear` aparecían `disabled` en
   los list-slaves de **Cursos integrados** y **Prerrequisitos** del
   plan, aún cuando el maestro estaba en modo edición. Causa: el JWT
   del list-slave no contiene `acciones` para el resource del maestro,
   por lo que `JWT.isActionAllowed` retornaba `false`. Fix definitivo
   en `bd77d38`: las acciones del list-slave se gobiernan **solo por
   el `itd`/readonly externo**, no por los permisos individuales del
   slave.
- **Bug 8 (subset cursos integrados)** — El `BtnRef` del curso activo
   del plan aparecía pintado en rojo porque el `APIPivotController.Lista`
   resolvía contra el `listSlave` local (vacío), no contra el API. Fix
   `d1c54a1`: override de `Lista()` en `TCursosDePlanDeEstudioControllerSlave`
   para que pida el listado al API excluyendo los ids ya integrados.
- **Bug error TS .astro** — Astro exigía pasar `Controller` aunque el
   componente tuviera default. Fix `248f76c`: `$$Props` con `Omit` +
   `Controller?` opcional en los dos `Acciones.svelte`.

### 1.2 ISS · exposición completa de acciones en catálogos maestros

`a82a112` activa en la Function app las 8 acciones de catálogo maestro
para `TCurso` y `TPlanDeEstudio`: además de Crear, Modificar,
Visualizar (Obtener), Listar y Eliminar, ahora se exponen también
**Verificar, Duplicar, Recodificar y Consolidar**. El front podrá
consumirlas en cuanto se publique la Function.

Los `ListSlave` y `Pivot` no cambian: su CRUD pivotal se conserva.

### 1.3 Details con scroll vertical

El tab General de Plan de estudio (y cualquier otro Detail con
contenido extenso) no era navegable. Se aplicó tres iteraciones
incrementales:

- `58668af` — Se agrega `overflow-y: auto`.
- `bfe4059` — Se agrega clase `custom-scrollbar` para que el estilo
   del scroll sea coherente con el resto de la app.
- `17ba732` — Se sustituye el `<div>` por `<BlockLayout>`. El layout
   detecta el `overflow` del `style` e infiere automáticamente la
   clase de scroll. Queda eliminado el hard-code de la clase.

---

## 2. Frente secundario · ISA-DOC · normativa de tiquetes

Se incorporó al visor de tickets la **normativa de cierre** que el
sistema de soporte exige diligenciar en cada tk de ContaPyme U:

- Nueva interfaz `TicketNormativa` (7 campos: Medio, Tipo solicitud,
   Estado, Tipo solución, Cobertura, Aplicación, Ambiente).
- Constante `NORMATIVA_DEFAULT` con los valores estándar para
   ContaPyme U.
- Los 9 tickets activos reciben `normativa: { ...NORMATIVA_DEFAULT }`
   listos para sobreescribir.
- `TicketViewerModal.svelte` muestra los 7 campos en el header del
   modal, **fuera del HTML del body** del ticket.

---

## 3. Estado de bugs pendientes

Bugs reportados que NO se tocaron por estar fuera del dominio
Capacitación / fuera del alcance del ciclo:

- **Bug 2** — Reactivity de `SeguridadAcciones`.
- **Bug 3** — onError silencioso en `AccionesGen` al crear curso.
- **Bug 4** — Label "Buscar" intercepta pointer events en `_LabelInput`.
- **Bug 5** — Checkbox `Activo` indeterminado en Cursos integrados.
- **Bug 7** — Stack de modales anidados (modal-sobre-modal pierde foco).
- **Bug 8 (fallback genérico)** — `BtnRef` pinta el label en rojo
   cuando el id no es encontrado por `Lista()`. La solución para el
   caso de cursos integrados queda; el fallback genérico de `BtnRef`
   sigue pendiente y debe atenderse en ISP-SvelteComponents.
- **Bug 9** — i18n de formato custom en `RichEditor`. Omitido por el
   usuario en este ciclo.
