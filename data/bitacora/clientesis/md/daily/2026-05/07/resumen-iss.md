# ISP-ClientesISServer / ISS-ClientesIS-ContaPymeU

## ISP-ClientesISServer
- `1ad9e9c` — Bump de paquete a **1.0.158** (publicado en npm).
- `JData2HighDetail` revisado en los servers de Plan de Estudio y Curso para hidratar las relaciones que la UI muestra en modo readonly.

## ISS-ClientesIS-ContaPymeU
- Soporta la asignación de íconos por fila en los grids del módulo (decoración por tipo/estado sin lógica adicional en el cliente).

## Notas para próximos desarrolladores

### Cuándo tocar `JData2HighDetail`
- Si una vista del front muestra `entidad.relacion.campo` en readonly (ej. `cursorequerido.ncurso` en el drawer de prerrequisitos), la relación debe estar listada con `{ todo }` en el `JData2HighDetail` del server correspondiente.
- Si solo se muestra la PK, basta con incluir el campo escalar.
- Validar con un `GET` directo desde Postman antes de subir cambios al ISW.

### Convención de naming
- `JData2HighDetail` (camelCase con dígito 2). Nada de "jData high detail" en docs ni "JDataHighDetail" en código.

### Flujo de publicación ISP-CLientesISServer
1. Bump `package.json` (`patch` salvo cambios breaking).
2. `npm run build` → `npm publish`.
3. En el ISW: `npm i @ingenieria_insoft/ispclientesisserver@latest` + `tsc --noEmit`.
4. Si hay nuevos endpoints, regenerar la colección Postman (ver bitácora 2026-05-04 — TK-1418894).
