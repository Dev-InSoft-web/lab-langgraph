# TK-1432903 — CONVERSACION_LOG y log por turno

## Estado

- **DDL:** `070-sql/create-conversacion-log.sql` (y variante SSMS) en **AYUDASCP_IA_STAGING**.
- **Motor PatyIA:** cada turno con `iconversacion` llama `appendConvTurno` → archivo `logs/conversaciones/conv-{id}.json` + **MERGE** en `dbo.CONVERSACION_LOG` (`UlConvLogDb.persistConvLogToDb`).
- **Lectura:** ISA-DOC `GET /api/patyia/conversacion/{id}/log` fusiona archivo + BD (`readConvLogMerged`).
- **Desactivar BD:** `CONV_LOG_PERSIST_DB=false` (solo archivo local).

## Contenido del JSON (por turno)

- Usuario: `send` (request Responses), `others` (`itdconsulta`, `nombre_usuario`, `vector_store_ids`, `jailbreak`).
- Operativas: clasificación y demás (`role: operativa`, `operativa_key`).
- Asistente: `receive`, tokens, costo, `latency_ms`; si el stream falla: `others.stream_ok: false` y `stream_error`.

## QA recomendado

1. Ejecutar DDL en staging (acordeón bitácora) si la tabla no existe.
2. Enviar un mensaje por `POST /conversacion` (PatyIA local) con conversación nueva.
3. Verificar fila en `SELECT ICONVERSACION, LEN(CONTENT) FROM dbo.CONVERSACION_LOG WHERE ICONVERSACION = @id`.
4. Abrir log en ISA-DOC: `/api/patyia/conversacion/{id}/log` o panel Actions.

---

`Registrado por:` Jeff-Aporta
