# TK-1435328 · Refuerzo instrucciones Paty V3 (catálogo mejorado)

**Estado:** Atención iniciada (06-jun-2026).

| Paso | Estado |
|------|--------|
| Ticket diligenciado (ISA-DOC + PG) | Hecho |
| MERGE MSSQL `AYUDASCP_IA_STAGING` (13 tipos, `1.0`) | Pendiente SqlExec |
| Sync PG (`paty.instruccion`) | Opcional vía widget |
| Prueba funcional Paty V3 (tipos reportados en QA) | Pendiente |

Fuente: `050-prompts/catalog/PROMPT_<TIPO>.md` (13 tipos, versión reforzada post-prueba Paty V3).

## MSSQL staging

1. Regenerar SQL si editaste `.md`:
   ```bash
   node scripts/patyia/prompts/build-paty-prompts-sql.mjs
   ```
2. En **SqlExecCard**: desbloquear candado → ejecutar → confirmar modal.
3. Verificar **13 filas** en el `SELECT` final.

## BD objetivo

**AYUDASCP_IA_STAGING** (banner PatyIA verde).
