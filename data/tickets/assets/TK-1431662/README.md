# TK-1431662 — assets

| Fuente | Salida | Build |
|--------|--------|-------|
| `tk1431662-instruccion-modelo.dot` (fallback `.mmd`) | `tk1431662-instruccion-modelo.png` | `node scripts/tickets/build-TK-1431662-assets.mjs` |
| `tk1431662-fases-modelo.mmd` (`sequenceDiagram`) | `tk1431662-fases-modelo.png` | mismo script |
| Captura SSMS columna MODELO | `tk1431662-instruccion-columna-mode.png` | `node scripts/upload-assets-imgbb.mjs` |
| Captura SSMS 13 filas · `MODELO` = gpt-5-nano | `tk1431662-instruccion-modelo-calibracion-gpt5-nano.png` | mismo (no reutilizar `…-calibracion.png` sin sufijo: imgbb asoció la captura **gpt-5-mini**) |

Graphviz en PATH. Los `.mmd` se conservan como respaldo.
