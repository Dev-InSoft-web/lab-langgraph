# Carga inicial de prompts específicos por tipo de consulta (`AYUDASCP_IA`)

Viviana compartió la configuración de los 13 prompts específicos que arman la instrucción del asistente según el tipo de consulta clasificado. Cada uno vive como `.md` en la carpeta de proyecto (`P:\ING-05…\PROMPT_<TIPO>.md`), pero esa ruta es **solo documental**: el Azure Function `AYUDASCP-IA` no tiene acceso a ese recurso compartido y por eso **no puede leerlos del filesystem** en runtime.

## Origen del contenido en este seed

Los 13 `.md` que se insertan **son exactamente los mismos** que ya están versionados en este repo bajo [`src/lib/features/patyia/050-prompts/catalog/`](../../../050-prompts/catalog/) y que se renderizan en la sección **Docs · 05 Prompts de Paty** ([/patyia/docs](/patyia/docs) → *05 Prompts de Paty*), cada uno dentro de su acordeón.

> Es la misma fuente, sin divergencias: lo que el usuario lee en la documentación es lo que queda cargado en la BD.

Vite los empaqueta vía `?raw` al hacer build de ISA-DOC, por lo que el contenido literal va inline en el SQL generado y deja de depender de `P:\` o de cualquier filesystem en runtime.

## Dónde queda en la BD

El modelo ya tiene las tablas exactas para esto:

| Tabla | Rol |
|---|---|
| `INSTRUCCION` | Contenido del prompt en la columna `instruccion` (NVARCHAR(MAX)). |
| `TDCONSULTA` | Catálogo de tipos (`SALUDO_OTRO`, `COMERCIAL`, …). |
| `TDCONSULTAXINSTRUCCION` | Relación M:N con `orden` (qué instrucciones aplican a cada tipo y en qué secuencia). |

El controller `TInstruccionController.GetInstruccionTexto` lee `INSTRUCCION.instruccion` directo del registro, así que el contenido del `.md` se **persiste en la columna**, no se referencia por ruta. Esto desacopla el runtime del recurso compartido `P:\` y permite versionado / consulta SQL.

## Convención de claves usada en el seed

- `INSTRUCCION.iinstruccion` = `INSTRUCCION.ninstruccion` = `'PROMPT_<TIPO>'` (p. ej. `PROMPT_SALUDO_OTRO`). Es código estable y legible.
- `INSTRUCCION.version` = `'1.0'`, `bactivo = 1`, `fhini = SYSUTCDATETIME()` al insertar.
- `TDCONSULTAXINSTRUCCION.orden = 1` (única instrucción específica por tipo en esta versión; si más adelante se acumulan, se incrementa el orden).
- El `itdconsulta` se resuelve por subquery sobre `TDCONSULTA.nconsulta = '<TIPO>'`.

## Tipos cargados

`SALUDO_OTRO`, `FUERA_DE_ALCANCE_TECNICO`, `SOLICITUD_NO_PERMITIDA`, `REQUIERE_CONTEXTO`, `PASO_A_PASO`, `INTERPRETACION_RESULTADO`, `CONSULTA_NORMATIVA_NEGOCIO`, `ASESORIA_PERSONALIZADA`, `ERROR_TECNICO`, `ERROR_CONFIGURACION`, `ERROR_ACCESO`, `ERROR_DIAN`, `COMERCIAL`.

## Idempotencia

El script usa `MERGE` en ambas tablas:

- Si la instrucción ya existe (mismo `iinstruccion`): actualiza `instruccion`, `descripcion`, `version`, `bactivo`.
- Si la relación ya existe: refresca `orden`.
- Si no existe: inserta.

Volver a ejecutarlo no duplica filas y sirve como mecanismo de **actualización** del prompt cuando se reescriba un `.md` en `src/lib/features/patyia/050-prompts/catalog/` y se regenere el seed con `node scripts/build-paty-prompts-sql.mjs`.

## Verificación

El script cierra con un `SELECT` que devuelve `iinstruccion`, `ninstruccion`, longitud del prompt, `itdconsulta` y `nconsulta` para confirmar las 13 filas y su enlace.

> Ejecución: la bitácora de PatyIA usa el endpoint dedicado `/api/patyia/db/exec` (pool propio `getPatyPool()` con variables `paty_hostdb/...` tomadas del `local.settings.json` de PatyIA). El banner superior consulta `/api/patyia/db/ping` para confirmar la conexión contra **AYUDASCP_IA** antes de habilitar el botón. El endpoint genérico `/api/db/exec` sigue apuntando a ClientesIS y no se mezcla con este flujo.

