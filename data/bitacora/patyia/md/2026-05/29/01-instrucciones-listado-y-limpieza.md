## PatyIA — Listado de INSTRUCCION y limpieza de premisas residuales

Tras el análisis de costos de tokens del 28-may se identificó que la rutina
`generarPremisasInput` (en `005 - OpenIAServer.ts`) estaba persistiendo cada
nueva premisa generada por OpenAI en la tabla `INSTRUCCION` mediante
`TInstruccionController.InsertarIInstrucciones()`. Esas filas se insertaban
solo con `IINSTRUCCION` y `NINSTRUCCION`, dejando `INSTRUCCION` y `DESCRIPCION`
vacías y ensuciando el catálogo (que también almacena los prompts reales
`PROMPT_<TIPO>` con cuerpo y descripción).

**Cambios:**

1. **Backend PatyIA**: se elimina la persistencia de premisas. Estas viven
   exclusivamente en el log local (`logs/conversaciones/conv-*.json` vía
   `appendConvTurno`). El catálogo de `INSTRUCCION` queda reservado para los
   prompts gestionados manualmente.
2. **BD**: limpiar las filas residuales de premisas auto-insertadas
   (`INSTRUCCION` y `DESCRIPCION` vacías) con el script de cleanup.

**SQL incluidos abajo:**

- `select-all-instrucciones.sql` — inspección del catálogo actual.
- `cleanup-instrucciones-vacias.sql` — vista previa + DELETE de las filas
  vacías dentro de una transacción.
