# Límites: LangLab vs PatyIA / ISA-DOC

`lab-langgraph` hospeda **dos dominios** que no deben mezclarse en runtime ni en naming del backend de IA.

## LangLab (runtime IA + conversación)

Experimento **independiente** de PatyIA producción (`AYUDASCP-IA`, OpenAI Responses, MSSQL staging).

| Área | Convención |
| --- | --- |
| Código | `src/lib/langlab/` — grafo, agentes, turnos, SSE |
| PostgreSQL | `BD_LANGLAB` — conversaciones, turnos, instrucciones lab, orquestador, auth |
| Orquestador | Groq, Cerebras, OpenRouter, … (nunca `paty_openai_api_key`) |
| API HTTP | `/api/conversacion`, `/api/conversaciones`, `/api/mensaje`, `/api/langlab/prompts` (catálogo **en PG para el lab**) |
| Front SPA | Página «Lab conversaciones», diagramas `langlab-conversation` |
| Grafo | `langlab-v2-classify-route-agent-log` |

**Prohibido en este dominio:** llamar OpenAI Paty, MSSQL `AYUDASCP_IA`, Vector Storage producción, keys `paty_*` de servicios Paty.

## PatyIA / ISA-DOC (almacenamiento y administración)

Contenido y metadatos que **ISA-DOC** edita o consulta; el lab los **persiste y expone** (tickets, bitácora, caches, prompts fuente, Postman, entity store).

| Área | Convención |
| --- | --- |
| Datos en disco | `data/patyia/` — prompts `.md`, caches JSON, DER, postman |
| Bitácora / revisado | `data/bitacora/` |
| Tickets / imgbb | entity store `BD_ISADOC.ENTITY_ROW` (proyecto `isa-doc`) + rutas ISA-DOC |
| API persistencia | `/api/patyia/cache/conversaciones`, `/api/patyia/cache/identidades`, `/api/persistence/patyia/...` |
| OpenAI storage (metadatos ISA) | `data/openai-storage/` |
| Sync prompts | `data/patyia/prompts/catalog` → PG `BD_LANGLAB` (fuente ISA; destino runtime LangLab) |

Aquí **sí** tiene sentido el nombre PatyIA: es el **proyecto documental** en ISA-DOC, no el backend de chat de producción.

## Flujo de prompts (ejemplo de frontera)

```
ISA-DOC (git) ──sync──► data/patyia/prompts/catalog/*.md
                              │
                              ▼
                    syncLanglabPromptsFromBundled()
                              │
                              ▼
                    BD_LANGLAB.INSTRUCCION_*  ◄── LangLab conversación lee en runtime

## Esquemas PostgreSQL (misma instancia `langlab`)

| Esquema | Rol |
| --- | --- |
| `BD_ISADOC` | **ISA-DOC backend** (único): `ENTITY_ROW` (isa-doc + clientesis), `BITACORA_REVISADO`, catálogo store, Postman manifest |
| `BD_LANGLAB` | **LangLab runtime**: conversación, turnos, instrucción (sync desde git), orquestador |

Auth API lab: **GET** de rutas ISA-DOC (`/entity`, `/catalog`, `/revisado`, `/mssql/.../query`, …) sin JWT. **SignalR negotiate** y mutaciones (POST exec, PUT entity) requieren JWT.

Recuperar store vacío: `npm run paty:restore-isa-doc-store`
```

## MSSQL (ClientesIS + PatyIA staging)

Las credenciales `CLIENTESIS_MSSQL_*` y `PATY_MSSQL_*` viven **solo en lab-langgraph** (`local.settings.json`). ISA-DOC no abre pools directos cuando `PUBLIC_LAB_LANGGRAPH_URL` está configurada.

| Operación | Endpoint lab | Auth |
| --- | --- | --- |
| Ping | `GET /api/mssql/{clientesis\|paty}/ping` | No |
| Consulta (SELECT) | `GET\|POST /api/mssql/{target}/query` | No (solo lectura validada) |
| Modificación (DDL/DML) | `POST /api/mssql/{target}/exec` | **JWT** (`POST /api/auth/token`) |

Flujo ISA-DOC:

```
SqlExecCard (candado + confirmación)
    → labMssqlExec() con Bearer JWT (modal auth)
    → lab-langgraph /api/mssql/{target}/exec
    → MSSQL CLIENTES o AYUDASCP_IA_STAGING
```

Scripts server-side (`/api/db/query`) reenvían a `/api/mssql/.../query` si `LAB_LANGGRAPH_URL` está definida.

## Regla práctica

- ¿Es **inferencia, grafo, turno de chat, rotación de API keys**? → **LangLab**
- ¿Es **ticket, bitácora, cache ISA, catálogo Postman, archivo de prompt en git**? → **PatyIA / ISA-DOC** (rutas `patyia`, `data/patyia`)
- ¿Es **SQL contra MSSQL ClientesIS o Paty staging**? → **lab-langgraph** (`/api/mssql/...`)
