# TK-1433943 · Actualización prompts Ultra (hoy)

**Estado:** Diligenciado ING (04-jun-2026) — listo para **prueba AT** en staging.

| Paso | Estado |
|------|--------|
| Sync PG (`paty.instruccion`) | Hecho |
| MERGE MSSQL `AYUDASCP_IA_STAGING` (13 `PROMPT_%`, `2.0-ultra`) | Hecho |
| Prueba funcional Paty V3/V4 (tipos que fallaban en QA) | Pendiente AT |

Fuente: `050-prompts/catalog/Ultra/PROMPT_<TIPO>.md` (13 tipos, versión reforzada post-prueba Paty V3/V4).

## 1. PostgreSQL (automático, ISA-DOC)

`POST /api/patyia/prompts/sync-pg` lee `050-prompts/catalog/Ultra` y actualiza `paty.instruccion` en Render (credenciales en `lab-langgraph/local.settings.json`, solo servidor). **No** pasa por HTTP del lab ni por el MERGE MSSQL.

## 2. MSSQL staging (manual, SqlExecCard — no lab-langgraph)

1. Regenerar SQL si editaste `.md`:
   ```bash
   node scripts/patyia/prompts/build-paty-prompts-ultra-sql.mjs
   ```
2. En **SqlExecCard** inferior: desbloquear candado → ejecutar → confirmar modal.
3. Verificar **13 filas** `PROMPT_%` en el resultado.

**No usar** `npm run patyia:prompts:ultra:exec` para despliegue operativo: ese script es CLI sin modal; la bitácora es el canal controlado.

## BD objetivo MSSQL

**AYUDASCP_IA_STAGING** (banner PatyIA verde). Producción solo tras validación AT.
