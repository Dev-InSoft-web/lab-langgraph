## PatyIA — Análisis de reunión: propuesta de mejora 2026-05-29

Fuente revisada: video **“Propuesta de mejora PatyIA - 2026 05 29 08 42 16”**
(`yXYP5yl88no`, duración aproximada 1h17m). La transcripción disponible es
automática, por lo que algunos términos aparecen con errores de ASR, pero el
sentido técnico de la reunión queda claro.

**Lectura técnica de la reunión:**

1. El frente más urgente es **reducir tokens de entrada**. Se observaron
   conversaciones donde las instrucciones largas se reinyectan en cada turno,
   elevando mucho el costo. La línea de trabajo es mantener prompts legibles
   para humanos y usar versiones compactadas en runtime (`caveman`, `ultra`,
   `wenyan-ultra`) cuando el contenido ya esté estabilizado.
2. La arquitectura debe distinguir **tareas operativas** de **respuestas de
   conocimiento**. Clasificar intención, módulo, título, resumen, sí/no o
   extracción corta no requiere el mismo modelo que una respuesta final con
   documentación y contexto. La propuesta es bajar esos pasos a modelos nano y
   reservar modelos más costosos para donde realmente aporten valor.
3. La integración con OpenAI debe conservar siempre el **prompt general**. Las
   instrucciones por tipo de consulta, variables y vector stores deben sumarse
   como capas de contexto, no reemplazar las reglas globales de identidad,
   seguridad, tono y límites funcionales de Paty.
4. Los prompts, modelos y fuentes deben pasar de configuración rígida a
   **configuración persistida y trazable**. La base de datos debe permitir saber
   qué instrucción, modelo y vector stores aplican a cada `tipo_consulta`, con
   fallback explícito cuando falte configuración.
5. Se mencionan próximos frentes complementarios: explorar MCP para exponer
   herramientas, evaluar embeddings/Postgres para recuperación propia, y dejar
   abierta la evolución hacia imágenes o voz. Esos frentes dependen de tener
   primero prompts, modelos y trazabilidad bajo control.

**Tickets derivados de este análisis:**

- `TK-1431666`: actualizar en BD las instrucciones compactadas de Paty IA desde
  la carpeta `Prompts Específicos (Instrucciones)\Ultra`.
- `TK-1431163`: ajustar la integración OpenAI para conservar el prompt general
  junto con instrucciones específicas, variables y vector stores.
- `TK-1431662`: implementar selección de modelo IA por tipo de consulta,
  separando pasos operativos de respuestas de conocimiento.

**Criterio de diseño que queda para futuras decisiones:** toda mejora nueva debe
responder tres preguntas antes de implementarse: cuánto reduce costo/latencia,
cómo conserva la calidad del prompt general, y qué trazabilidad deja para auditar
modelo, tokens, fuentes y tipo de consulta.