## 6 · Estándar: commits + resumen de tiempos al culminar un TK

Se completa `commits: [...]` para **TK-1426681** con los 12 commits
del día (distribuidos entre `ISP-ClientesIS`, `ISP-CLientesISServer`,
`ISW-ClientesIS` e `ISA-DOC`) y se añade `ISA-DOC` a `REPOS_VALIDOS`
en `template.ts` para que aparezca correctamente etiquetado en la
tabla automática del sistema bitácora.

También se pueblan los commits relacionados al **TK-1426728** —aún
sin replicación del error reportado, las optimizaciones aplicadas al
árbol de contenido del curso quedan registradas como commits
relacionados (no llevan el código del TK en el mensaje pero
pertenecen al mismo dominio funcional).

> **Regla obligatoria:** cualquier TK culminado debe llevar **siempre**
> tabla de commits + resumen de tiempos. Si los commits no traen el
> código del TK en el mensaje, igualmente deben anexarse si están
> relacionados con el dominio funcional del ticket.

### 6.1 · Estándar de bitácora por día

Cada accordion con fecha debe abrirse en **sub-accordions internos**
(uno por subtema), no en un único bloque de texto plano. Para
documentos largos del día se crean MDs separados en
`src/lib/features/bitacora/daily/<YYYY-MM>/<DD>/NN-subtema.md` y se montan en
`BitacoraPanel.svelte` como accordions con `inner`.
