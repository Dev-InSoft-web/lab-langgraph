## TK-1431662 — Modelo IA por instrucción (MODELO)

- **Objetivo:** cada tipo de consulta (`SALUDO_OTRO`, `PASO_A_PASO`, …) define el modelo de **respuesta final** vía columna `MODELO` en `INSTRUCCION`.

- **Migración SQL (`add-modelo-instruccion.sql` / SSMS):**
  - Agrega columna `MODELO NVARCHAR(40)` si no existe (default `gpt-5-nano`).
  - Normaliza filas con valor vacío a `gpt-5-nano` (sin `SELECT` final; evidencia en SSMS).

- **Calibración actual:** `update-instruccion-modelo-gpt5-nano.sql` pone **`gpt-5-nano`** en **todas** las filas de `INSTRUCCION` (ejecutable desde la bitácora vía SqlExecCard).

- **Backend (PatyIA):**
  - `TInstruccion.GetModelo` lee `INSTRUCCION.MODELO` vía `TDCONSULTAXINSTRUCCION`.
  - Clasificación de tipo: `clasificarConsulta` → `responses.create` con `PR_TIPO_CONSULTAS` y `modeloOperativo` (`gpt-4.1-nano`).
  - Otras operativas (premisas, título, módulo): mismo `modeloOperativo` en `system-prompts.json`.
  - Fallback respuesta si no hay modelo: `modeloConversacion` en `system-prompts.json` (`gpt-5-nano`).

---
