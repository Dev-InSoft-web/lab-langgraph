# Pruebas de inventario (API keys en lang-lab)

Scripts y artefactos de **hola mundo** por proveedor. Las keys viven en `secrets/patyia/lab-langgraph.env` (o `local.settings.json`); modelos y cuotas de prueba en `src/lib/core/lab-constants.ts`. **ISA-DOC no ejecuta estas pruebas**.

## Salida

| Carpeta | Contenido |
|---------|-----------|
| `data/gemini-model-samples/` | Por modalidad (`language/`, `image/`, …), `report.json`, `rate-state.json` |
| `data/cerebras-model-samples/` | `language/`, `report.json` |
| `data/minimax-model-samples/` | Por modalidad, `report.json`, artefactos binarios |

## Comandos (desde `lab-langgraph/`)

```bash
npm run test:gemini:all
npm run test:gemini:all -- --modality=image --delay 3000

npm run test:cerebras:all
npm run test:cerebras:all -- --only gpt-oss-120b --force

npm run test:minimax:api
npm run test:minimax:all
npm run test:minimax:all -- --only video --force

npm run test:openrouter:all
npm run test:cohere:all
npm run test:cohere:all -- --include-paid
npm run test:deepseek:all
npm run test:huggingface:all
```

## Proveedores nuevos (orquestador PG)

| Provider | Capacidades | Cuota trial (tests) |
|----------|-------------|---------------------|
| OpenRouter | chat, proofread | 50 RPD/key (capa $0) · [OpenRouter keys](https://openrouter.ai/workspaces/default/keys) |
| Cohere | chat, embeddings, rerank | 1000 llamadas/mes · reset UTC mensual · [Cohere models](https://docs.cohere.com/docs/models) |
| DeepSeek | chat, proofread | Créditos bienvenida 30 días |
| HuggingFace | embeddings (2 keys) | Inference API |

Modelos Cohere **fuera de trial**: carpeta `paid_only/` en reportes; no se prueban salvo `--include-paid`.
