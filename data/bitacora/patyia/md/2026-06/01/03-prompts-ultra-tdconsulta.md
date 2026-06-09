# Prompts Ultra · MERGE en INSTRUCCION

Actualización de los **13 prompts por tipo** con la versión compacta **Ultra** (`prompts/Ultra/PROMPT_<TIPO>.md`), alineada con Base en `prompts/PROMPT_<TIPO>.md`.

## Cambio reciente (ejemplos)

Los bloques **Ejemplos** de cada Ultra usan placeholders literales (`{{nombre_usuario}}` y similares) en lugar de nombres fijos. En runtime PatyIA los resuelve al armar `instrucion_tipo` (`resolveUserNameInText`, TK-1431163) antes del `responses.create` de respuesta.

Tras editar los `.md` hay que **regenerar el MERGE** y volver a ejecutarlo en staging para que `INSTRUCCION.instruccion` refleje el texto nuevo.

## Qué hace el SQL

1. **MERGE** en `INSTRUCCION`: `iinstruccion`, `ninstruccion = PROMPT_<TIPO>`, `instruccion` = texto Ultra.
2. **MERGE** en `TDCONSULTAXINSTRUCCION`: enlace `itdconsulta` → `iinstruccion`, `orden = 1`.

Idempotente: re-ejecutar sobrescribe `instruccion` sin duplicar filas.

## Regenerar el SQL

```bash
node scripts/patyia/prompts/build-paty-prompts-ultra-sql.mjs
npm run patyia:prompts:metrics
```

Métricas actuales: **23 520 → 13 825** tokens agregados (~**41%** menos que Base).

## Verificación post-ejecución

Esperado: **13 filas** con texto Ultra cargado.

## MODELO (respuesta final)

Tras el MERGE Ultra, calibrar las 13 filas a **gpt-5-nano** (acordeón TK-1431662 en esta bitácora).

## BD objetivo

**AYUDASCP_IA_STAGING** primero; validar conversación; luego producción si aplica.
