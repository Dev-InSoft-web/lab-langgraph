# PatyIA · 13 agentes Ultra (LangGraph lab)

Cada tipo del catálogo ISA-DOC (`050-prompts/catalog/Ultra/PROMPT_*.md`) es un **agente LangChain** con:

- **System prompt:** `90-general.md` (base Paty) + markdown Ultra del tipo
- **Router:** clasificador Groq (mismo catálogo de 13 códigos que `clasificador-tipo-consulta-pmpt.md`)
- **RAG:** corpus PGVector por agente (`agents/config.ts`)
- **Sesión simulada:** `nombre_usuario`, `itercero`, `icontacto` en el body (sin auth Paty)

## Prompts y datos en PostgreSQL

**Fuente única en runtime:** schema `paty` en `DATABASE_URL` (misma BD que PGVector).

| Tabla | Contenido |
| --- | --- |
| `paty.instruccion` | `PATY_BASE` + 13 prompts Ultra |
| `paty.tdconsulta` / `tdconsulta_x_instruccion` | Tipo de consulta ↔ agente |
| `paty.tdconsulta_corpus` | Filtros RAG (reemplaza VECTOR_STORE) |
| `paty.conversaciones` / `conversacion_turnos` | Chat (sin JSON en disco) |

Sincronizar prompts desde ISA-DOC (git):

```powershell
cd ../ISA-DOC
npm run lab:db:apply-schema
npm run lab:patyia:sync-prompts
```

Persistencia: solo PG — ver `docs/db-migration.md`.

## Agentes

| Código | Uso |
| --- | --- |
| `PASO_A_PASO` | Guía operativa ContaPyme |
| `INTERPRETACION_RESULTADO` | Explicar valores/saldos |
| `CONSULTA_NORMATIVA_NEGOCIO` | Límite normativo + parte funcional |
| `ASESORIA_PERSONALIZADA` | Redirigir a soporte |
| `COMERCIAL` | Precios, demo, póliza |
| `ERROR_*` | Acceso, config, DIAN, técnico |
| `SALUDO_OTRO` | Saludos sin consulta |
| `REQUIERE_CONTEXTO` | Pedir aclaración |
| `SOLICITUD_NO_PERMITIDA` | Políticas |
| `FUERA_DE_ALCANCE_TECNICO` | Dev/API/SQL |

## API

```json
POST /api/conversacion
{
  "nombre_usuario": "María",
  "prompt": "¿Cómo creo una factura electrónica?",
  "prompt_tipo": "PASO_A_PASO"
}
```

`prompt_tipo` opcional (fuerza agente). Sin él → clasificador.

`GET /api/patyia/prompts` — lista agentes y fecha de sync.

## Grafo

`ensureConversation` → `routeAgent` → `runAgent` → `persistTurn`

Diagrama: `npm run diagrams:render` → `docs/diagrams/patyia-conversation.png`
