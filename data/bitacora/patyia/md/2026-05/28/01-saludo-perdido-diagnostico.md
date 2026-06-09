# Diagnóstico — PatyIA dejó de saludar tras incorporar instrucciones por tipo de consulta

**Reporta:** Viviana (QA) · **Investiga:** Jeffrey (Dev) · **Conversaciones afectadas observadas:** `1784`, `1785` (BD `AYUDASCP_IA_STAGING`).

## Síntoma

Antes de la carga del 2026-05-25 (instrucciones por tipo de consulta), PatyIA respondía al primer mensaje con `"Hola Viviana, …"` / `"Hola Jeffre, …"` — el saludo y el uso del nombre del usuario viven en el template `PR_GENERAL` de OpenAI.

Después de esa carga, el primer mensaje vuelve directamente al contenido (`"Claro, te explico cómo actualizar …"`) sin saludo ni mención del nombre, **incluso para tipos de consulta que sí resuelven una instrucción** en `TDCONSULTAXINSTRUCCION`.

## Causa raíz #1 — `instructions` del body sobrescribe el template

En la **Responses API de OpenAI**, si un request envía simultáneamente `prompt.id` e `instructions`, el `instructions` del body **reemplaza** (no concatena) el `instructions` del template del prompt. Como el saludo y la lectura de la variable `{{nombre_usuario}}` viven dentro del template de `PR_GENERAL`, al colarles cualquier `instructions` desde la app se pierden por completo.

En el código actual de PatyIA (`src/020 Controller/005 - OpenIAServer.ts` → `executeRunWithStream`):

```ts
const body = {
  ...
  prompt: { id: promptId /* PR_GENERAL */, ...(this.nombres && { variables: { nombre_usuario: this.nombres } }) },
  ...(instructionsText && { instructions: instructionsText }),  // ⚠️ override
  ...
};
```

- Antes del 25-05 → `instrucciones?.length === 0` → `instructionsText = undefined` → el campo no se agrega al body → el template aplica completo → **saluda**.
- Después del 25-05 → `obtenerContextoConsulta` resuelve una instrucción por tipo → `instructionsText` se concatena → el body lleva `instructions` → **OpenAI ignora el template** → no saluda.

Cuadra 1:1 con lo que Viviana describe.

## Causa raíz #2 (secundaria) — `nombre_usuario` ausente si el JWT no trae `nombres`

`this.nombres = (this.Auth?.nombres || "").split(' ')[0]`. Cuando el JWT viene sin el campo `nombres` (o vacío), el spread `...(this.nombres && { variables: ... })` no envía la variable. Hoy queda eclipsado por la causa #1 (el template ni siquiera se ejecuta), pero **al resolver la #1 aflorará** y hay que cubrirlo con un fallback equivalente al de los endpoints de staging de ISA-DOC (`Tercero <itercero>`).

## Causa raíz #3 (lateral) — `itdconsulta` no se persiste en `CONVERSACIONES`

Viviana reporta *"no me le está asignando el tipo de consulta"*. En `obtenerContextoConsulta` el `itdconsulta` clasificado se usa para resolver instrucciones y vector stores, pero **nunca se asigna al `Obj: TConversacion`**, por lo que la fila en BD queda sin tipo. No afecta el saludo, pero es un bug real de instrumentación.

## Evidencia que se generará en la próxima prueba

Se amplió el sistema de trazas (`UlDebug` → JSON en `ISA-DOC/debug-logs/patyia/<YYYY-MM-DD>/`, flag `DEBUG_IA=1`, override `DEBUG_IA_DIR`). En el flujo del saludo ahora quedan estos pasos:

- `respuestaIA:identidad` — snapshot completo del JWT/Auth (`itercero`, `icontacto`, `nombres_procesado`, raw `Auth.nombres`/`Auth.apellidos`, `AuthExiste`, `diagnostico_saludo`).
- `saludo:variable:nombre_usuario` — marca `incluido: true|false`, `valor`, `razonExclusion` y raw del Auth, **antes** de armar el body.
- `saludo:override:instructions` — advierte explícitamente cuándo el body cae en el override del template y deja preview + longitud del `instructionsText` que sobrescribe a `PR_GENERAL`.

Con esto, al volver a generar conversaciones equivalentes a `1784` / `1785` (mensaje de prueba: *"¿Cómo actualizar ContaPyme a la última versión disponible?"*) los JSON dirán por escrito qué rama tomó cada request.

## Verificación empírica (2026-05-28 · QA-UI con Functions locales)

Se reprodujo el bug end-to-end desde el panel `PatyIA · Actions` apuntando a Azure Functions locales (`localhost:7071`) con identidad **Integraciones (810000630 / 702470)** y `DEBUG_IA=1`.

Conversaciones generadas:

- `1804` — traza: `ISA-DOC/debug-logs/patyia/2026-05-28/141111-048_respuestaIA_conv1804.json`.
- `1805` — traza: `ISA-DOC/debug-logs/patyia/2026-05-28/143240-313_respuestaIA_conv1805.json`. Prompt: *"Hola, ¿cómo actualizo ContaPyme a la última versión?"*.

Cadena causal observada en `conv 1805` (todos los pasos en el JSON):

| Paso | Evidencia clave |
| --- | --- |
| `respuestaIA:identidad` | `nombres_procesado: "Integraciones"`, `AuthExiste: true`, `diagnostico_saludo: "nombre disponible → se enviará variable nombre_usuario al prompt"`. |
| `clasificarConsulta:parsed` | `tipo_consulta: "PASO_A_PASO"`. |
| `relaciones` | `iinstruccion: "PASO_A_PASO"`, `nvectorstore: "vs_69debe…"`. |
| `textosInstruccion` | Contenido completo del prompt `PROMPT · PASO_A_PASO` (~10 KB). |
| `saludo:variable:nombre_usuario` | `incluido: true`, `valor: "Integraciones"` ← variable resuelta correctamente. |
| `saludo:override:instructions` | Diagnóstico ya emitido por el propio sistema. |
| `openai:body` | Body con `prompt.id` + `prompt.variables.nombre_usuario` + `instructions` (PASO_A_PASO) en simultáneo. |

Fragmento textual del `openai:body` enviado a `POST /v1/responses`:

```jsonc
{
  "model": "gpt-5.4",
  "input": "Hola, ¿cómo actualizo ContaPyme a la última versión?",
  "conversation": "conv_6a1898…",
  "prompt": {
    "id": "pmpt_69f9f70150…",                       // PR_GENERAL (saludo + {{nombre_usuario}})
    "variables": { "nombre_usuario": "Integraciones" }
  },
  "instructions": "# PROMPT · PASO_A_PASO\r\n…"     // ⚠️ sobrescribe el template
}
```

Respuesta del modelo: *"Claro, te explico cómo actualizar ContaPyme a la última versión. …"* — exactamente el patrón de los ejemplos de PASO_A_PASO, **sin saludo y sin mencionar a Integraciones**.

### Descartes confirmados por trazas

- ❌ No es que `nombres` esté vacío → `valor: "Integraciones"`.
- ❌ No es que `AuthExiste` falle → `true`.
- ❌ No es problema del clasificador ni del vector store → ambos resuelven correcto.
- ❌ No es race condition: `saludo:variable…` y `saludo:override:instructions` ocurren en el mismo tick (`t = 10018 ms`).

### Conclusión

Las tres causas (override, fallback de nombre, persistencia de `itdconsulta`) siguen vigentes tal como se enuncian arriba. La **causa raíz #1** queda **confirmada empíricamente**: el bug se reproduce de manera determinista cada vez que `obtenerContextoConsulta` resuelve al menos una instrucción para el `itdconsulta` clasificado.

## Pendiente (NO se ha tocado, está fuera de alcance de este diagnóstico)

Decisión técnica que recogió la conversación con Diego: *"no se pueden enviar varios `prompt.id`, pero sí varias instrucciones"*. La intención original era **acumular** PR_GENERAL + instrucción por tipo, pero la API no lo hace así. Opciones que se discutirán antes de implementar:

- **A — Limpia (recomendada)**. Añadir una variable `{{instrucion_tipo}}` al template `PR_GENERAL` en platform.openai.com, mover la(s) instrucción(es) por tipo a esa variable y **eliminar el `instructions` del body**. Mantiene un único prompt gestionado en OpenAI y respeta el saludo.
- **B — Pragmática**. Anteponer las instrucciones del tipo al `input` (no como `instructions`). Más fácil, pero ensucia el mensaje del usuario y altera la conversación persistida.
- **C — Inversa**. Dejar de usar `prompt.id` y mover el contenido completo del `PR_GENERAL` a `instructions` del body, concatenado con la instrucción por tipo. Pierde la gestión central de prompts en OpenAI.

## Solución aplicada (paso a paso)

Se eligió la **opción A** y se validó empíricamente en `conv 1806` (2026-05-28). Pasos ejecutados:

1. **Edición del template `PR_GENERAL` en platform.openai.com (v13).** Variables `nombre_usuario` e `instrucion_tipo`; el slot `{{instrucion_tipo}}` se concatena al final del developer message (tras `---`). El saludo y `{{nombre_usuario}}` al inicio quedaron intactos.
2. **Refactor del body en `executeRunWithStream`** (`PatyIA/src/020 Controller/005 - OpenIAServer.ts`):
   - Se eliminó el campo `instructions` del request a `POST /v1/responses`.
   - Las instrucciones por tipo (resultado de `obtenerContextoConsulta → textosInstruccion.join("\n\n")`) se inyectan ahora como `prompt.variables.instrucion_tipo`.
   - `prompt.variables` se construye en un único `Record<string, string>` que reúne ambas variables y solo se adjunta al body si tiene alguna llave.
   ```ts
   const promptVariables: Record<string, string> = {};
   if (this.nombres) promptVariables.nombre_usuario = this.nombres;
   if (instructionsText) promptVariables.instrucion_tipo = instructionsText;

   const body = {
     model: varEnv("OPENAI_MODEL") || "gpt-4o",
     input: Obj.prompt,
     stream: true,
     store: true,
     conversation: Obj.hilo,
     prompt: {
       id: promptId, // PR_GENERAL
       ...(Object.keys(promptVariables).length && { variables: promptVariables }),
     },
     ...(vectorStoreIds?.length && {
       tools: [{ type: "file_search", vector_store_ids: vectorStoreIds, max_num_results: 3 }],
     }),
   };
   ```
3. **Build + restart de Functions locales.** `npm run build` en `PatyIA/` y `func start` en el mismo directorio (`host.json` debe estar en la cwd).
4. **QA UI con identidad Integraciones (`810000630 / 702470`).** Desde `http://localhost:4400/patyia/actions` se creó la conversación `1806` con el prompt *"Hola, ¿cómo actualizo ContaPyme a la última versión?"*.
5. **Verificación en la traza** `ISA-DOC/debug-logs/patyia/2026-05-28/145039-405_respuestaIA_conv1806.json`:
   - `openai:body` ya **no** contiene la llave `instructions`.
   - `prompt.variables` contiene ambas: `nombre_usuario: "Integraciones"` y `instrucion_tipo` (10 144 caracteres del prompt `PASO_A_PASO`).
   - La respuesta del modelo empieza con **"Claro, Integraciones. Esta es la guía documentada para actualizar ContaPyme…"** y a continuación entrega la guía estructurada del tipo `PASO_A_PASO` con sus secciones, emojis y recursos adicionales — confirma que **ambas** sustituciones (`{{nombre_usuario}}` y `{{instrucion_tipo}}`) están operando dentro del template.

### Resultado

- ✅ Saludo recuperado en el primer mensaje.
- ✅ Nombre del usuario inyectado correctamente.
- ✅ Instrucciones por tipo siguen aplicándose, ahora desde el template y no por override.
- ✅ Un único prompt gestionado en OpenAI (no se fragmenta `PR_GENERAL`).

### Pendientes derivados

- **Causa raíz #2** (fallback de `nombre_usuario` cuando el JWT no trae `nombres`): sigue abierta. Definir el fallback equivalente al de los endpoints staging de ISA-DOC (`Tercero <itercero>`).
- **Causa raíz #3** (`itdconsulta` no se persiste en `CONVERSACIONES`): sigue abierta. Asignar el `itdconsulta` clasificado al `TConversacion` antes de persistir.
