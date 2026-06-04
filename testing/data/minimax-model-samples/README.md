# MiniMax — pruebas hola mundo por modelo

Generado con `npm run test:minimax:all` (Subscription Key `sk-cp` / Token Plan).

## Resultado: **19/19 OK** (sin STT; transcripción vía Groq)

| Modality | Modelos | Estado |
|----------|---------|--------|
| **language** | M3, M2.7, M2.7-highspeed, M2.5, M2.5-highspeed, M2.1, M2.1-highspeed, M2 | 8/8 OK — respuesta `OK` en `.txt` |
| **speech** | speech-2.8-hd/turbo, speech-2.6-hd/turbo, speech-02-hd/turbo | 6/6 OK — `Hola mundo` en `.mp3` |
| **image** | image-01 | OK — `image-01.jpeg` + URL |
| **music** | music-2.6, music-2.5 | 2/2 OK — clip en `.mp3` |
| **video** | Hailuo 2.3, 2.3-Fast, 02 | `.json` + `.mp4` (Fast requiere imagen previa) |

Transcripción (STT) del corpus YouTube: **solo Groq Whisper**, no MiniMax.

Detalle completo: `report.json`, `SUMMARY.md`, **`catalog.json`** y **`MODELS.md`** (todos los modelos + herramientas según [models-intro](https://platform.minimax.io/docs/guides/models-intro)).

## Carpetas

- `language/` — chat hola mundo
- `speech/` — TTS
- `image/` — generación de imagen
- `music/` — generación musical
- `video/` — `.json` (task + `file_id`) y `.mp4` local (la API no devuelve el binario en el poll)

## Re-ejecutar

Lee `report.json`: los modelos con `ok: true` se **omiten** (solo se prueban fallos o entradas nuevas).

```bash
npm run test:minimax:all
npm run test:minimax:all -- --only video   # solo una modalidad
npm run test:minimax:all -- --force        # repetir todos aunque ya estén OK
npm run test:minimax:all -- --download-videos   # solo bajar MP4 desde file_id en JSON
```

La URL de descarga de MiniMax **caduca en ~9 horas**. Si solo tienes JSON antiguo, regenera con `--force --only video` o vuelve a ejecutar el test de video.
