# Documentos para vectorizar (FitDocs RAG)

Corpus en **ISA-DOC** → embeddings **Hugging Face** en `lab-langgraph` → **PGVector** (Render).

## YouTube · ContaPyme

**Un archivo por video** (no un solo MD gigante por video):

```
youtube/contapyme-software-contable/
  manifest.json
  corpus.md
  videos/{año}/          ← videos largos del canal
  shorts/{año}/          ← YouTube Shorts
  streams/{año}/         ← directos / replays
  subs-cache/{videoId}/
```

`npm run lab:yt:transcripts` lista **/videos**, **/shorts** y **/streams**.

Migrar o reordenar: `npm run lab:yt:organize-by-year`

### Generar

```powershell
cd C:\Users\JAGUDELOE\Documents\Contapyme\ISA-DOC
npm run lab:yt:transcripts -- --limit 5
npm run lab:yt:transcripts
```

| Opción | Efecto |
| --- | --- |
| `--limit N` | Solo N videos |
| `--offset N` | Saltar los primeros N |
| `--only-kind K` | Solo `videos`, `shorts` o `streams` (repetible) |
| `--delay MS` | Pausa entre videos (default 1500) |
| `--max-comments N` | Comentarios por video (default 100) |
| `--no-comments` | Sin comentarios (más rápido) |
| `--no-resume` | Regenerar aunque exista JSON v2 |
| `--no-corpus` | No actualizar `corpus.md` |

Requisito: `python -m yt_dlp` (`pip install yt-dlp`) y **Node.js** en PATH (`--js-runtimes node`).

`shorts/` y `streams/` quedan vacíos hasta que el fetch los procese (van **después** de ~1021 videos en la lista global). Para llenarlos ya:

```powershell
npm run lab:yt:transcripts -- --only-kind shorts --only-kind streams
```

**Descripciones:** van en `## Descripción` del `.md`, en `corpus.md` (sección completa) y en `plainText` del `.json` (prefijo antes de la transcripción). Si yt-dlp no las trae, se obtienen de la página del video.

```powershell
npm run lab:yt:enrich-descriptions   # rellenar / actualizar videos ya descargados
```

**Git:** todo el corpus YouTube está en `.gitignore` (generar en cada máquina con `npm run lab:yt:transcripts`). Los scripts y la doc sí van en el repo.

Documentación: `public/content/docs/patyia/lab-03-youtube-corpus.md`.

### Corrección ortográfica (una vez por video)

Orquestador **LangGraph** en `lab-langgraph` (Groq → MiniMax; OpenAI solo con `allowOpenAi=true`). **HF** solo para embeddings/index RAG.

Historial: `youtube/contapyme-software-contable/proofread-history.json` (archivo, modelo, API, tokens, coste USD, lotes).

```powershell
# Promover prueba -test → definitivo (sin re-llamar LLM)
npm run lab:yt:proofread:promote -- -62iAmPHvkA

# Corregir un video (CLI directo al grafo)
npm run lab:yt:proofread -- <videoId>

# Vía API (servidor :5500)
Invoke-RestMethod -Method POST "http://localhost:5500/api/youtube/proofread?videoId=<id>"
```

Si Groq y HF fallan: HTTP 503 con `retryAfterMinutes` (default 5, env `PROOFREAD_RETRY_MINUTES`). Los videos con `transcript.accentuationPunctuationCorrected: true` se omiten salvo `?force=true`.

### Lote: puntuación y marcas (sin LLM, todo el corpus)

Requiere **lab-langgraph** en marcha (`npm run start` → `:5500`). El orquestador vive en ISA-DOC y llama `POST /api/youtube/punctuate`.

```powershell
# Terminal 1
cd C:\Users\JAGUDELOE\Documents\Contapyme\lab-langgraph
npm run build && npm run start

# Terminal 2 (ISA-DOC)
cd C:\Users\JAGUDELOE\Documents\Contapyme\ISA-DOC
npm run lab:yt:batch-punctuation

# Prueba: 5 videos, sin escribir
npm run lab:yt:batch-punctuation -- --dry-run --limit 5

# Reprocesar aunque ya tengan flag
npm run lab:yt:batch-punctuation -- --force

# Un video vía API
Invoke-RestMethod -Method POST "http://localhost:5500/api/youtube/punctuate?videoId=-FsBdhIguyM"
```

Escribe `batch-accentuation-punctuation.log` y `batch-accentuation-punctuation-summary.json` en `contapyme-software-contable/`.

En cada `videos/{id}.json`:

```json
"transcript": {
  "accentuationPunctuationCorrected": true,
  "accentuationPunctuationCorrectedAt": "2026-06-03T18:00:00.000Z",
  "accentuationPunctuationVersion": 1,
  "accentuationPunctuationApi": "groq",
  "accentuationPunctuationModel": "llama-3.3-70b-versatile"
}
```

### Alimentar el RAG (PGVector)

1. Corpus con dedupe v3: `npm run lab:yt:transcripts` (o `lab:yt:rededupe` si ya hay JSON).
2. Indexar **un chunk por segmento** (no `plainText` del MD):

```powershell
npm run lab:yt:index-rag
```

3. Preguntar en FitDocs (`lab-langgraph` en :5500): cada cita lleva enlace YouTube al segundo del video.

Variable en `lab-langgraph`: `RAG_PROFILE=contapyme` (default) o `fitdocs` para PDFs.

## Web · DIAN y portales oficiales

Ver `web/README.md`. Crawl: `npm run lab:gov:fetch`. Index: `npm run lab:gov:index-rag`.

### Filtros en `/api/ask`

Cada chunk lleva `corpus` y `tipo` en metadata. Ejemplo:

```json
{ "question": "...", "corpus": "dian", "k": 6 }
```

Valores: `contapyme`, `agrowin`, `dian`, `legal`, `minhacienda`, `supersociedades`, `fitdocs`. Alias: `tags`. Subfiltro: `tipo`: `youtube`, `pdf`, `web`, `normativa`.
