## 3 · Helper `simpleTable(headers, rows, opts?)`

Se centraliza la generación de tablas email-safe en `snippets.ts` con
el mismo estilo de la tabla de **"Commits relacionados"** que
renderiza `template.ts` (header fondo negro, Tahoma, celdas con
`border-bottom:1px solid #f0f0f0`).

Aplicado al **Timeline de QA** del TK-1426681; se elimina la sección
custom de commits del TK por ser redundante con la tabla automática
del sistema bitácora.
