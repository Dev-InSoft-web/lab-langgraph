# Corpus web · normativa para contadores

Fuentes públicas (DIAN, MinHacienda, Supersociedades, SUIN, Contaduría, JCC, UIAF) orientadas a **contadores y tributaristas**.

## Estructura

```
web/government/
  manifest.json
  crawl.log
  imgbb-cache.json
  pages/{corpus}/{año}/{pageId}.json + .md
  pdfs/{corpus}/{año}/{pageId}.pdf
```

Corpus: `dian`, `supersociedades`, `minhacienda`, `legal`, … · Año: `fecha`, `fetchedAt`, URL o `undated`.

```powershell
npm run lab:gov:reorganize   # migrar carpeta plana → corpus/año + MD convencional
```

Semillas: `scripts/lab-langgraph/government-seeds.json` (palabras clave tributarias/contables).

## PDFs → Markdown + ImgBB

Los PDF en `government/pdfs/{pageId}.pdf` se convierten a `pages/{pageId}.md` con **una sección por página** y figuras incrustadas (`![…](url ImgBB)`). Caché de subidas: `government/imgbb-cache.json`.

```powershell
cd ISA-DOC
# Requiere IMGBB_API_KEY en .env
npm run lab:gov:convert-pdfs
npm run lab:gov:convert-pdfs -- --limit 3 --dry-run
GOV_PDF_NO_IMGBB=1 npm run lab:gov:convert-pdfs   # solo texto, sin subir imágenes
```

En el crawl (`lab:gov:fetch`) los PDF nuevos ya pasan por esta conversión.

## Flujo

```powershell
cd ISA-DOC
npm run lab:gov:fetch
npm run lab:gov:fetch -- --limit 200
npm run lab:gov:fetch -- --resume
npm run lab:gov:convert-pdfs

npm run lab:gov:index-rag

# Preguntar (lab-langgraph en :5500):
cd ../lab-langgraph
npm run build && npm run start

# Preguntar solo normativa DIAN:
Invoke-RestMethod -Method POST http://localhost:5500/api/ask -ContentType "application/json" -Body (@{
  question = "¿Calendario tributario para declaración de renta?"
  corpus = "dian"
  k = 6
} | ConvertTo-Json)
```

Cada chunk lleva `corpus`, `tipo` (`web` | `normativa`) y `url` oficial.
