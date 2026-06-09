# Proyecto ISA-DOC

- Bitácora del 2026-05-06 completada (resúmenes ISW/ISP, ISS e ISA-DOC) que había quedado pendiente.
- Bitácora del 2026-05-07 inicializada con cuatro resúmenes de seguimiento (incluye *Avances ContaPymeU* para el departamento de seguimiento).
- `TK-1422216` — *Función cargar recursos en plan de estudio*. Documentado el ticket completo con los seis bloques de solución del día: drawer Curso de Plan de Estudio (auto-open + readonly + binding fix), columnas del grid de cursos integrados (visibles/ocultas + auditoría), columnas del grid de prerrequisitos (resolución por `findCursoEnPlan` desde solo PKs + fix del texto en rojo del `BtnRef`), pestaña General (`SelectEnum` + previsualización responsiva), refactor de layout (`FlexLayout`, eliminación de boilerplate CSS, dimensiones del grid de prereq) y despliegue.

## Estrategias y notas para próximos desarrolladores

### Render seguro de imágenes y enlaces en correos (HTML email-safe)

- Toda `<img>` de bitácora se envuelve en un `<a target="_blank" rel="noopener">` con estilo inline (`display:block`, `cursor:zoom-in`) para abrir la imagen completa en pestaña nueva. Implementado en `snippets.ts → img()` y `renderCodeImg()`.
- Los enlaces de texto usan **doble estilo**: `<a style="color:dodgerblue;text-decoration:underline;"><span style="color:dodgerblue;">…</span></a>`. El `<span>` interno garantiza el color cuando el cliente de correo descarta los estilos del `<a>` (Outlook).
- Nunca incluir `<html>`, `<head>` ni `<style>` en el body del ticket: solo HTML inline.

### Símbolos de código en el ticket

- Usar `${code("NombreSimbolo")}` (de `snippets.ts`) en lugar de `<i>nombre</i>`. Aplica `CODE_INLINE_STYLE` (SteelBlue) y escapa HTML. Ej.: `${code("JData2HighDetail")}`.

### Patrón "init-once + merge-setter" para `Columns` de Grid

Problema: `Grid.svelte` (línea ~624 de `ispsveltecomponents`) tiene un bug en `onColumnVisible` donde reasigna toda la propiedad `Controller.Columns = { [oneKey]: { visible: ... } }`, dejando solo la columna tocada y perdiendo el resto.

Estrategia (sin tocar el paquete shared):

```ts
private _columns?: TGridColumn<T>;
get Columns(): TGridColumn<T> {
   return this._columns ??= { /* definición completa */ };
}
set Columns(delta: TGridColumn<T>) {
   mergeColumnDeltas(this._columns ??= this.Columns, delta);
}
```

Con un helper local `mergeColumnDeltas(target, delta)` que itera las claves del delta y hace `Object.assign(target[k], delta[k])` en lugar de reemplazar. Aplicado a los 3 controllers de plan-de-estudio.

### Reactividad Svelte 4 con getters

- NUNCA leer en el template getters de un objeto `const self = {...}` que internamente referencien variables `let` / `export let` / stores: Svelte 4 solo rastrea variables que aparecen textualmente en el template/`$:`.
- Reservar `get xxx()` solo para derivar de `$props` / `$restProps` o constantes.
- Para lógica derivada compleja: `$: derivado = ...` y consumir `derivado` en el template, o pasar las deps como argumentos al método: `self.isLoading(jwtLoaded, obj)`.

### `BtnRef` muestra la PK en rojo (`<span style="color:red">…</span>`)

Causa: el `BtnRef` resuelve el nombre llamando `Controller.Lista()` (línea 84 de `BtnRef.svelte`); si el registro no aparece en esa lista, pinta la PK en rojo como indicador de "no encontrado".

Estrategia de fix en controllers locales/slave (sin tocar el paquete):

1. Si la `listSlave` filtra candidatos (p. ej. por orden, exclusión de duplicados), siempre incluir el registro actualmente referenciado por la PK del item en edición:

   ```ts
   const currentId = val2Str(this.entityActivePrereq?.icursorequerido);
   const refs = items.filter((c) => c.icurso === currentId || /* condiciones de candidato nuevo */);
   ```

2. Asegurarse de que el `.svelte` consumidor le pase al controller el "item activo" en su bloque `$:` (ej.: `controller.entityActivePrereq = Item`).
3. Patrón complementario: en `onSelectedRecord`, asignar tanto la PK (`obj.icurso = record.icurso`) como la entidad anidada (`obj.curso = record`) para que el detalle readonly se hidrate sin esperar al servidor.

### Promesas y `{#await}` en Svelte 4

- Render asíncrono = `{#await promise}` sobre `let promise: Promise<T> = Promise.resolve(default)`.
- Asignar la promesa solo en (a) init del `let`, (b) `onMount`, o (c) un disparador explícito (handler/evento). Nunca en `$:` con dependencias que el padre pueda re-emitir sin cambio semántico — causa loading infinito.
- Reiniciar = reasignar `promise = fn(...)` desde el disparador.

### `JData2HighDetail` como contrato server ↔ client

- En el servidor (`ISP-CLientesISServer/src/sources/.../<Entidad>Server.ts`), el método `JData2HighDetail` define qué relaciones se hidratan al pedir un registro detallado.
- Si la UI muestra una entidad anidada en modo readonly (ej. `cursorequerido.ncurso`), incluir esa relación con `{ todo }`. De lo contrario, el front recibe el objeto vacío y debe resolverlo con un lookup cliente (más latencia y posibles textos en rojo).
- Convención de nombre: `JData2HighDetail` (no "jData high detail" ni "JDataHighDetail").

### Versionado de paquetes ISP

- Bump de versión en `package.json` antes de cada `npm publish`. Solo se registra versión cuando la publicación más reciente la hizo el desarrollador del día.
- Después del publish del ISP, en el ISW: `npm i @ingenieria_insoft/ispclientesis@latest @ingenieria_insoft/ispclientesisserver@latest` y validar con `tsc --noEmit` antes de desplegar.
