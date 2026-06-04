# PatyIA · conversación en lab-langgraph (LangGraph)

Experimento que replica el flujo principal de **PatyIA** (`POST /api/conversacion`, SSE, calificación) usando **LangGraph + LangChain + PGVector** del lab, sin MSSQL ni OpenAI Responses API.

**13 agentes Ultra:** ver `docs/patyia-agents.md` (prompts desde ISA-DOC, catálogo JSON local).

## Endpoints (puerto 5500)

| Método | Ruta | Equivalente PatyIA |
| --- | --- | --- |
| POST | `/api/conversacion` | `POST-Conversacion.ts` |
| POST | `/api/conversacion/jailbreak` | `POST-ConversacionJailbreak.ts` |
| GET | `/api/conversacion?iconversacion=N` | `GET-Conversacion.ts` |
| POST | `/api/mensaje` | `POST-MensajeCalificado.ts` |

## Grafo LangGraph

1. `ensureConversation` — crea título (Groq) o carga conversación existente  
2. `classifyQuery` — tipo de consulta → filtros `corpus` RAG  
3. `retrieveRag` — PGVector (`ask`)  
4. `generateAnswer` — Groq  
5. `persistTurn` — JSON en `ISA-DOC/data/lab-langgraph/patyia/`

Diagramas: `npm run diagrams:render` → `docs/diagrams/patyia-conversation.png`

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

Respuesta: **SSE** (`event: begin | message | end`), mismo esquema que PatyIA.

## Diferencias con producción

| PatyIA | Lab |
| --- | --- |
| OpenAI Responses + `conv_*` | Groq + LangGraph |
| Vector Storage OpenAI | PGVector (corpus ISA-DOC) |
| Azure SQL | JSON local |
| Clasificador con prompts BD | Clasificador Groq simplificado |
