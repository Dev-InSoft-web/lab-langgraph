# LangLab · conversación (LangGraph)

Propuesta **independiente** de PatyIA producción: mismo flujo conceptual (`POST /api/conversacion`, SSE, calificación) con **LangGraph + LangChain + PGVector** y proveedores del lab (Groq, Cerebras, …).

Ver **`docs/ARCHITECTURE-BOUNDARIES.md`** — qué es LangLab (este doc) vs qué es almacenamiento PatyIA/ISA-DOC.

**13 agentes:** ver `docs/langlab-agents.md`. Fuente ISA-DOC: `data/patyia/prompts/catalog` → sync → PG `BD_LANGLAB`.

## Endpoints (puerto 5500)

| Método | Ruta | Notas |
| --- | --- | --- |
| POST | `/api/conversacion` | Turno SSE |
| POST | `/api/conversacion/jailbreak` | Modo laboratorio |
| GET | `/api/conversacion?iconversacion=N` | Detalle |
| POST | `/api/mensaje` | Calificación |
| GET | `/api/langlab/prompts` | Catálogo agentes |

## Grafo LangGraph

1. `ensureConversation` — título (LLM lab) o carga existente  
2. `classifyMessage` — tipo_consulta → corpus RAG  
3. `resolveCorpus` — filtros por tipo  
4. `runAgent` — respuesta con RAG opcional  
5. `buildTurnLog` / `persistTurn` — PG `BD_LANGLAB`

Diagrama: `npm run diagrams:render` → `docs/diagrams/langlab-conversation.png`

## Body POST conversación

```json
{
  "iconversacion": 0,
  "itercero": "810000630",
  "icontacto": "1",
  "prompt": "¿Cómo declaro retención en la fuente?",
  "corpus": ["dian", "contapyme"]
}
```

Respuesta: **SSE** (`event: begin | message | end`).

## Diferencias con PatyIA producción

| PatyIA (`AYUDASCP-IA`) | LangLab |
| --- | --- |
| OpenAI Responses + `conv_*` | Orquestador lab (Groq, Cerebras, …) |
| Vector Storage OpenAI | PGVector |
| Azure SQL | PostgreSQL Render (`BD_LANGLAB`) |
| Auth / DSCLIENTES | JWT lab + sesión simulada |
