# TK-1431666 — assets



| ID | Motor | Fuente | Salida |

|----|--------|--------|--------|

| `tk1431666-carga-ultra` | Mermaid → imgbb | `.mmd` | `.png` (nodos `min-width:300px`) |

| `tk1431666-tokens-totales` | **chart-graphviz** | `.chart.json` | `.png` |

| `tk1431666-tokens-por-tipo` | **chart-graphviz** | `.chart.json` | `.png` |

**chart-graphviz:** Chart.js vía [quickchart.io](https://quickchart.io) (barras, leyenda, datalabels) → PNG incrustado en un marco Graphviz transparente (`scripts/lib/chart-graphviz.mjs`).



```bash

npm run tickets:assets:1431666

```



Los `.dot` de barras (`tokens-*.dot`) son legacy; no se usan en el build.

