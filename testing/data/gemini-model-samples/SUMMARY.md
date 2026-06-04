# Google AI Studio (Gemini) — pruebas por modalidad

Actualizado: 2026-06-04T13:16:34.945Z

| Métrica | Valor |
|---------|-------|
| API keys | 2 |
| Pruebas OK | 14/20 |
| RPD límite / key / día | 250 |
| Delay entre modelos | 2000ms |

## Por modalidad

| Modalidad | OK/Total |
|-----------|----------|
| language | 0/0 |
| image | 0/2 |
| tts | 0/0 |
| audio | 0/0 |
| embed | 0/0 |
| other | 0/0 |

Carpetas: `language/`, `image/`, `tts/`, `audio/`, `other/`. Estado RPD: `rate-state.json`.

```bash
npm run test:gemini:all
npm run test:gemini:all -- --modality=image
npm run test:gemini:all -- --modality=language,image --delay 3000
```
