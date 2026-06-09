# PatyIA · Matrices visión × detail × reasoning

**Bitácora:** 2026-06-09 · `checkKey`: `2026-06-09.patyia.vision-reasoning-matrix`

## Tabla de criterios del juez

Cada **Cn** es **índice único 1…N** dentro del grupo de la tabla (1 = peor en ese criterio, N = mejor; sin repetir en la columna). **CT** = Σ(C1…C5); entre paréntesis, índice resumen **1…N** del total (1 = peor suma, N = mejor). **Calif.** = Σ(nota cruda × peso). **Rank** = índice global del test (1 = peor, N = mejor).

| ID | Criterio | Peso | Descripción |
|---|---|---:|---|
| **C1** | Precisión textual | 30% | Exactitud de títulos, etiquetas y citas vs. lo visible en la infografía. |
| **C2** | Cobertura de elementos | 25% | Iconos, secciones, bloques y relaciones visuales mencionados. |
| **C3** | Detalle útil | 20% | Profundidad relevante sin relleno ni repetición vacía. |
| **C4** | Claridad y orden | 15% | Estructura legible y jerarquía de lo importante. |
| **C5** | Fidelidad (anti-alucinación) | 10% | Sin textos inventados, typos fabricados ni elementos no visibles. |

---

# gpt-5-mini

**Fecha corrida:** 2026-06-09T13:25:34.318Z

**Modelo:** `gpt-5-mini` · **Imagen:** `notebooklm/unnamed.png`

**Pregunta:** Con base en esa imagen, ¿qué elementos o texto identificas con más claridad?

**Dimensiones:** estrategia × detail × reasoning (3×3 por estrategia).

**Fecha evaluación juez:** 2026-06-09T14:32:12.027Z

**Total corridas:** 27

### Ranking global mini (todos los tests)

Índice **único** entre todos los tests del bloque (1 = peor → 27 = mejor). Cada **Cn** es índice único 1…27 en su columna. **CT** resume los C* (suma + índice 1…27).

| Rank global | Estrategia | Detail | Reasoning | ms | conv | C1 | C2 | C3 | C4 | C5 | CT | Calif. |
|---:|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **1** | `auto` | low | low | 9034 | 1989 | 1 | 1 | 1 | 3 | 1 | 7 (2) | — |
| **2** | `data_url` | medium | low | 10792 | 2001 | 2 | 1 | 2 | 3 | 2 | 10 (4) | — |
| **3** | `data_url` | low | low | 11023 | 1998 | 4 | 3 | 4 | 1 | 3 | 15 (8) | — |
| **4** | `auto` | medium | low | 11636 | 1992 | 4 | 4 | 4 | 2 | 5 | 19 (11) | — |
| **5** | `data_url` | high | low | 11813 | 2004 | 1 | 4 | 1 | 2 | 1 | 9 (3) | — |
| **6** | `auto` | high | low | 11857 | 1995 | 2 | 2 | 2 | 4 | 3 | 13 (6) | — |
| **7** | `file_upload` | high | low | 12426 | 2013 | 4 | 4 | 4 | 5 | 5 | 22 (13) | — |
| **8** | `data_url` | low | medium | 12516 | 1999 | 8 | 8 | 8 | 8 | 8 | 40 (23) | — |
| **9** | `auto` | medium | medium | 12608 | 1993 | 7 | 8 | 7 | 7 | 7 | 36 (21) | — |
| **10** | `file_upload` | low | low | 12932 | 2007 | 2 | 2 | 2 | 3 | 2 | 11 (5) | — |
| **11** | `file_upload` | medium | low | 14593 | 2010 | 9 | 9 | 9 | 9 | 9 | 45 (25) | — |
| **12** | `auto` | low | medium | 14754 | 1990 | 6 | 6 | 6 | 6 | 6 | 30 (16) | — |
| **13** | `data_url` | medium | medium | 16061 | 2002 | 3 | 2 | 3 | 4 | 5 | 17 (10) | — |
| **14** | `file_upload` | low | medium | 16118 | 2008 | 1 | 1 | 1 | 1 | 1 | 5 (1) | — |
| **15** | `data_url` | high | medium | 16428 | 2005 | 6 | 6 | 6 | 6 | 6 | 30 (17) | — |
| **16** | `auto` | high | medium | 16852 | 1996 | 9 | 9 | 9 | 9 | 9 | 45 (26) | — |
| **17** | `file_upload` | high | medium | 17901 | 2014 | 7 | 7 | 7 | 6 | 7 | 34 (19) | — |
| **18** | `file_upload` | medium | medium | 22267 | 2011 | 3 | 3 | 3 | 4 | 3 | 16 (9) | — |
| **19** | `file_upload` | medium | high | 24771 | 2012 | 6 | 6 | 6 | 7 | 6 | 31 (18) | — |
| **20** | `auto` | high | high | 38112 | 1997 | 3 | 3 | 3 | 1 | 4 | 14 (7) | — |
| **21** | `auto` | medium | high | 38394 | 1994 | 5 | 5 | 5 | 5 | 2 | 22 (14) | — |
| **22** | `file_upload` | low | high | 39167 | 2009 | 5 | 5 | 5 | 2 | 4 | 21 (12) | — |
| **23** | `auto` | low | high | 39276 | 1991 | 8 | 7 | 8 | 8 | 8 | 39 (22) | — |
| **24** | `data_url` | medium | high | 41241 | 2003 | 5 | 5 | 5 | 5 | 4 | 24 (15) | — |
| **25** | `data_url` | low | high | 42063 | 2000 | 9 | 9 | 9 | 9 | 9 | 45 (27) | — |
| **26** | `file_upload` | high | high | 43646 | 2015 | 8 | 8 | 8 | 8 | 8 | 40 (24) | — |
| **27** | `data_url` | high | high | 56740 | 2006 | 7 | 7 | 7 | 7 | 7 | 35 (20) | — |

---

## Estrategia: `auto` — auto — umbral dinámico (default PatyIA)

**Qué hace:**

- Comportamiento **por defecto** en PatyIA tras `normalizeVisionBuffer`.
- Si el JPEG normalizado pesa **≤ ~1,5 MB** → `input_image` con **data URL** inline.
- Si supera el umbral → sube a OpenAI Files API (`purpose: vision`) y usa **`file_id`**.
- En la corrida con `unnamed.png`, casi siempre termina en **file_id** (imagen grande).
- Ventaja: equilibrio automático entre payload y límites de visión.

**Parámetros body:** `vision_strategy: "auto"`, `vision_detail: low|medium|high`, `reasoning_effort: low|medium|high`.

**Mapeo detail → API:** `low→low`, `medium→auto`, `high→high` (Según `vision_detail` en body; envío inline o Files API según tamaño.).

### Tablas por reasoning (`reasoning_effort`)

Cada tabla agrupa las filas por **detail level** con `reasoning_effort` fijo.

#### Reasoning **low**

| Detail level | API `detail` | Respuesta (extracto) | ms | Calif. | Rank | conv |
|---|---|---|---:|---:|---:|---:|
| **low** | low | Veo varios textos y elementos claramente legibles. Los más prominentes son: - Título principal: "PatyIA: El Ecosistema Detrás del Asistente Inteligente" - Secci… | 9034 | — | 1 | 1989 |
| **medium** | auto | Puedo leer varios títulos y elementos con claridad. Los más evidentes son: - Título principal: "PatyIA: El Ecosistema Detrás del Asistente Inteligente" - Secció… | 11636 | — | 2 | 1992 |
| **high** | high | Puedo leer varios títulos y elementos con bastante claridad. Los más destacados son: - Título principal: "PatyIA: El Ecosistema Detrás del Asistente Inteligente… | 11857 | — | 3 | 1995 |

#### Reasoning **medium**

| Detail level | API `detail` | Respuesta (extracto) | ms | Calif. | Rank | conv |
|---|---|---|---:|---:|---:|---:|
| **low** | low | Veo con claridad varios títulos, etiquetas y elementos gráficos. Entre los textos y elementos más legibles están: - Título principal: "PatyIA: El Ecosistema Det… | 14754 | — | 5 | 1990 |
| **medium** | auto | Veo varios elementos y textos claramente legibles en la imagen. Los más destacados son: - Título principal: "PatyIA: El Ecosistema Detrás del Asistente Intelige… | 12608 | — | 4 | 1993 |
| **high** | high | Veo con claridad varios títulos, etiquetas y elementos gráficos principales. Entre ellos: - Título grande: "PatyIA: El Ecosistema Detrás del Asistente Inteligen… | 16852 | — | 6 | 1996 |

#### Reasoning **high**

| Detail level | API `detail` | Respuesta (extracto) | ms | Calif. | Rank | conv |
|---|---|---|---:|---:|---:|---:|
| **low** | low | Puedo leer varios títulos y elementos con bastante claridad. Entre los más legibles están: - Título principal: "PatyIA: El Ecosistema Detrás del Asistente Intel… | 39276 | — | 9 | 1991 |
| **medium** | auto | Puedo leer con claridad muchos de los títulos y elementos. Resumo lo más visible: Títulos/encabezados principales - PatyIA: El Ecosistema Detrás del Asistente I… | 38394 | — | 8 | 1994 |
| **high** | high | Puedo leer con claridad los títulos y etiquetas principales. Entre los elementos/textos más legibles están: - Título: "PatyIA: El Ecosistema Detrás del Asistent… | 38112 | — | 7 | 1997 |


### Matriz de criterios — dominio estrategia (rank 1…9, único)

Cada columna **C1…C5** usa índices **1…9** sin repetir (1 = peor en ese criterio dentro de la estrategia). **CT** = Σ(C1…C5) e índice resumen **(1…9)**.

| Rank | Detail | Reasoning | ms | conv | C1 | C2 | C3 | C4 | C5 | CT | Calif. |
|---:|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **1** | low | low | 9034 | 1989 | 1 | 1 | 1 | 3 | 1 | 7 (1) | — |
| **2** | medium | low | 11636 | 1992 | 4 | 4 | 4 | 2 | 5 | 19 (4) | — |
| **3** | high | low | 11857 | 1995 | 2 | 2 | 2 | 4 | 3 | 13 (2) | — |
| **4** | medium | medium | 12608 | 1993 | 7 | 8 | 7 | 7 | 7 | 36 (7) | — |
| **5** | low | medium | 14754 | 1990 | 6 | 6 | 6 | 6 | 6 | 30 (6) | — |
| **6** | high | medium | 16852 | 1996 | 9 | 9 | 9 | 9 | 9 | 45 (9) | — |
| **7** | high | high | 38112 | 1997 | 3 | 3 | 3 | 1 | 4 | 14 (3) | — |
| **8** | medium | high | 38394 | 1994 | 5 | 5 | 5 | 5 | 2 | 22 (5) | — |
| **9** | low | high | 39276 | 1991 | 8 | 7 | 8 | 8 | 8 | 39 (8) | — |

### Detalle textual por celda

#### detail=`low` · reasoning=`low` · rank **1** · conv `1989`

Veo varios textos y elementos claramente legibles. Los más prominentes son:

- Título principal: "PatyIA: El Ecosistema Detrás del Asistente Inteligente"
- Sección/etiqueta: "Orquestador AYUDASCP-IA"
- Iconos y texto: "Microservicio Azure"
- Bloque: "IA con Base de Conocimiento (RAG)"
  - "OpenAI"
  - "Vector Storage"
  - "Respuestas precisas"
  - "Archivos de soporte"
- Área derecha: "Persistencia en MSSQL"
  - Subtítulos: "CONVERSACIONES", "MENSAJES CALIFICADOS", "TIQUETES"
  - Ítems bajo Conversaciones: "Registro núcleo del intercambio", "Tokens consumidos", "Hilos de IA"
  - Ítem bajo Mensajes calificados: "Retroalimentación del usuario (útil/no útil)"
  - Ítem bajo Tiquetes: "Vinculación única entre conversación y caso de soporte externo"
- Sección central/inferior: "El Ciclo de Vida del Chat"
  - "Autenticación vía JWT"
  - "Respuesta Fluida (Streaming)"
  - "Reglas de Gestión de Estado"
- Otros textos pequeños y elementos visuales: íconos de cerebro, escudo (lógica de autenticación), capa de pilas/archivos apilados, logos tipo OpenAI, flechas de flujo y varios pictogramas (pulgares, tickets, monedas, crayons decorativos).

Si quieres, puedo transcribir con más detalle alguna sección específica de la imagen.

#### detail=`low` · reasoning=`medium` · rank **5** · conv `1990`

Veo con claridad varios títulos, etiquetas y elementos gráficos. Entre los textos y elementos más legibles están:

- Título principal: "PatyIA: El Ecosistema Detrás del Asistente Inteligente".
- Sección izquierda superior: "Orquestador AYUDASCP-IA".
  - Iconos: logo geométrico neon, cerebro (microservicio).
  - Etiquetas: "MICROSERVICIO AZURE", "LÓGICA DE AUTENTICACIÓN", "PERSISTENCIA", "LLAMADAS A LA IA".
- Sección central-inferior: "IA con Base de Conocimiento (RAG)".
  - Palabras: "OPENAI", "VECTOR STORAGE", "RESPUESTAS PRECISAS", "ARCHIVOS DE SOPORTE".
- Sección derecha superior: "Persistencia en MSSQL".
  - Subtítulos y bullets:
    - "CONVERSACIONES" — "REGISTRO NÚCLEO DEL INTERCAMBIO", "TOKENS CONSUMIDOS", "HILOS DE IA".
    - "MENSAJES CALIFICADOS" — "RETROALIMENTACIÓN DEL USUARIO (ÚTIL/NO ÚTIL)" (con iconos de pulgar).
    - "TIQUETES" — "VINCULACIÓN ÚNICA ENTRE CONVERSACIÓN Y CASO DE SOPORTE EXTERNO" (icono de ticket).
- Barra intermedia: "El Ciclo de Vida del Chat".
  - Subsecciones visibles: "Autenticación vía JWT", "Respuesta Fluida (Streaming)", "Reglas de Gestión de Estado".
  - Texto legible: "CREDENCIAL VÍA JWT", "INTERACCIÓN CON API", "IA RESPUESTA", "CIERRE AUTOMÁTICO TRAS 4 HORAS DE INACTIVIDAD", "BORRADO LÓGICO PARA OCULTAR CHATS" (el término exacto del borrado puede variar ligeramente).
- Iconografía clara: logo de OpenAI, bases de datos en capas, pila de documentos/conversaciones, escudo (autenticación), ticket, pulgares arriba/abajo, lápices/crayones decorativos.

Si quieres, puedo transcribir con más detalle cualquier área concreta de la imagen; dime cuál.

#### detail=`low` · reasoning=`high` · rank **9** · conv `1991`

Puedo leer varios títulos y elementos con bastante claridad. Entre los más legibles están:

- Título principal: "PatyIA: El Ecosistema Detrás del Asistente Inteligente"
- "Orquestador AYUDASCP-IA"
- "MICROSERVICIO AZURE" (con icono de un cerebro)
- Etiquetas junto al microservicio: "Lógica de autenticación", "Persistencia", "Llamadas a la IA"
- Bloque RAG: "IA con Base de Conocimiento (RAG)"
  - "OPENAI" (logo)
  - "VECTOR STORAGE"
  - "RESPUESTAS PRECISAS"
  - "ARCHIVOS DE SOPORTE"
- Bloque de persistencia: "Persistencia en MSSQL"
  - Secciones: "CONVERSACIONES", "MENSAJES CALIFICADOS", "TIQUETES"
  - Bajo Conversaciones: "Registro núcleo del intercambio", "Tokens consumidos", "Hilos de IA"
  - Bajo Mensajes Calificados: "Retroalimentación del usuario (útil/no útil)" (con íconos de pulgar arriba/abajo)
  - Bajo Tiquetes: "Vinculación única entre conversación y caso de soporte externo" (con ícono de ticket)
- Sección "El Ciclo de Vida del Chat"
  - "Autenticación vía JWT" (y "Credential vía JWT"/"Validar")
  - "Interacción con API" → "IA Respuesta" (icono de OpenAI)
  - "Respuesta Fluida (Streaming)" y el texto: "La respuesta de la IA se transmite en tiempo real al frontend para mejorar la experiencia"
  - "Reglas de Gestión de Estado" con "Cierre automático tras 4 horas de inactividad" y texto que parece "Borrado lógico para ocultar chats" (esta última palabra es algo menos nítida)
- Otros elementos gráficos claros: logo/figura geométrica neón a la izquierda, iconos de escudo, base de datos, ticket, pulgares, monedas, y las crayolas de colores en los márgenes.
- Marca/watermark visible: "NotebookLM"

Si quieres, puedo transcribir con más detalle alguna sección específica o ampliar la lectura de las partes menos nítidas (p. ej. la palabra que parece "Borrado lógico" o la etiqueta tipo "DSCLIENTES"). ¿Cuál zona te interesa más?

#### detail=`medium` · reasoning=`low` · rank **2** · conv `1992`

Puedo leer varios títulos y elementos con claridad. Los más evidentes son:

- Título principal: "PatyIA: El Ecosistema Detrás del Asistente Inteligente"
- Sección/elementos superiores:
  - "Orquestador AYUDASCP-IA"
  - Ícono/etiqueta "MICROSERVICIO AZURE"
  - "Lógica de autenticación", "Persistencia", "Llamadas a la IA" (junto a iconos)
- Bloque RAG:
  - "IA con Base de Conocimiento (RAG)"
  - "OPENAI"
  - "VECTOR STORAGE"
  - "RESPUESTAS PRECISAS"
  - "ARCHIVOS DE SOPORTE"
- Persistencia en base de datos:
  - "Persistencia en MSSQL"
  - Subtítulos: "CONVERSACIONES" (con entradas: "REGISTRO NÚCLEO DEL INTERCAMBIO", "TOKENS CONSUMIDOS", "HILOS DE IA")
  - "MENSAJES CALIFICADOS" (con "RETROALIMENTACIÓN DEL USUARIO (ÚTIL/NO ÚTIL)")
  - "TIQUETES" (con "VINCULACIÓN ÚNICA ENTRE CONVERSACIÓN Y CASO DE SOPORTE EXTERNO")
- Ciclo de vida / flujo:
  - "Autenticación vía JWT"
  - "Respuesta Fluida (Streaming)"
  - "Reglas de Gestión de Estado"
- Otros textos/íconos visibles: "CREDENTIAL VÍA JWT", "DSCLIENTES", "INTERACCIÓN CON API", "IA RESPUESTA"
- Elementos gráficos destacados: icono de cerebro/neurona, logo tipo OpenAI, pila/stack de documentos, ticket, iconos de pulgar arriba/abajo, lápices/ceras de colores.

Si quieres, puedo transcribir con mayor detalle alguna sección concreta de la imagen.

#### detail=`medium` · reasoning=`medium` · rank **4** · conv `1993`

Veo varios elementos y textos claramente legibles en la imagen. Los más destacados son:

- Título principal: "PatyIA: El Ecosistema Detrás del Asistente Inteligente"  
- Secciones/etiquetas grandes:
  - "Orquestador AYUDASCP-IA"
  - "Microservicio AZURE"
  - "IA con Base de Conocimiento (RAG)"
  - "Persistencia en MSSQL"
  - "El Ciclo de Vida del Chat"
  - "Autenticación vía JWT"
  - "Respuesta Fluida (Streaming)"
  - "Reglas de Gestión de Estado"
- Componentes y textos relacionados con IA y almacenamiento:
  - "OpenAI"
  - "Vector Storage"
  - "Respuestas precisas"
  - "Archivos de soporte"
- Elementos de persistencia / conversaciones:
  - "CONVERSACIONES" (y subítems: "REGISTRO NÚCLEO DEL INTERCAMBIO", "TOKENS CONSUMIDOS", "HILOS DE IA")
  - "MENSAJESCALIFICADOS" (y subítem: "RETROALIMENTACIÓN DEL USUARIO (ÚTIL/NO ÚTIL)")
  - "TIQUETES" (y subítem: "VINCULACIÓN ÚNICA ENTRE CONVERSACIÓN Y CASO DE SOPORTE EXTERNO")
- Otros textos breves visibles:
  - "LÓGICA DE AUTENTICACIÓN"
  - "PERSISTENCIA"
  - "LLAMADAS A LA IA"
  - "VALIDAR" / "CREDENTIAL VÍA JWT"
- Íconos y gráficos claramente reconocibles:
  - Logo de OpenAI
  - Cerebro/neón (representando la IA)
  - Capas apiladas que representan persistencia/stack de datos
  - Ticket, pulgares arriba/abajo, monedas/contador de tokens

Si quieres, puedo transcribir con detalle alguna sección concreta (por ejemplo la columna de "Persistencia en MSSQL" o el panel de "Autenticación vía JWT") o hacer zoom y leer todo el texto pequeño de una zona específica. ¿Qué parte te interesa más?

#### detail=`medium` · reasoning=`high` · rank **8** · conv `1994`

Puedo leer con claridad muchos de los títulos y elementos. Resumo lo más visible:

Títulos/encabezados principales
- PatyIA: El Ecosistema Detrás del Asistente Inteligente
- Orquestador AYUDASCP-IA
- IA con Base de Conocimiento (RAG)
- Persistencia en MSSQL
- El Ciclo de Vida del Chat
- Respuesta Fluida (Streaming)
- Reglas de Gestión de Estado
- Autenticación vía JWT

Textos / etiquetas y subtítulos legibles
- MICROSERVICIO AZURE
- LÓGICA DE AUTENTICACIÓN
- PERSISTENCIA
- LLAMADAS A LA IA
- OPENAI
- VECTOR STORAGE
- RESPUESTAS PRECISAS
- ARCHIVOS DE SOPORTE
- CONVERSACIONES
  - REGISTRO NÚCLEO DEL INTERCAMBIO
  - TOKENS CONSUMIDOS
  - HILOS DE IA
- MENSAJES CALIFICADOS (retroalimentación)
  - RETROALIMENTACIÓN DEL USUARIO (ÚTIL/NO ÚTIL)
- TIQUETES
  - VINCULACIÓN ÚNICA ENTRE CONVERSACIÓN Y CASO DE SOPORTE EXTERNO
- CIERRE AUTOMÁTICO TRAS 4 HORAS DE INACTIVIDAD
- BORRADO LÓGICO / ocultar chats (aparece un texto similar; puede haber una pequeña variante/typo)

Iconos y elementos gráficos notables
- Logo/figura geométrica neón a la izquierda (orquestador)
- Icono de cerebro/neón (microservicio IA)
- Escudo con check (autenticación)
- Pila/stack (persistencia)
- Átomo/partícula (llamadas a la IA)
- Logo de OpenAI (símbolo en espiral)
- Cilindro de base de datos / capas apiladas (vector storage / persistencia)
- Íconos: monedas (tokens), globos de chat, pulgar arriba/pulgar abajo, ticket, reloj + engranajes
- Bordes decorativos con crayones en las esquinas

Si quieres, puedo recortar y ampliar alguna zona específica para leer los textos pequeños o confirmar palabras que están algo borrosas (p. ej. nombres muy pequeños o posibles typos). ¿Qué área te interesa más?

#### detail=`high` · reasoning=`low` · rank **3** · conv `1995`

Puedo leer varios títulos y elementos con bastante claridad. Los más destacados son:

- Título principal: "PatyIA: El Ecosistema Detrás del Asistente Inteligente"
- Sección/etiqueta: "Orquestador AYUDASCP-IA"
- Iconos y texto junto al flujo: "MICROSERVICIO AZURE" (icono de cerebro/neón)
- Sección: "IA con Base de Conocimiento (RAG)"
  - "OPENAI"
  - "VECTOR STORAGE"
  - "RESPUESTAS PRECISAS"
  - "ARCHIVOS DE SOPORTE"
- Sección derecha: "Persistencia en MSSQL"
  - Subtítulos: "CONVERSACIONES", "MENSAJESCALIFICADOS", "TIQUETES"
  - Bullets legibles como "REGISTRO NÚCLEO DEL INTERCAMBIO", "TOKENS CONSUMIDOS", "HILOS DE IA", "RETROALIMENTACIÓN DEL USUARIO (ÚTIL/NO ÚTIL)", "VINCULACIÓN ÚNICA ENTRE CONVERSACIÓN Y CASO DE SOPORTE EXTERNO"
- Sección inferior izquierda: "Autenticación vía JWT" y "CREDENTIAL VIA JWT" (íconos de validación)
- Centro inferior: "Respuesta Fluida (Streaming)" y "IA RESPUESTA" (logo de OpenAI)
- Sección: "Reglas de Gestión de Estado" (iconos de reloj y engranajes, sobre cierre automático y borrado lógico)
- Elementos gráficos claros: iconos de crayones en los bordes, pila de capas/archivos a la derecha, escudo de autenticación, bases de datos apiladas y billetes/monedas junto a tokens.

Si quieres, puedo transcribir con más detalle alguna sección concreta de la imagen.

#### detail=`high` · reasoning=`medium` · rank **6** · conv `1996`

Veo con claridad varios títulos, etiquetas y elementos gráficos principales. Entre ellos:

- Título grande: "PatyIA: El Ecosistema Detrás del Asistente Inteligente".
- Sección/etiqueta: "Orquestador AYUDASCP-IA".
- Iconos y texto junto a ellos: cerebro/neón con "MICROSERVICIO AZURE", escudo con "LÓGICA DE AUTENTICACIÓN", pila con "PERSISTENCIA", icono de IA con "LLAMADAS A LA IA".
- Bloque: "IA con Base de Conocimiento (RAG)" con logo de OpenAI, "VECTOR STORAGE", "RESPUESTAS PRECISAS" y "ARCHIVOS DE SOPORTE".
- Columna derecha: "Persistencia en MSSQL" y subelementos: "CONVERSACIONES" (con ítems: "REGISTRO NÚCLEO DEL INTERCAMBIO", "TOKENS CONSUMIDOS", "HILOS DE IA"), "MENSAJES CALIFICADOS" ("RETROALIMENTACIÓN DEL USUARIO (ÚTIL/NO ÚTIL)"), y "TIQUETES" ("VINCULACIÓN ÚNICA ENTRE CONVERSACIÓN Y CASO DE SOPORTE EXTERNO").
- Sección central/inferior: "El Ciclo de Vida del Chat".
- Subtítulos: "Autenticación vía JWT" (con iconos de credenciales y "VALIDAR"), "Respuesta Fluida (Streaming)" (mención a transmisión en tiempo real), "Reglas de Gestión de Estado" (con textos como "CIERRE AUTOMÁTICO TRAS 4 HORAS DE INACTIVIDAD" y "BORRADO LÓGICO PARA OCULTAR CHATS").
- Otros elementos gráficos claros: iconos de crayones a los lados, capas apiladas representando almacenamiento/conversaciones, pulgar arriba/pulgar abajo, ticket.

Si quieres, puedo hacer una transcripción más detallada de una zona concreta de la imagen.

#### detail=`high` · reasoning=`high` · rank **7** · conv `1997`

Puedo leer con claridad los títulos y etiquetas principales. Entre los elementos/textos más legibles están:

- Título: "PatyIA: El Ecosistema Detrás del Asistente Inteligente" (parte superior).
- "Orquestador AYUDASCP-IA" (zona superior izquierda).
- "MICROSERVICIO AZURE" (junto al icono del cerebro).
- Etiquetas junto al microservicio: "LÓGICA DE AUTENTICACIÓN", "PERSISTENCIA", "LLAMADAS A LA IA".
- Sección: "IA con Base de Conocimiento (RAG)".
- Logos/texto asociados: "OPENAI", "VECTOR STORAGE", "RESPUESTAS PRECISAS", "ARCHIVOS DE SOPORTE".
- Sección derecha: "Persistencia en MSSQL".
  - Subtítulos: "CONVERSACIONES", "MENSAJES CALIFICADOS", "TIQUETES".
  - Ítems bajo Conversaciones: "REGISTRO NÚCLEO DEL INTERCAMBIO", "TOKENS CONSUMIDOS", "HILOS DE IA".
  - Bajo Mensajes Calificados: "RETROALIMENTACIÓN DEL USUARIO (ÚTIL/NO ÚTIL)".
  - Bajo Tiquetes: "VINCULACIÓN ÚNICA ENTRE CONVERSACIÓN Y CASO DE SOPORTE EXTERNO".
- "El Ciclo de Vida del Chat" (sección central-inferior).
- "Autenticación vía JWT" (subsección).
- "Respuesta Fluida (Streaming)" (subsección).
- "Reglas de Gestión de Estado" con textos legibles como "CIERRE AUTOMÁTICO TRAS 4 HORAS DE INACTIVIDAD" y "BORRADO LÓGICO PARA OCULTAR CHATS".
- Marca/creditos: "NotebookLM" (esquina inferior derecha).

Si quieres, puedo enfocar (hacer zoom mental) en una zona concreta y transcribir con más detalle el texto que aparece allí.

---

## Estrategia: `data_url` — data_url — siempre inline

**Qué hace:**

- **Nunca** sube a Files API: la imagen viaja en el JSON del turno como **data URL**.
- Útil para medir latencia/costo sin round-trip de upload.
- Riesgo: payloads muy grandes o rechazo por tamaño en el request.
- `vision_detail` se aplica en cada `input_image` (`low` / `auto` / `high`).

**Parámetros body:** `vision_strategy: "data_url"`, `vision_detail: low|medium|high`, `reasoning_effort: low|medium|high`.

**Mapeo detail → API:** `low→low`, `medium→auto`, `high→high` (Fuerza `image_url` (data URL) aunque pese más del umbral.).

### Tablas por reasoning (`reasoning_effort`)

Cada tabla agrupa las filas por **detail level** con `reasoning_effort` fijo.

#### Reasoning **low**

| Detail level | API `detail` | Respuesta (extracto) | ms | Calif. | Rank | conv |
|---|---|---|---:|---:|---:|---:|
| **low** | low | Veo varios títulos y elementos claramente legibles. Los más destacados son: - Título principal: "PatyIA: El Ecosistema Detrás del Asistente Inteligente" - Secci… | 11023 | — | 2 | 1998 |
| **medium** | auto | Puedo leer con claridad varios títulos, etiquetas y elementos gráficos. Entre los textos/elementos más destacados veo: - Encabezado principal: "PatyIA: El Ecosi… | 10792 | — | 1 | 2001 |
| **high** | high | Puedo leer varios títulos y etiquetas con bastante claridad. Los principales elementos/textos que identifico son: - Título principal: "PatyIA: El Ecosistema Det… | 11813 | — | 3 | 2004 |

#### Reasoning **medium**

| Detail level | API `detail` | Respuesta (extracto) | ms | Calif. | Rank | conv |
|---|---|---|---:|---:|---:|---:|
| **low** | low | Veo con claridad varios títulos, secciones y etiquetas del infográfico. Entre los más legibles: - Título principal: "PatyIA: El Ecosistema Detrás del Asistente … | 12516 | — | 4 | 1999 |
| **medium** | auto | Estos son los elementos y textos que identifico con más claridad en la imagen: - Título principal: "PatyIA: El Ecosistema Detrás del Asistente Inteligente". - S… | 16061 | — | 5 | 2002 |
| **high** | high | Puedo leer con claridad varios títulos, etiquetas y elementos visuales. Lo más claro que identifico: - Título principal: "PatyIA: El Ecosistema Detrás del Asist… | 16428 | — | 6 | 2005 |

#### Reasoning **high**

| Detail level | API `detail` | Respuesta (extracto) | ms | Calif. | Rank | conv |
|---|---|---|---:|---:|---:|---:|
| **low** | low | Puedo leer con claridad varios títulos y etiquetas principales. Entre los más legibles están: - Encabezado: "PatyIA: El Ecosistema Detrás del Asistente Intelige… | 42063 | — | 8 | 2000 |
| **medium** | auto | Puedo leer con claridad los siguientes textos y elementos principales de la imagen: - Título: "PatyIA: El Ecosistema Detrás del Asistente Inteligente" - Sección… | 41241 | — | 7 | 2003 |
| **high** | high | Puedo leer con bastante claridad varios títulos, secciones y etiquetas. Los más destacables son: Títulos principales - "PatyIA: El Ecosistema Detrás del Asisten… | 56740 | — | 9 | 2006 |


### Matriz de criterios — dominio estrategia (rank 1…9, único)

Cada columna **C1…C5** usa índices **1…9** sin repetir (1 = peor en ese criterio dentro de la estrategia). **CT** = Σ(C1…C5) e índice resumen **(1…9)**.

| Rank | Detail | Reasoning | ms | conv | C1 | C2 | C3 | C4 | C5 | CT | Calif. |
|---:|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **1** | medium | low | 10792 | 2001 | 2 | 1 | 2 | 3 | 2 | 10 (2) | — |
| **2** | low | low | 11023 | 1998 | 4 | 3 | 4 | 1 | 3 | 15 (3) | — |
| **3** | high | low | 11813 | 2004 | 1 | 4 | 1 | 2 | 1 | 9 (1) | — |
| **4** | low | medium | 12516 | 1999 | 8 | 8 | 8 | 8 | 8 | 40 (8) | — |
| **5** | medium | medium | 16061 | 2002 | 3 | 2 | 3 | 4 | 5 | 17 (4) | — |
| **6** | high | medium | 16428 | 2005 | 6 | 6 | 6 | 6 | 6 | 30 (6) | — |
| **7** | medium | high | 41241 | 2003 | 5 | 5 | 5 | 5 | 4 | 24 (5) | — |
| **8** | low | high | 42063 | 2000 | 9 | 9 | 9 | 9 | 9 | 45 (9) | — |
| **9** | high | high | 56740 | 2006 | 7 | 7 | 7 | 7 | 7 | 35 (7) | — |

### Detalle textual por celda

#### detail=`low` · reasoning=`low` · rank **2** · conv `1998`

Veo varios títulos y elementos claramente legibles. Los más destacados son:

- Título principal: "PatyIA: El Ecosistema Detrás del Asistente Inteligente"
- Sección/Elemento: "Orquestador AYUDASCP-IA"
- Iconos y etiquetas alrededor: "Microservicio Azure"
- Sección: "IA con Base de Conocimiento (RAG)"
  - "OPENAI"
  - "VECTOR STORAGE"
  - "RESPUESTAS PRECISAS"
  - "ARCHIVOS DE SOPORTE"
- Sección: "Persistencia en MSSQL"
  - Subtítulos: "CONVERSACIONES", "MENSAJES CALIFICADOS", "TIQUETES"
  - Ítems bajo CONVERSACIONES: "REGISTRO NÚCLEO DEL INTERCAMBIO", "TOKENS CONSUMIDOS", "HILOS DE IA"
  - Ítem bajo MENSAJES CALIFICADOS: "RETROALIMENTACIÓN DEL USUARIO (ÚTIL/NO ÚTIL)"
  - Ítem bajo TIQUETES: "VINCULACIÓN ÚNICA ENTRE CONVERSACIÓN Y CASO DE SOPORTE EXTERNO"
- Otras secciones visibles más abajo: "Autenticación vía JWT", "Respuesta Fluida (Streaming)", "Reglas de Gestión de Estado"

También se aprecian iconos gráficos (cerebro, escudo, bases de datos, apilamientos de documentos/tarjetas, crayones de colores) que refuerzan esos conceptos.

#### detail=`low` · reasoning=`medium` · rank **4** · conv `1999`

Veo con claridad varios títulos, secciones y etiquetas del infográfico. Entre los más legibles:

- Título principal: "PatyIA: El Ecosistema Detrás del Asistente Inteligente"
- Sección: "Orquestador AYUDASCP-IA"
  - "Microservicio Azure"
  - Iconos y etiquetas: "Lógica de Autenticación", "Persistencia", "Llamadas a la IA"
- Sección: "IA con Base de Conocimiento (RAG)"
  - "OpenAI"
  - "Vector Storage"
  - "Respuestas precisas"
  - "Archivos de soporte"
- Sección derecha: "Persistencia en MSSQL"
  - Subtítulos: "CONVERSACIONES" (con bullets: "Registro núcleo del intercambio", "Tokens consumidos", "Hilos de IA")
  - "MENSAJES CALIFICADOS" ("Retroalimentación del usuario (útil/no útil)")
  - "TIQUETES" ("Vinculación única entre conversación y caso de soporte externo")
- Parte central/inferior: "El Ciclo de Vida del Chat"
  - "Autenticación vía JWT" (con "Credential vía JWT" y checks de validar)
  - "Respuesta Fluida (Streaming)"
  - "Reglas de Gestión de Estado" (con "Cierre automático tras 4 horas de inactividad" y "Borrado lógico para ocultar chats")
- Iconografía visible: cerebro/neón, logo de OpenAI, pilas/stack de archivos, base de datos, escudo de autenticación, ticket, pulgares arriba/abajo, crayons decorativos.

Si quieres, puedo transcribir más texto con mayor detalle u obtener el contenido de otra región de la imagen. ¿Qué necesitas exactamente?

#### detail=`low` · reasoning=`high` · rank **8** · conv `2000`

Puedo leer con claridad varios títulos y etiquetas principales. Entre los más legibles están:

- Encabezado: "PatyIA: El Ecosistema Detrás del Asistente Inteligente"
- "Orquestador AYUDASCP-IA"
- Icono/etiqueta central: "MICROSERVICIO AZURE"
- Etiquetas a la derecha del microservicio: "LÓGICA DE AUTENTICACIÓN", "PERSISTENCIA", "LLAMADAS A LA IA"
- Sección: "IA con Base de Conocimiento (RAG)"  
  - "OPENAI"  
  - "VECTOR STORAGE"  
  - "RESPUESTAS PRECISAS"  
  - "ARCHIVOS DE SOPORTE"
- Sección: "PERSISTENCIA EN MSSQL" con subapartados:
  - "CONVERSACIONES" — "REGISTRO NÚCLEO DEL INTERCAMBIO", "TOKENS CONSUMIDOS", "HILOS DE IA"
  - "MENSAJES CALIFICADOS" — "RETROALIMENTACIÓN DEL USUARIO (ÚTIL/NO ÚTIL)"
  - "TIQUETES" — "VINCULACIÓN ÚNICA ENTRE CONVERSACIÓN Y CASO DE SOPORTE EXTERNO"
- Título de otra área: "El Ciclo de Vida del Chat"
  - "AUTENTICACIÓN VÍA JWT" (y "CREDENTIAL VÍA JWT" / "VALIDAR")
  - "RESPUESTA FLUIDA (STREAMING)" y el texto explicativo: "La respuesta de la IA se transmite en tiempo real al frontend para mejorar la experiencia"
  - "REGLAS DE GESTIÓN DE ESTADO" — "CIERRE AUTOMÁTICO TRAS 4 HORAS DE INACTIVIDAD", "BORRADO LÓGICO PARA OCULTAR CHATS"
- Marca/huella: "NotebookLM" (esquina inferior derecha)

También se aprecian varios íconos prominentes: logo tipo estrella/neón, cerebro (IA), logo de OpenAI, cilindro de almacenamiento (vector storage), pilas de documentos, pulgares arriba/abajo y un ícono de ticket.

¿Quieres que transcriba todo el texto del cartel con más detalle o que amplíe alguna sección en particular?

#### detail=`medium` · reasoning=`low` · rank **1** · conv `2001`

Puedo leer con claridad varios títulos, etiquetas y elementos gráficos. Entre los textos/elementos más destacados veo:

- Encabezado principal: "PatyIA: El Ecosistema Detrás del Asistente Inteligente"
- Sección/etiqueta: "Orquestador AYUDASCP-IA"
- Icono y texto: "MICROSERVICIO AZURE" (con un icono de cerebro)
- Bloque: "IA con Base de Conocimiento (RAG)"
  - "OPENAI" (logo de OpenAI)
  - "VECTOR STORAGE"
  - "RESPUESTAS PRECISAS"
  - "ARCHIVOS DE SOPORTE"
- Sección derecha: "Persistencia en MSSQL"
  - Subtítulos: "CONVERSACIONES", "MENSAJES CALIFICADOS", "TIQUETES"
  - Ítems bajo conversaciones: "REGISTRO NÚCLEO DEL INTERCAMBIO", "TOKENS CONSUMIDOS", "HILOS DE IA"
  - Ítem bajo mensajes calificados: "RETROALIMENTACIÓN DEL USUARIO (ÚTIL/NO ÚTIL)"
  - Ítem bajo tiquetes: "VINCULACIÓN ÚNICA ENTRE CONVERSACIÓN Y CASO DE SOPORTE EXTERNO"
- Parte inferior central: "El Ciclo de Vida del Chat"
  - "Autenticación vía JWT"
  - "Respuesta Fluida (Streaming)"
  - "Reglas de Gestión de Estado"
- Varios íconos gráficos claramente visibles: logo de OpenAI, pila de bases/archivos apilados, ticket, pulgares (sí/no), crayones/colores en los bordes.

Si quieres, puedo transcribir más texto de áreas específicas si me indicas qué parte te interesa.

#### detail=`medium` · reasoning=`medium` · rank **5** · conv `2002`

Estos son los elementos y textos que identifico con más claridad en la imagen:

- Título principal: "PatyIA: El Ecosistema Detrás del Asistente Inteligente".  
- Sección superior izquierda: "Orquestador AYUDASCP-IA" y el ícono/neón de un microservicio con etiqueta "MICROSERVICIO AZURE".  
- Bloque central: "IA con Base de Conocimiento (RAG)". Textos asociados: "OPENAI", "VECTOR STORAGE", "RESPUESTAS PRECISAS", "ARCHIVOS DE SOPORTE".  
- Lado derecho (persistencia): "Persistencia en MSSQL" y encabezados de subcomponentes: "CONVERSACIONES", "MENSAJES CALIFICADOS", "TIQUETES". Subitems legibles: "REGISTRO NÚCLEO DEL INTERCAMBIO", "TOKENS CONSUMIDOS", "HILOS DE IA"; "RETROALIMENTACIÓN DEL USUARIO (ÚTIL/NO ÚTIL)"; "VINCULACIÓN ÚNICA ENTRE CONVERSACIÓN Y CASO DE SOPORTE EXTERNO".  
- Sección media-inferior: "El Ciclo de Vida del Chat" y cajas con títulos: "Autenticación vía JWT", "Respuesta Fluida (Streaming)", "Reglas de Gestión de Estado". Textos visibles dentro: "VALIDAR", "CREDENTIAL/VÍA JWT" (parte de credencial), "INTERACCIÓN CON API", "IA RESPUESTA", "CIERRE AUTOMÁTICO TRAS 4 HORAS DE INACTIVIDAD" y texto similar a "BORRADO LÓGICO PARA OCULTAR CHATS" (este último puede estar algo borroso).  
- Íconos claramente visibles: logo de OpenAI, cerebro/neón, pila de documentos/archivos apilados, escudo de autenticación, crayon/coloridos en los bordes.

Si quieres, puedo ampliar y transcribir con más detalle alguna zona concreta de la imagen. ¿Qué parte te interesa más?

#### detail=`medium` · reasoning=`high` · rank **7** · conv `2003`

Puedo leer con claridad los siguientes textos y elementos principales de la imagen:

- Título: "PatyIA: El Ecosistema Detrás del Asistente Inteligente"
- Sección/etiquetas del orquestador: "Orquestador AYUDASCP-IA"
- Microservicio: "Microservicio Azure"
- Etiquetas junto al microservicio: "LÓGICA DE AUTENTICACIÓN", "PERSISTENCIA", "LLAMADAS A LA IA"
- Bloque RAG: "IA con Base de Conocimiento (RAG)"
  - "OPENAI"
  - "VECTOR STORAGE"
  - "RESPUESTAS PRECISAS"
  - "ARCHIVOS DE SOPORTE"
- Bloque de persistencia: "Persistencia en MSSQL"
  - "CONVERSACIONES" (subpuntos: "REGISTRO NÚCLEO DEL INTERCAMBIO", "TOKENS CONSUMIDOS", "HILOS DE IA")
  - "MENSAJES CALIFICADOS" (subpunto: "RETROALIMENTACIÓN DEL USUARIO (ÚTIL/NO ÚTIL)")
  - "TIQUETES" (subpunto: "VINCULACIÓN ÚNICA ENTRE CONVERSACIÓN Y CASO DE SOPORTE EXTERNO")
- Encabezado: "El Ciclo de Vida del Chat"
  - "Autenticación vía JWT" (aparecen iconos y la palabra "VALIDAR" y referencia a "CREDENTIAL VÍA JWT")
  - "Respuesta Fluida (Streaming)" (texto explicativo: "La respuesta de la IA se transmite en tiempo real al frontend para mejorar la experiencia")
  - "Reglas de Gestión de Estado" (subpuntos legibles: "CIERRE AUTOMÁTICO TRAS 4 HORAS DE INACTIVIDAD", "BORRADO LÓGICO PARA OCULTAR CHATS")

Elementos gráficos muy visibles: logo de OpenAI, icono de cerebro, pila/stack de capas, icono de ticket, emoticonos de pulgar arriba/pulgar abajo, monedas/ícono de tokens, lápices/colores a los lados y la marca "NotebookLM" en la esquina.

Si quieres, puedo hacer una transcripción más detallada de alguna sección concreta o extraer todo el texto con OCR. ¿Qué parte te interesa más?

#### detail=`high` · reasoning=`low` · rank **3** · conv `2004`

Puedo leer varios títulos y etiquetas con bastante claridad. Los principales elementos/textos que identifico son:

- Título principal: "PatyIA: El Ecosistema Detrás del Asistente Inteligente"
- Sección superior izquierda: "Orquestador AYUDASCP-IA"
- Iconos/etiquetas asociadas al microservicio: "Microservicio Azure", "Lógica de Autenticación", "Persistencia", "Llamadas a la IA"
- Bloque RAG: "IA con Base de Conocimiento (RAG)", "OpenAI", "Vector Storage", "Respuestas PrecisAS", "Archivos de Soporte"
- Persistencia (lado derecho): "Persistencia en MSSQL"
  - Subitems bajo "CONVERSACIONES": "Registro núcleo del intercambio", "Tokens consumidos", "Hilos de IA"
  - Bajo "MENSAJES CALIFICADOS": "Retroalimentación del usuario (útil/no útil)"
  - Bajo "TIQUETES": "Vinculación única entre conversación y caso de soporte externo"
- Sección del ciclo de vida: "Autenticación vía JWT", "Respuesta Fluida (Streaming)", "Reglas de Gestión de Estado" (estos títulos se aprecian en la parte inferior de la imagen)
- Otros textos pequeños legibles: "Credential vía JWT", "Interacción con API", "IA Respuesta"

También hay muchos elementos gráficos claros: íconos estilo neón, pila de capas/archivos ilustrando persistencia, logotipo de OpenAI, crayones de colores en los bordes.

Si quieres, puedo transcribir con más detalle alguna sección concreta de la imagen.

#### detail=`high` · reasoning=`medium` · rank **6** · conv `2005`

Puedo leer con claridad varios títulos, etiquetas y elementos visuales. Lo más claro que identifico:

- Título principal: "PatyIA: El Ecosistema Detrás del Asistente Inteligente"
- Sección/elementos del orquestador:
  - "Orquestador AYUDASCP-IA"
  - Íconos: figura tipo gema/estrella, ícono de cerebro (microservicio)
  - Texto alrededor: "Microservicio Azure", "Llamadas a la IA", "Persistencia", "Lógica de autenticación"
- IA / RAG:
  - Título: "IA con Base de Conocimiento (RAG)"
  - Texto/elementos: "OpenAI", "Vector Storage", "Respuestas precisas", "Archivos de soporte"
- Persistencia (lado derecho):
  - Título: "Persistencia en MSSQL"
  - Subtítulos: "CONVERSACIONES", "MENSAJES CALIFICADOS", "TIQUETES"
  - Ítems: "Registro núcleo del intercambio", "Tokens consumidos", "Hilos de IA"; "Retroalimentación del usuario (útil/no útil)"; "Vinculación única entre conversación y caso de soporte externo"
  - Iconos: apilado de capas/archivos, tokens/monedas, pulgares arriba/abajo, ticket
- Ciclo de vida / flujo del chat (parte inferior visible):
  - "El Ciclo de Vida del Chat"
  - "Autenticación vía JWT", "Credencial vía JWT", "Validar"
  - "Interacción con API", "IA Respuesta", "Respuesta Fluida (Streaming)"
  - "Reglas de Gestión de Estado" y textos asociados (por ejemplo: cierre automático tras 4 horas de inactividad)
- Otros elementos visibles:
  - Icono y palabra "OpenAI"
  - Crayones de colores en los bordes y marca "NotebookLM" en la esquina inferior derecha

Si quieres, puedo ampliar o recortar una zona concreta para leer texto más pequeño con más detalle.

#### detail=`high` · reasoning=`high` · rank **9** · conv `2006`

Puedo leer con bastante claridad varios títulos, secciones y etiquetas. Los más destacables son:

Títulos principales
- "PatyIA: El Ecosistema Detrás del Asistente Inteligente"
- "Persistencia en MSSQL"
- "IA con Base de Conocimiento (RAG)"
- "El Ciclo de Vida del Chat"

Sección Orquestador / Microservicio
- "Orquestador AYUDASCP-IA"
- "MICROSERVICIO AZURE"
- "LÓGICA DE AUTENTICACIÓN"
- "PERSISTENCIA"
- "LLAMADAS A LA IA"

RAG / Knowledge
- "OPENAI"
- "VECTOR STORAGE"
- "RESPUESTAS PRECISAS"
- "ARCHIVOS DE SOPORTE"

Persistencia (capas a la derecha)
- "CONVERSACIONES" (subítems: "REGISTRO NÚCLEO DEL INTERCAMBIO", "TOKENS CONSUMIDOS", "HILOS DE IA")
- "MENSAJES CALIFICADOS" (subítem: "RETROALIMENTACIÓN DEL USUARIO (ÚTIL/NO ÚTIL)")
- "TIQUETES" (subítem: "VINCULACIÓN ÚNICA ENTRE CONVERSACIÓN Y CASO DE SOPORTE EXTERNO")

Ciclo de vida del chat (parte inferior)
- "Autenticación vía JWT" (incluye "CREDENCIAL VÍA JWT", "VALIDAR")
- "Respuesta Fluida (Streaming)" (y el texto explicativo: "La respuesta de la IA se transmite en tiempo real al frontend para mejorar la experiencia")
- "Reglas de Gestión de Estado" (incluye "CIERRE AUTOMÁTICO TRAS 4 HORAS DE INACTIVIDAD" y texto relacionado con "borrado lógico" para ocultar chats)

Otros elementos visibles
- Iconos: logo de OpenAI, icono de cerebro / microservicio Azure, shield, pila de datos (vector storage), tickets, emojis de pulgar y chat.
- Marca / watermark: "NotebookLM" en la esquina inferior derecha.

¿Quieres que transcriba texto adicional o que haga un recorte de alguna zona concreta para leerlo con más detalle?

---

## Estrategia: `file_upload` — file_upload — siempre Files API

**Qué hace:**

- **Siempre** normaliza, sube con `openai.files.create({ purpose: "vision" })` y referencia **`file_id`**.
- Payload del turno más liviano; añade latencia del upload.
- Recomendado cuando la imagen supera de forma estable el umbral de inline.
- `vision_detail` se aplica igual sobre el `input_image` con `file_id`.

**Parámetros body:** `vision_strategy: "file_upload"`, `vision_detail: low|medium|high`, `reasoning_effort: low|medium|high`.

**Mapeo detail → API:** `low→low`, `medium→auto`, `high→high` (Siempre `file_id` tras upload vision, independiente del tamaño.).

### Tablas por reasoning (`reasoning_effort`)

Cada tabla agrupa las filas por **detail level** con `reasoning_effort` fijo.

#### Reasoning **low**

| Detail level | API `detail` | Respuesta (extracto) | ms | Calif. | Rank | conv |
|---|---|---|---:|---:|---:|---:|
| **low** | low | Veo con claridad varios textos y elementos principales. Entre los textos más legibles están: - Título: "PatyIA: El Ecosistema Detrás del Asistente Inteligente" … | 12932 | — | 2 | 2007 |
| **medium** | auto | Puedo leer con claridad varios títulos, secciones y etiquetas de la infografía. Los elementos/textos más legibles son: - Título principal: "PatyIA: El Ecosistem… | 14593 | — | 3 | 2010 |
| **high** | high | Estos son los elementos y textos que se leen con más claridad en la imagen: - Título principal: "PatyIA: El Ecosistema Detrás del Asistente Inteligente" - Secci… | 12426 | — | 1 | 2013 |

#### Reasoning **medium**

| Detail level | API `detail` | Respuesta (extracto) | ms | Calif. | Rank | conv |
|---|---|---|---:|---:|---:|---:|
| **low** | low | Puedo ver con claridad varios textos y elementos del diagrama. Los más destacados son: Textos / títulos - "PatyIA: El Ecosistema Detrás del Asistente Inteligent… | 16118 | — | 4 | 2008 |
| **medium** | auto | Puedo leer con claridad varios títulos y etiquetas principales de la imagen. Entre los elementos y textos más legibles están: - Título general: "PatyIA: El Ecos… | 22267 | — | 6 | 2011 |
| **high** | high | Veo con claridad varios títulos, secciones y algunos textos destacados. Los más evidentes son: - Título principal: "PatyIA: El Ecosistema Detrás del Asistente I… | 17901 | — | 5 | 2014 |

#### Reasoning **high**

| Detail level | API `detail` | Respuesta (extracto) | ms | Calif. | Rank | conv |
|---|---|---|---:|---:|---:|---:|
| **low** | low | Puedo leer con claridad varios títulos y elementos. Los principales son: - Título principal: "PatyIA: El Ecosistema Detrás del Asistente Inteligente" - Zona del… | 39167 | — | 8 | 2009 |
| **medium** | auto | Veo con más claridad los siguientes elementos y textos de la imagen (lista de los encabezados y bloques más legibles): - Título principal: "PatyIA: El Ecosistem… | 24771 | — | 7 | 2012 |
| **high** | high | Puedo leer con claridad los títulos y etiquetas principales. Lo que más se distingue en la imagen es: - Título principal: "PatyIA: El Ecosistema Detrás del Asis… | 43646 | — | 9 | 2015 |


### Matriz de criterios — dominio estrategia (rank 1…9, único)

Cada columna **C1…C5** usa índices **1…9** sin repetir (1 = peor en ese criterio dentro de la estrategia). **CT** = Σ(C1…C5) e índice resumen **(1…9)**.

| Rank | Detail | Reasoning | ms | conv | C1 | C2 | C3 | C4 | C5 | CT | Calif. |
|---:|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **1** | high | low | 12426 | 2013 | 4 | 4 | 4 | 5 | 5 | 22 (5) | — |
| **2** | low | low | 12932 | 2007 | 2 | 2 | 2 | 3 | 2 | 11 (2) | — |
| **3** | medium | low | 14593 | 2010 | 9 | 9 | 9 | 9 | 9 | 45 (9) | — |
| **4** | low | medium | 16118 | 2008 | 1 | 1 | 1 | 1 | 1 | 5 (1) | — |
| **5** | high | medium | 17901 | 2014 | 7 | 7 | 7 | 6 | 7 | 34 (7) | — |
| **6** | medium | medium | 22267 | 2011 | 3 | 3 | 3 | 4 | 3 | 16 (3) | — |
| **7** | medium | high | 24771 | 2012 | 6 | 6 | 6 | 7 | 6 | 31 (6) | — |
| **8** | low | high | 39167 | 2009 | 5 | 5 | 5 | 2 | 4 | 21 (4) | — |
| **9** | high | high | 43646 | 2015 | 8 | 8 | 8 | 8 | 8 | 40 (8) | — |

### Detalle textual por celda

#### detail=`low` · reasoning=`low` · rank **2** · conv `2007`

Veo con claridad varios textos y elementos principales. Entre los textos más legibles están:

- Título: "PatyIA: El Ecosistema Detrás del Asistente Inteligente"  
- Sección superior izquierda: "Orquestador AYUDASCP-IA" y "Microservicio Azure" (icono de cerebro)  
- Bloque RAG: "IA con Base de Conocimiento (RAG)", "OpenAI", "Vector Storage", "Respuestas Precisas", "Archivos de Soporte"  
- Sección derecha alta: "Persistencia en MSSQL" y los subtítulos "CONVERSACIONES", "MENSAJESCALIFICADOS" y "TIQUETES" con sus descripciones breves (por ejemplo "REGISTRO NÚCLEO DEL INTERCAMBIO", "TOKENS CONSUMIDOS", "RETROALIMENTACIÓN DEL USUARIO (ÚTIL/NO ÚTIL)", "VINCULACIÓN ÚNICA ENTRE CONVERSACIÓN Y CASO DE SOPORTE EXTERNO")  
- Ciclo de vida/otras secciones visibles: "Autenticación vía JWT", "Respuesta Fluida (Streaming)", "Reglas de Gestión de Estado"

Elementos gráficos claros: ícono de cerebro/neón, pilas de capas/archivos apilados (persistencia), escudo (autenticación), logo de OpenAI, iconos de tique/entrada, pulgar arriba/pulgar abajo, lápices/ceras de colores en los bordes.

Si quieres, puedo transcribir cualquiera de las etiquetas más pequeñas con más detalle o hacer un recorte y leer texto específico.

#### detail=`low` · reasoning=`medium` · rank **4** · conv `2008`

Puedo ver con claridad varios textos y elementos del diagrama. Los más destacados son:

Textos / títulos
- "PatyIA: El Ecosistema Detrás del Asistente Inteligente"
- "Orquestador AYUDASCP-IA"
- "Microservicio Azure"
- "IA con Base de Conocimiento (RAG)"
- "OpenAI"
- "Vector Storage"
- "Respuestas Precisas"
- "Archivos de Soporte"
- "Persistencia en MSSQL"
- "CONVERSACIONES" (y subtítulos: "Registro núcleo del intercambio", "Tokens consumidos", "Hilos de IA")
- "MENSAJESCALIFICADOS" (y subtítulo: "Retroalimentación del usuario (útil/no útil)")
- "TIQUETES" (y subtítulo: "Vinculación única entre conversación y caso de soporte externo")
- "El Ciclo de Vida del Chat"
- "Autenticación vía JWT"
- "Respuesta Fluida (Streaming)"
- "Reglas de Gestión de Estado"

Iconos y elementos gráficos
- Logo/neón en forma de estrella/póliedro a la izquierda.
- Ícono de un cerebro dentro de un marco (microservicio).
- Logo de OpenAI.
- Ilustración de pilas/stack que representa la persistencia (capas apiladas).
- Íconos de escudo, cubos (persistencia), y átomo (llamadas a la IA).
- Iconos de ticket, pulgar arriba/pulgar abajo para retroalimentación.
- Crayones de colores en las esquinas como decoración.

Si quieres, puedo extraer texto con OCR de áreas específicas o ampliar (hacer zoom) para leer fragmentos menos nítidos. ¿Qué parte te interesa que detalle más?

#### detail=`low` · reasoning=`high` · rank **8** · conv `2009`

Puedo leer con claridad varios títulos y elementos. Los principales son:

- Título principal: "PatyIA: El Ecosistema Detrás del Asistente Inteligente"
- Zona del orquestador:
  - "Orquestador AYUDASCP-IA"
  - "MICROSERVICIO AZURE"
  - "LÓGICA DE AUTENTICACIÓN"
  - "PERSISTENCIA"
  - "LLAMADAS A LA IA"
- Sección RAG / base de conocimiento:
  - "IA con Base de Conocimiento (RAG)"
  - "OPENAI" (logo)
  - "VECTOR STORAGE"
  - "RESPUESTAS PRECISAS"
  - "ARCHIVOS DE SOPORTE"
- Persistencia (lado derecho):
  - "Persistencia en MSSQL"
  - "CONVERSACIONES" con subítems: "REGISTRO NÚCLEO DEL INTERCAMBIO", "TOKENS CONSUMIDOS", "HILOS DE IA"
  - "MENSAJES CALIFICADOS" con "RETROALIMENTACIÓN DEL USUARIO (ÚTIL/NO ÚTIL)" (iconos de pulgar)
  - "TIQUETES" con "VINCULACIÓN ÚNICA ENTRE CONVERSACIÓN Y CASO DE SOPORTE EXTERNO" (icono de ticket)
- Ciclo de vida del chat (parte inferior central):
  - "El Ciclo de Vida del Chat"
  - "Autenticación vía JWT" / "CREDENCIAL VÍA JWT" / "VALIDAR"
  - "INTERACCIÓN CON API"
  - "IA RESPUESTA"
  - "Respuesta Fluida (Streaming)" y texto explicativo: "La respuesta de la IA se transmite en tiempo real al frontend para mejorar la experiencia"
  - "Reglas de Gestión de Estado" con: "CIERRE AUTOMÁTICO TRAS 4 HORAS DE INACTIVIDAD" y "BORRADO LÓGICO PARA OCULTAR CHATS"
- Otros elementos visuales: logo tipo estrella/neón en la esquina superior izquierda, crayones coloreados en los bordes, y la marca "NotebookLM" en la esquina inferior derecha.

¿Quieres que transcriba alguna sección completa con más detalle o haga un recorte de la imagen para leer texto pequeño?

#### detail=`medium` · reasoning=`low` · rank **3** · conv `2010`

Puedo leer con claridad varios títulos, secciones y etiquetas de la infografía. Los elementos/textos más legibles son:

- Título principal: "PatyIA: El Ecosistema Detrás del Asistente Inteligente"
- Sección/etiqueta: "Orquestador AYUDASCP-IA"
- Iconos y texto relacionados con arquitectura: "Microservicio AZURE"
- Bloque: "IA con Base de Conocimiento (RAG)"
  - "OPENAI" (logo de OpenAI)
  - "VECTOR STORAGE"
  - "RESPUESTAS PRECISAS"
  - "ARCHIVOS DE SOPORTE"
- Sección derecha: "Persistencia en MSSQL"
  - Subtítulos: "CONVERSACIONES", "MENSAJES CALIFICADOS", "TIQUETES"
  - Entradas bajo conversaciones: "REGISTRO NÚCLEO DEL INTERCAMBIO", "TOKENS CONSUMIDOS", "HILOS DE IA"
  - Bajo mensajes calificados: "RETROALIMENTACIÓN DEL USUARIO (ÚTIL/NO ÚTIL)"
  - Bajo tiquetes: "VINCULACIÓN ÚNICA ENTRE CONVERSACIÓN Y CASO DE SOPORTE EXTERNO"
- Parte inferior/medio: "El Ciclo de Vida del Chat" (y subsecciones visibles como "Autenticación vía JWT", "Respuesta Fluida (Streaming)", "Reglas de Gestión de Estado")
- Algunos textos de autenticación: "CREDENTIAL VIA JWT", "VALIDAR" (con iconos)
- Iconografía clara: cerebro, escudo, pila de bases de datos/archivos, el logo de OpenAI, tickets, pulgares (like/dislike), monedas/moneda para tokens, y crayones decorativos en los bordes.

Si quieres, puedo transcribir textualmente alguna sección en particular con más detalle.

#### detail=`medium` · reasoning=`medium` · rank **6** · conv `2011`

Puedo leer con claridad varios títulos y etiquetas principales de la imagen. Entre los elementos y textos más legibles están:

- Título general: "PatyIA: El Ecosistema Detrás del Asistente Inteligente"
- Sección/etiqueta: "Orquestador AYUDASCP-IA"
- Iconos y etiquetas del flujo: "Microservicio Azure" (con un icono de cerebro/neón)
- Componentes asociados: "Lógica de autenticación", "Persistencia", "Llamadas a la IA"
- Sección: "IA con Base de Conocimiento (RAG)"
  - "OpenAI" (logo)
  - "Vector Storage"
  - "Respuestas precisas"
  - "Archivos de soporte"
- Sección derecha: "Persistencia en MSSQL"
  - Subtítulos: "CONVERSACIONES" (con ítems: "Registro núcleo del intercambio", "Tokens consumidos", "Hilos de IA")
  - "MENSAJES CALIFICADOS" (con "Retroalimentación del usuario (útil/no útil)")
  - "TIQUETES" (con "Vinculación única entre conversación y caso de soporte externo")
- Parte inferior (ciclo de vida): "Autenticación vía JWT", "Respuesta Fluida (Streaming)", "Reglas de Gestión de Estado"
  - Texto legible: "VALIDAR", "CREDENCIAL VÍA JWT", "INTERACCIÓN CON API", "IA RESPUESTA"
  - "Cierre automático tras 4 horas de inactividad" y "Borrado lógico para ocultar chats" (en la sección de reglas)
- Elementos gráficos notables: íconos de lápices/crayones en los bordes, pilas de carpetas/archivos, iconos de pulgar arriba/abajo, ticket.

Si quieres, puedo hacer una transcripción más detallada de alguna área específica (zoom) o extraer todo el texto visible en la imagen. ¿Qué parte te interesa más?

#### detail=`medium` · reasoning=`high` · rank **7** · conv `2012`

Veo con más claridad los siguientes elementos y textos de la imagen (lista de los encabezados y bloques más legibles):

- Título principal: "PatyIA: El Ecosistema Detrás del Asistente Inteligente"
- Sección/encabezado: "Orquestador AYUDASCP-IA"
  - "Microservicio Azure" (icono de cerebro/neón)
  - "Lógica de autenticación"
  - "Persistencia"
  - "Llamadas a la IA"
- Sección: "IA con Base de Conocimiento (RAG)"
  - "OPENAI"
  - "VECTOR STORAGE"
  - "RESPUESTAS PRECISAS"
  - "ARCHIVOS DE SOPORTE"
- Bloque derecho: "Persistencia en MSSQL" con tres subbloques apilados
  - "CONVERSACIONES"
    - "Registro núcleo del intercambio"
    - "Tokens consumidos"
    - "Hilos de IA"
  - "MENSAJES CALIFICADOS"
    - "Retroalimentación del usuario (Útil/No útil)"
  - "TIQUETES"
    - "Vinculación única entre conversación y caso de soporte externo"
- Sección central-inferior: "El Ciclo de Vida del Chat"
  - "Autenticación vía JWT" (incluye iconos de credenciales y validación)
  - "Respuesta Fluida (Streaming)"
  - "Interacción con API"
  - "IA Respuesta"
  - "Reglas de Gestión de Estado"
    - "Cierre automático tras 4 horas de inactividad"
    - "Borrado lógico para ocultar chats"
- Marca / fuente en la esquina inferior derecha: "NotebookLM"

¿Quieres que haga una transcripción completa del texto de la imagen o un resumen más estructurado de cada bloque?

#### detail=`high` · reasoning=`low` · rank **1** · conv `2013`

Estos son los elementos y textos que se leen con más claridad en la imagen:

- Título principal: "PatyIA: El Ecosistema Detrás del Asistente Inteligente"  
- Sección/encabezado: "Orquestador AYUDASCP-IA"  
- Iconos y texto cerca del orquestador: "Microservicio Azure"  
- Elementos a la derecha: "Persistencia en MSSQL"  
- Subtítulos en la columna de la derecha:
  - "CONVERSACIONES" (con viñetas: "Registro núcleo del intercambio", "Tokens consumidos", "Hilos de IA")
  - "MENSAJES CALIFICADOS" (con "Retroalimentación del usuario (útil/no útil)")
  - "TIQUETES" (con "Vinculación única entre conversación y caso de soporte externo")
- Bloque central/izquierda: "IA con Base de Conocimiento (RAG)"  
  - Logos/textos asociados: "OpenAI", "Vector Storage", "Respuestas precisas", "Archivos de soporte"
- Sección inferior visible: "El Ciclo de Vida del Chat"  
  - Subtítulos: "Autenticación vía JWT", "Respuesta Fluida (Streaming)", "Reglas de Gestión de Estado"
- Otros textos e iconos legibles: "Validar", "Credencial vía JWT", "Interacción con API", "IA Respuesta"
- Marcas/pequeños créditos: "NotebookLM" en la esquina inferior derecha

Si quieres, puedo transcribir con más detalle alguna sección concreta de la imagen.

#### detail=`high` · reasoning=`medium` · rank **5** · conv `2014`

Veo con claridad varios títulos, secciones y algunos textos destacados. Los más evidentes son:

- Título principal: "PatyIA: El Ecosistema Detrás del Asistente Inteligente".
- Sección superior izquierda: "Orquestador AYUDASCP-IA".
- Iconos/elementos asociados: un símbolo geométrico estrellado, un icono de cerebro (microservicio) y flechas/conexiones.
- Textos junto al microservicio: "MICROSERVICIO AZURE", y alineados a la derecha: "LÓGICA DE AUTENTICACIÓN", "PERSISTENCIA", "LLAMADAS A LA IA".
- Sección central: "IA con Base de Conocimiento (RAG)".
  - Dentro: "OPENAI", "VECTOR STORAGE", "RESPUESTAS PRECISAS", "ARCHIVOS DE SOPORTE".
- Sección derecha superior: "Persistencia en MSSQL".
  - Subtítulos: "CONVERSACIONES" (con viñetas: "REGISTRO NÚCLEO DEL INTERCAMBIO", "TOKENS CONSUMIDOS", "HILOS DE IA"), "MENSAJES CALIFICADOS" ("RETROALIMENTACIÓN DEL USUARIO (ÚTIL/NO ÚTIL)"), "TIQUETES" ("VINCULACIÓN ÚNICA ENTRE CONVERSACIÓN Y CASO DE SOPORTE EXTERNO").
- Parte media/inferior: "El Ciclo de Vida del Chat".
  - Subtemas legibles: "Autenticación vía JWT" (y "CREDENTIAL VÍA JWT"), "Respuesta Fluida (Streaming)", "Interacción con API", "IA RESPUESTA".
- Otra sección: "Reglas de Gestión de Estado" con textos como "CIERRE AUTOMÁTICO TRAS 4 HORAS DE INACTIVIDAD" y "Borrado lógico para ocultar chats" (aparece como "BOBRADO LÓGICO" en la imagen).
- Elementos visuales claros: iconos de escudo, bases de datos apiladas, pilas de documentos, pulgares arriba/abajo, ticket, logo de OpenAI, crayones de colores en los márgenes y la marca "NotebookLM" en la esquina inferior derecha.

Si quieres, puedo transcribir con más detalle alguna zona concreta de la imagen. ¿Qué parte te interesa más?

#### detail=`high` · reasoning=`high` · rank **9** · conv `2015`

Puedo leer con claridad los títulos y etiquetas principales. Lo que más se distingue en la imagen es:

- Título principal: "PatyIA: El Ecosistema Detrás del Asistente Inteligente".
- Subtítulo/elemento superior: "Orquestador AYUDASCP-IA".
- Bloque del microservicio: "MICROSERVICIO AZURE" y a su lado las etiquetas "LÓGICA DE AUTENTICACIÓN", "PERSISTENCIA" y "LLAMADAS A LA IA".
- Sección RAG: "IA con Base de Conocimiento (RAG)" con los textos "OPENAI", "VECTOR STORAGE", "RESPUESTAS PRECISAS" y "ARCHIVOS DE SOPORTE".
- Columna de persistencia: "Persistencia en MSSQL" y subsecciones:
  - "CONVERSACIONES" (con bullets: "REGISTRO NÚCLEO DEL INTERCAMBIO", "TOKENS CONSUMIDOS", "HILOS DE IA")
  - "MENSAJES CALIFICADOS" (y "RETROALIMENTACIÓN DEL USUARIO (ÚTIL/NO ÚTIL)")
  - "TIQUETES" (y texto: "VINCULACIÓN ÚNICA ENTRE CONVERSACIÓN Y CASO DE SOPORTE EXTERNO")
- Encabezado de sección: "El Ciclo de Vida del Chat".
- Subsecciones visibles: "Autenticación vía JWT", "Respuesta Fluida (Streaming)", "Reglas de Gestión de Estado".
  - Textos legibles bajo estas: "CREDENCIAL VÍA JWT / VALIDAR", "INTERACCIÓN CON API", "IA RESPUESTA" y frases como "CIERRE AUTOMÁTICO TRAS 4 HORAS DE INACTIVIDAD" y "BORRADO LÓGICO PARA OCULTAR CHATS".
- Marca / watermark en la esquina: "NotebookLM".

También son muy visibles los iconos: estrella/rombo (logo), cerebro, logo de OpenAI, cilindro de base de datos, burbujas de chat, monedas, pulgares (útil/no útil), ticket, reloj y engranajes, sobre un fondo con crayones decorativos.

Si quieres, puedo transcribir con más detalle alguna sección concreta de la imagen. ¿Cuál te interesa?

---

# gpt-5-nano — piloto (matriz única)

**Fecha corrida:** 2026-06-09T13:52:09.622Z

**Modelo:** `gpt-5-nano` · **Imagen:** `notebooklm/unnamed.png`

**Objetivo:** validar si conviene repetir la batería completa con nano (sin reemplazar resultados de mini).

**Fecha evaluación juez:** 2026-06-09T14:16:11.375Z

**Total corridas:** 27

### Ranking global nano (matriz única, 1…27)

Índice **único** entre todos los tests del bloque (1 = peor → 27 = mejor). Cada **Cn** es índice único 1…27 en su columna. **CT** resume los C* (suma + índice 1…27).

| Rank global | Estrategia | Detail | Reasoning | ms | conv | C1 | C2 | C3 | C4 | C5 | CT | Calif. |
|---:|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **1** | `data_url` | medium | low | 5085 | 2032 | 25 | 27 | 25 | 24 | 25 | 126 (25) | — |
| **2** | `data_url` | high | low | 5622 | 2035 | 2 | 1 | 2 | 2 | 2 | 9 (1) | — |
| **3** | `auto` | high | low | 5809 | 2026 | 17 | 16 | 17 | 17 | 17 | 84 (17) | — |
| **4** | `data_url` | low | low | 6072 | 2029 | 9 | 8 | 9 | 9 | 7 | 42 (9) | — |
| **5** | `auto` | low | low | 6130 | 2018 | 6 | 5 | 6 | 6 | 4 | 27 (4) | — |
| **6** | `auto` | medium | low | 7002 | 2022 | 8 | 7 | 8 | 8 | 6 | 37 (8) | — |
| **7** | `file_upload` | medium | low | 7340 | 2041 | 5 | 4 | 5 | 5 | 15 | 34 (7) | — |
| **8** | `file_upload` | low | low | 8449 | 2038 | 19 | 18 | 19 | 19 | 19 | 94 (19) | — |
| **9** | `auto` | high | medium | 9355 | 2027 | 18 | 17 | 18 | 18 | 18 | 89 (18) | — |
| **10** | `data_url` | medium | medium | 9413 | 2033 | 27 | 26 | 27 | 27 | 27 | 134 (27) | — |
| **11** | `file_upload` | high | low | 9753 | 2044 | 21 | 20 | 21 | 21 | 21 | 104 (21) | — |
| **12** | `auto` | medium | medium | 11873 | 2023 | 1 | 21 | 1 | 1 | 1 | 25 (3) | — |
| **13** | `data_url` | low | medium | 12616 | 2030 | 10 | 9 | 10 | 10 | 8 | 47 (10) | — |
| **14** | `file_upload` | medium | medium | 13272 | 2042 | 15 | 14 | 15 | 15 | 13 | 72 (15) | — |
| **15** | `file_upload` | low | medium | 13752 | 2039 | 13 | 12 | 13 | 13 | 11 | 62 (13) | — |
| **16** | `file_upload` | high | medium | 13795 | 2045 | 3 | 2 | 3 | 3 | 3 | 14 (2) | — |
| **17** | `data_url` | high | medium | 14123 | 2036 | 12 | 11 | 12 | 12 | 10 | 57 (12) | — |
| **18** | `auto` | low | medium | 16125 | 2019 | 7 | 6 | 7 | 7 | 5 | 32 (6) | — |
| **19** | `auto` | high | high | 19835 | 2028 | 4 | 3 | 4 | 4 | 14 | 29 (5) | — |
| **20** | `data_url` | high | high | 22193 | 2037 | 24 | 24 | 24 | 26 | 24 | 122 (24) | — |
| **21** | `data_url` | low | high | 22734 | 2031 | 11 | 10 | 11 | 11 | 9 | 52 (11) | — |
| **22** | `file_upload` | high | high | 25185 | 2046 | 23 | 23 | 23 | 23 | 23 | 115 (23) | — |
| **23** | `file_upload` | medium | high | 27082 | 2043 | 20 | 19 | 20 | 20 | 20 | 99 (20) | — |
| **24** | `auto` | low | high | 27533 | 2021 | 26 | 25 | 26 | 25 | 26 | 128 (26) | — |
| **25** | `auto` | medium | high | 30779 | 2024 | 16 | 15 | 16 | 16 | 16 | 79 (16) | — |
| **26** | `file_upload` | low | high | 31497 | 2040 | 14 | 13 | 14 | 14 | 12 | 67 (14) | — |
| **27** | `data_url` | medium | high | 37430 | 2034 | 22 | 22 | 22 | 22 | 22 | 110 (22) | — |


### Resumen piloto nano

- Celdas con visión respondida: **27/27**
- Celdas con Calif. ≥ 8: **0/27**
- Mejor: rank **27** (data_url medium/high, Calif. null)
- Peor: rank **1** (data_url medium/low, Calif. null)

---

## Reproducir

```powershell
Set-Location "C:/Users/JAGUDELOE/Documents/Contapyme/ISA-DOC"
# Mini (27 corridas)
node scripts/test-vision-reasoning-matrix.mjs

# Solo rejudge C1…C5 sobre mini existente
node scripts/test-vision-reasoning-matrix.mjs --rejudge

# Piloto nano (27 corridas, conserva mini)
node scripts/test-vision-reasoning-matrix.mjs --nano
```

Requisito: PatyIA en `:7071` con `vision_detail`.
