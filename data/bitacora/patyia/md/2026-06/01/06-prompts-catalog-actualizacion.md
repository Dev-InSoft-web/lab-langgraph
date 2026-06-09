# Prompts catálogo · actualización en INSTRUCCION (13 tipos)

Se reescribieron los **13 prompts base** del catálogo PatyIA (`050-prompts/catalog/PROMPT_<TIPO>.md`) y hay que reflejarlos en **AYUDASCP_IA** para que `TInstruccionController` entregue el texto vigente en `instrucion_tipo`.

## Archivos fuente (repo)

| Archivo | `iinstruccion` |
|---|---|
| `PROMPT_ASESORIA_PERSONALIZADA.md` | `ASESORIA_PERSONALIZADA` |
| `PROMPT_COMERCIAL.md` | `COMERCIAL` |
| `PROMPT_CONSULTA_NORMATIVA_NEGOCIO.md` | `CONSULTA_NORMATIVA_NEGOCIO` |
| `PROMPT_ERROR_ACCESO.md` | `ERROR_ACCESO` |
| `PROMPT_ERROR_CONFIGURACION.md` | `ERROR_CONFIGURACION` |
| `PROMPT_ERROR_DIAN.md` | `ERROR_DIAN` |
| `PROMPT_ERROR_TECNICO.md` | `ERROR_TECNICO` |
| `PROMPT_FUERA_DE_ALCANCE_TECNICO.md` | `FUERA_DE_ALCANCE_TECNICO` |
| `PROMPT_INTERPRETACION_RESULTADO.md` | `INTERPRETACION_RESULTADO` |
| `PROMPT_PASO_A_PASO.md` | `PASO_A_PASO` |
| `PROMPT_REQUIERE_CONTEXTO.md` | `REQUIERE_CONTEXTO` |
| `PROMPT_SALUDO_OTRO.md` | `SALUDO_OTRO` |
| `PROMPT_SOLICITUD_NO_PERMITIDA.md` | `SOLICITUD_NO_PERMITIDA` |

## Qué hace el SQL

1. **MERGE** en `INSTRUCCION`: `iinstruccion = <TIPO>`, `ninstruccion = PROMPT_<TIPO>`, `instruccion` = contenido literal del `.md`.
2. **MERGE** en `TDCONSULTAXINSTRUCCION`: enlace `itdconsulta = <TIPO>` → `iinstruccion`, `orden = 1`.

Idempotente: re-ejecutar sobrescribe `instruccion` sin duplicar filas.

## Regenerar el MERGE tras editar los `.md`

```bash
node scripts/patyia/prompts/build-paty-prompts-sql.mjs
```

## Verificación post-ejecución

Esperado: **13 filas** en el `SELECT` final (`iinstruccion`, `ninstruccion`, `version`, `len_instruccion`).

## Nota

Esta carga corresponde al **catálogo base** (`catalog/PROMPT_*.md`). La variante **Ultra** (`catalog/Ultra/`) tiene su propio MERGE (`seed-prompts-ultra-tdconsulta.sql`) en el acordeón hermano de esta misma fecha.

## BD objetivo

**AYUDASCP_IA_STAGING** primero; validar conversación; luego producción si aplica.
