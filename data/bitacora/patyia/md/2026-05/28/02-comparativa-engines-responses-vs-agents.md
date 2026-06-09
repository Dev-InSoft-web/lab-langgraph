# PatyIA · Comparativa empírica de costos: Responses vs Agents SDK

**Mensajes enviados por corrida:** 10 por engine, mismos prompts en el mismo orden.

**Modelo bajo prueba:** se determina por corrida (ver tabla de Totales). Ambos engines usan el modelo configurado en `OPENAI_MODEL` (PatyIA `local.settings.json`).

**Fórmula (regla de tres):** `USD = (tokens × tarifa_por_1M) ÷ 1 000 000`. El input cobrado descuenta los tokens cacheados: `input_billable = input_tokens − cached_tokens`.

Tarifas: ver `PatyIA/src/020 Controller/tools/storage/openai-pricing.json`.

---

<!-- corridas:start -->

## Corrida 2026-05-29 00:00

**Conversaciones:** Responses `iconversacion=1820` · Agents PoC `iconversacion=1821`.

### Tarifas aplicadas en esta corrida (USD por 1M tokens)

| Modelo | Input | Input cached | Output |
|---|---:|---:|---:|
| `gpt-5-mini-2025-08-07` | $0.25 | $0.03 | $2.00 |
| `gpt-5-mini` | $0.25 | $0.03 | $2.00 |

### Totales agregados

| Métrica | Responses | Agents PoC | Δ (Agents vs Responses) |
|---|---:|---:|---:|
| Modelo (dominante) | `gpt-5-mini-2025-08-07` | `gpt-5-mini` | — |
| Turnos registrados | 10 | 10 | — |
| Costo total | $0.060897 | $0.052599 | -13.6% |
| Costo input (no cached) | $0.015956 | $0.016225 | 1.7% |
| Costo input cached | $0.002879 | $0.000000 | -100.0% |
| Costo output | $0.042062 | $0.036374 | -13.5% |
| Costo promedio / turno | $0.006090 | $0.005260 | -13.6% |
| Tokens input totales | 178888 | 64894 | -63.7% |
| Tokens cached totales | 115072 | 0 | — |
| Tokens output totales | 21031 | 18187 | -13.5% |
| Latencia p50 (ms) | 30000 | 22791 | -24.0% |
| Latencia p95 (ms) | 41674 | 33826 | -18.8% |

### Detalle por turno (Responses · modelo `gpt-5-mini-2025-08-07`)

`input_billable` = input_tokens − cached_tokens. Costo recalculado por regla de tres.

| # | Modelo | input_billable | cached | output | USD input | USD cached | USD output | USD total | ms |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | `gpt-5-mini-2025-08-07` | 3418 | 8064 | 1756 | $0.000855 | $0.000202 | $0.003512 | **$0.004569** | 26119 |
| 2 | `gpt-5-mini-2025-08-07` | 3489 | 8064 | 3251 | $0.000872 | $0.000202 | $0.006502 | **$0.007576** | 41674 |
| 3 | `gpt-5-mini-2025-08-07` | 6179 | 8064 | 2169 | $0.001545 | $0.000202 | $0.004338 | **$0.006085** | 25602 |
| 4 | `gpt-5-mini-2025-08-07` | 9879 | 8064 | 2152 | $0.002470 | $0.000202 | $0.004304 | **$0.006976** | 34836 |
| 5 | `gpt-5-mini-2025-08-07` | 6111 | 7040 | 799 | $0.001528 | $0.000176 | $0.001598 | **$0.003302** | 11748 |
| 6 | `gpt-5-mini-2025-08-07` | 8434 | 12032 | 2305 | $0.002109 | $0.000301 | $0.004610 | **$0.007020** | 33266 |
| 7 | `gpt-5-mini-2025-08-07` | 7160 | 11136 | 2162 | $0.001790 | $0.000278 | $0.004324 | **$0.006392** | 30000 |
| 8 | `gpt-5-mini-2025-08-07` | 6666 | 17152 | 1586 | $0.001667 | $0.000429 | $0.003172 | **$0.005268** | 21985 |
| 9 | `gpt-5-mini-2025-08-07` | 6119 | 15104 | 2388 | $0.001530 | $0.000378 | $0.004776 | **$0.006684** | 31698 |
| 10 | `gpt-5-mini-2025-08-07` | 6361 | 20352 | 2463 | $0.001590 | $0.000509 | $0.004926 | **$0.007025** | 29789 |

### Detalle por turno (Agents PoC · modelo `gpt-5-mini`)

| # | Modelo | input_billable | cached | output | USD input | USD cached | USD output | USD total | ms |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | `gpt-5-mini` | 5799 | 0 | 1691 | $0.001450 | $0.000000 | $0.003382 | **$0.004832** | 21939 |
| 2 | `gpt-5-mini` | 6632 | 0 | 2458 | $0.001658 | $0.000000 | $0.004916 | **$0.006574** | 31850 |
| 3 | `gpt-5-mini` | 6075 | 0 | 1435 | $0.001519 | $0.000000 | $0.002870 | **$0.004389** | 19156 |
| 4 | `gpt-5-mini` | 12230 | 0 | 1446 | $0.003058 | $0.000000 | $0.002892 | **$0.005950** | 21250 |
| 5 | `gpt-5-mini` | 1186 | 0 | 1050 | $0.000297 | $0.000000 | $0.002100 | **$0.002397** | 12197 |
| 6 | `gpt-5-mini` | 6623 | 0 | 2179 | $0.001656 | $0.000000 | $0.004358 | **$0.006014** | 22791 |
| 7 | `gpt-5-mini` | 6633 | 0 | 2188 | $0.001658 | $0.000000 | $0.004376 | **$0.006034** | 27270 |
| 8 | `gpt-5-mini` | 6569 | 0 | 1597 | $0.001642 | $0.000000 | $0.003194 | **$0.004836** | 21624 |
| 9 | `gpt-5-mini` | 6536 | 0 | 2395 | $0.001634 | $0.000000 | $0.004790 | **$0.006424** | 33826 |
| 10 | `gpt-5-mini` | 6611 | 0 | 1748 | $0.001653 | $0.000000 | $0.003496 | **$0.005149** | 23683 |

### Calificación comparativa (juez: `gpt-5-mini`)

Cada turno se evaluó pidiendo al juez una calificación 1-10 por respuesta y un veredicto (A=Responses, B=Agents PoC) considerando relevancia, precisión técnica, completitud y claridad.

| # | Score Responses (A) | Score Agents (B) | Ganador | Razón |
|---:|---:|---:|:---:|---|
| 1 | 9 | 9 | empate | Ambas respuestas son relevantes, técnicas y completas para una pyme inicial; A es más orientada y recomendativa, B enumera más módulos complementarios. Empate. |
| 2 | 9 | 9 | empate | Ambas respuestas son relevantes, técnicamente correctas, completas y claras; difieren poco en formato y nivel de detalle, por lo que empatan. |
| 3 | 10 | 8 | Responses | A es más completo y detallado, con causas, pasos dentro de ContaPyme y opciones de seguimiento; B es correcto y claro pero menos detallado. |
| 4 | 9 | 7 | Responses | A ofrece pasos concretos, alternativas prácticas y texto listo para soporte; B pide aclaraciones útiles pero es más breve y menos completo. |
| 5 | 9 | 8 | Responses | A ofrece explicación más completa y práctica para ContaPyme, con advertencia y llamada a acción; B es correcta y clara pero más genérica y menos orientada al sistema. |
| 6 | 9 | 8 | Responses | A es más completo y organizado, cubre pasos, casos y recomendaciones concretas; B es correcto pero menos detallado y algo redundante. |
| 7 | 9 | 8 | Responses | A es más completo y explica diferencias, checklist y rutas; B es claro y correcto pero más breve y menos detallado en verificaciones y opciones. |
| 8 | 9 | 9 | empate | Ambas respuestas son relevantes, técnicas y completas, con pasos claros y notas útiles; difieren en estilo y en detalle menor (capturas vs video) pero igual calidad. |
| 9 | 9 | 8 | Responses | Ambas son claras y técnicas; A ofrece más opciones prácticas, verificaciones y seguimiento personalizado, B es buena pero algo más breve. |
| 10 | 9 | 8 | Responses | A es más completo y con pasos operativos, comprobaciones y calendario; B es claro y correcto pero menos detallado y sin calendario ni prueba de recuperación. |

**Resumen:** A=91 pts · B=82 pts · victorias A=7, B=0, empates=3. Costo del juez: $0.004731 (13387 in + 692 out tokens).

---
