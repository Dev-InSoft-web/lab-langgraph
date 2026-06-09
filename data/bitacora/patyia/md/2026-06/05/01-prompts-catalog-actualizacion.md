# Prompts catálogo base · MERGE en INSTRUCCION (05-jun-2026)

Actualización de los **13 prompts por tipo** con la versión **catálogo base** (`050-prompts/catalog/PROMPT_<TIPO>.md`). El texto literal del `.md` queda en `INSTRUCCION.instruccion` para que PatyIA lo use en `instrucion_tipo`.

## Archivos fuente

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

1. **MERGE** en `INSTRUCCION`: `iinstruccion = <TIPO>`, `ninstruccion = PROMPT_<TIPO>`, `instruccion` = contenido del `.md`, `version = 1.0`.
2. **MERGE** en `TDCONSULTAXINSTRUCCION`: `itdconsulta = <TIPO>` → `iinstruccion`, `orden = 1`.

Idempotente: re-ejecutar sobrescribe `instruccion` sin duplicar filas.

## Regenerar el MERGE

```bash
node scripts/patyia/prompts/build-paty-prompts-sql.mjs
```

## Verificación

Esperado: **13 filas** en el `SELECT` final (`iinstruccion`, `ninstruccion`, `version`, `len_instruccion`).

## BD objetivo

**AYUDASCP_IA_STAGING** (banner PatyIA verde). Producción tras validación.
