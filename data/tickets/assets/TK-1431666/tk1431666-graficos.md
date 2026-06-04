# TK-1431666 — fuentes de gráficos (QuickChart)

| Archivo | PNG | Datos |
|---------|-----|--------|
| `tk1431666-tokens-totales.chart.json` | `tk1431666-tokens-totales.png` | Totales tokens gpt-5 |
| `tk1431666-tokens-por-tipo.chart.json` | `tk1431666-tokens-por-tipo.png` | Por tipo Base vs Ultra |

Regenerar métricas + JSON + PNG:

```bash
npm run patyia:prompts:metrics
npm run tickets:assets:1431666
```

Fuente: `prompts/PROMPT_<TIPO>.md` y `prompts/Ultra/PROMPT_<TIPO>.md` → `patyia-prompt-metrics.ts`.
