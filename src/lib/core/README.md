# core

| Archivo | Uso |
| --- | --- |
| `lab-constants.ts` | Modelos default, `API_BASE`, tablas PG, CORS, probes |
| `config.ts` | `DATABASE_URL`, keys HF/Groq, `CHAT_MODEL`, perfil RAG |
| `secrets.ts` | `preloadIsaDocSecrets()` — local.settings + ISA-DOC opcional |
| `data-paths.ts` | Rutas corpus `data/vectorize/` |
| `http.ts` | CORS y respuestas JSON Functions |
| `retry-wait.ts` | Esperas 429 / rate limit compartidas |
