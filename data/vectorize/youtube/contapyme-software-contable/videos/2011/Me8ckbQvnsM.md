---
schemaVersion: 2
videoId: Me8ckbQvnsM
source: youtube:Me8ckbQvnsM
title: "Programa contable ContaPyme - Intervalo para fijar cambios por proceso de operaciones"
duration_seconds: 396
view_count: 262
like_count: 
comment_count: 0
upload_date: 20111004
transcript_segments: 63
description_chars: 237
extracted_at: 2026-06-04T03:40:36.360Z
---

# Programa contable ContaPyme - Intervalo para fijar cambios por proceso de operaciones

## Identificación

| Campo | Valor |
| --- | --- |
| **Video ID** | `Me8ckbQvnsM` |
| **URL** | https://www.youtube.com/watch?v=Me8ckbQvnsM |
| **Título (yt-dlp)** | Programa contable ContaPyme - Intervalo para fijar cambios por proceso de operaciones |
| **Título (oEmbed)** | Programa contable ContaPyme - Intervalo para fijar cambios por proceso de operaciones |
| **Canal** | ContaPyme |
| **Canal ID** | `UCPeasMTjLab3kMBdRvG7vAg` |
| **URL canal** | https://www.youtube.com/channel/UCPeasMTjLab3kMBdRvG7vAg |
| **Lista del canal** | https://www.youtube.com/@ContaPymeSoftwareContable/videos |
| **Uploader** | ContaPyme (@ContaPymeSoftwareContable) |
| **Idioma** | es |
| **Estado live** | not_live |
| **Disponibilidad** | public |

## Métricas

| Métrica | Valor |
| --- | ---: |
| Vistas | 262 |
| Me gusta | — |
| Comentarios (reportados) | 0 |
| Comentarios (extraídos) | 0 |
| Duración | 6:36 (396 s) |
| Fecha publicación | 2011-10-04 |
| Segmentos transcripción | 63 |
| Caracteres transcripción | 4774 |

## Descripción

http://www.contapyme.com
Este video del software contable ContaPyme explica la forma como el sistema carga los movimientos generados al procesar un bloque de operaciones y como esa configuración puede ser cambiada.
CP40-010-080-050B-020A

## Clasificación

| Categorías | Science & Technology |
| Etiquetas | ContaPyme, sistema contable, software contable, sistema de contabilidad, software para pymes, sistema de gestion empresarial, software para contadores, programas contables, software contable colombia |

## Información técnica (yt-dlp)

| Campo | Valor |
| --- | --- |
| Mejor formato | 18 |
| Contenedor | mp4 |
| Resolución | 480x360 |
| Dimensiones | 480×360 |
| FPS | 30 |
| Video codec | avc1.42001E |
| Audio codec | mp4a.40.2 |
| Tasa audio (abr) | — |
| Tasa video (vbr) | — |
| Tasa total (tbr) | 212.705 |
| Sample rate | 44100 |
| Tamaño aprox. | 10 MiB |
| Formatos listados | 1 |
| Embebible | true |
| Límite edad | 0 |

### Miniatura principal

![](https://i.ytimg.com/vi/Me8ckbQvnsM/sddefault.jpg)

## Comentarios (muestra)

> Origen: yt-dlp `--write-comments`. Pueden faltar si YouTube limita la API o el video no tiene comentarios.

_No hay comentarios recuperados (o el video no tiene comentarios públicos)._

## Transcripción (subtítulos / ASR)

| Método | yt-dlp-vtt-deduped |
| Idioma track | es |

> Texto automático de YouTube; puede contener errores en nombres y siglas.

### Con marcas de tiempo

[00:00:00.520] intervalo para fijar cambios por proceso de
[00:00:03.910] de operaciones cada que se procesa una
[00:00:06.510] operación el sistema interpreta la información contenida en ella y la
[00:00:11.230] convierte en movimientos contables de inventarios de activos de labores de
[00:00:18.230] costos entre otros dependiendo del tipo de operación que se esté
[00:00:23.670] procesando cuando se procesan grandes bloques de operaciones como pueden ser
[00:00:28.349] las operaciones de varios meses o las operaciones de un año completo sería muy
[00:00:33.869] demorado que cada que se procese una operación el sistema registrara los
[00:00:39.030] movimientos que ha generado con el fin de evitar esas demoras y agilizar el
[00:00:45.389] procesamiento de bloques de operaciones el sistema por defecto viene configurado
[00:00:51.270] para no registrar los movimientos hasta que no se haya terminado de procesar el
[00:00:56.229] bloque o hasta que se detecte cambio de mes veámoslo
[00:01:02.920] gráficamente tenemos las operaciones de dos meses las operaciones del mes de
[00:01:09.030] junio y del mes de julio vamos a iniciar el procesamiento del bloque de
[00:01:15.789] operaciones una vez se procesa todo el mes de junio se detecta un cambio de mes
[00:01:22.590] y el sistema procede a tomar los movimientos y cambios generados por las
[00:01:28.870] operaciones de ese mes y registrarlos en la base de datos una vez ha hecho el
[00:01:43.030] detectar nuevamente cambio de mes tome los movimientos y cambios que han
[00:01:49.310] generado las operaciones y los registre en la base de datos este esquema de
[00:01:55.789] trabajo agiliza notablemente el procesamiento de blo de operaciones ya
[00:01:36.710] que al procesar cada operación no tiene que ir a registrar los movimientos que
[00:02:06.709] ha generado en el caso de presentarse una caída de energía mientras estaban
[00:02:12.990] procesando las operaciones no se corre el riesgo de que la información pueda
[00:02:18.270] quedar incompleta ya que los movimientos no habían sido registrados aún podríamos
[00:02:24.509] decir que la única desventaja que presenta Es que la información contable
[00:02:29.270] de inventarios de labores o costos que generan las operaciones no podr ser
[00:02:35.270] consultada hasta que no se finalice el procesamiento del bloque de
[00:02:40.750] operaciones ahora bien el sistema permite configurar el intervalo para
[00:02:46.750] fijar los cambios por proceso de operaciones es decir el sistema permite
[00:02:52.550] definir cada Cuántas operaciones debe grabar los movimientos que han sido
[00:03:03.440] gráficamente el sistema inicia el procesamiento de las
[00:03:08.390] operaciones cuando procesa un número de operaciones ya definido el sistema toma
[00:03:16.710] los movimientos y cambios generados por esas operaciones y los registra en la
[00:03:22.630] base de datos para luego continuar con el
[00:03:27.910] siguiente grupo de opera y al finalizar ese Grupo Toma nuevamente
[00:03:34.910] los movimientos y cambios generados por las operaciones y lo registra en la base
[00:03:40.589] de datos Y así sucesivamente hasta que se cumpla
[00:03:46.070] nuevamente el grupo de operaciones que tiene definido o hasta que se detecte un
[00:03:52.229] cambio de mes que es la condición inicial que trae el
[00:03:57.869] sistema para ficar la condición inicial del sistema y que se pueda definir un
[00:04:04.270] intervalo de operaciones o el grupo de operaciones a procesar antes de grabar
[00:04:09.869] los movimientos debemos Ingresar a las opciones de configuración del manejador
[00:04:15.750] de operaciones estas opciones de configuración las encontramos en la
[00:04:26.199] operaciones una vez hemos ingresado a las opciones de configuración ingresamos
[00:04:32.670] por la opción proceso de operaciones y allí en la parte inferior
[00:04:40.150] encontramos la opción para fijar el intervalo de operaciones
[00:04:47.070] procesadas se debe activar dicha opción y se le debe indicar el número de
[00:04:54.749] operaciones que se deben procesar para proceder a regrar los movimientos y
[00:05:01.469] cambios generados por las operaciones una vez se ha activado la
[00:05:07.590] opción y se ha configurado el número de operaciones damos clic en aceptar para
[00:05:18.199] cambios este esquema de trabajo minimiza un poco el rendimiento
[00:05:25.909] del sistema en el procesamiento de bloques de operación
[00:05:30.390] ya que cada que se cumpla el intervalo debe estar registrando los movimientos
[00:05:35.990] generados por ella pero tiene la ventaja que permite que la información contable
[00:05:41.990] de inventarios labores o costos que generan las operaciones pueda ser
[00:05:47.909] consultada tan pronto se finalice de registrar el intervalo de operaciones en
[00:05:54.390] bases de datos de gran número de transacciones se recomienda conservar la
[00:05:59.469] configuración inicial del sistema es decir Desactivar esta opción para que se
[00:06:05.950] registren los movimientos al terminar el bloque de operaciones o al detectar un
[00:06:12.070] cambio de mes tengamos en cuenta que esta configuración solo aplica cuando se
[00:06:18.390] procesan bloques de operaciones ya que habitualmente el sistema cada que
[00:06:23.749] procesa una operación registra los movimientos generados por ella es esto
[00:06:29.670] es todo acerca de intervalo para fijar cambios por proceso de

### Texto para referencia (RAG indexa `transcript.segments` del `.json`, uno por cue con `startMs`)

```text
## Descripción del video

http://www.contapyme.com
Este video del software contable ContaPyme explica la forma como el sistema carga los movimientos generados al procesar un bloque de operaciones y como esa configuración puede ser cambiada.
CP40-010-080-050B-020A

## Transcripción

intervalo para fijar cambios por proceso de
de operaciones cada que se procesa una
operación el sistema interpreta la información contenida en ella y la
convierte en movimientos contables de inventarios de activos de labores de
costos entre otros dependiendo del tipo de operación que se esté
procesando cuando se procesan grandes bloques de operaciones como pueden ser
las operaciones de varios meses o las operaciones de un año completo sería muy
demorado que cada que se procese una operación el sistema registrara los
movimientos que ha generado con el fin de evitar esas demoras y agilizar el
procesamiento de bloques de operaciones el sistema por defecto viene configurado
para no registrar los movimientos hasta que no se haya terminado de procesar el
bloque o hasta que se detecte cambio de mes veámoslo
gráficamente tenemos las operaciones de dos meses las operaciones del mes de
junio y del mes de julio vamos a iniciar el procesamiento del bloque de
operaciones una vez se procesa todo el mes de junio se detecta un cambio de mes
y el sistema procede a tomar los movimientos y cambios generados por las
operaciones de ese mes y registrarlos en la base de datos una vez ha hecho el
detectar nuevamente cambio de mes tome los movimientos y cambios que han
generado las operaciones y los registre en la base de datos este esquema de
trabajo agiliza notablemente el procesamiento de blo de operaciones ya
que al procesar cada operación no tiene que ir a registrar los movimientos que
ha generado en el caso de presentarse una caída de energía mientras estaban
procesando las operaciones no se corre el riesgo de que la información pueda
quedar incompleta ya que los movimientos no habían sido registrados aún podríamos
decir que la única desventaja que presenta Es que la información contable
de inventarios de labores o costos que generan las operaciones no podr ser
consultada hasta que no se finalice el procesamiento del bloque de
operaciones ahora bien el sistema permite configurar el intervalo para
fijar los cambios por proceso de operaciones es decir el sistema permite
definir cada Cuántas operaciones debe grabar los movimientos que han sido
gráficamente el sistema inicia el procesamiento de las
operaciones cuando procesa un número de operaciones ya definido el sistema toma
los movimientos y cambios generados por esas operaciones y los registra en la
base de datos para luego continuar con el
siguiente grupo de opera y al finalizar ese Grupo Toma nuevamente
los movimientos y cambios generados por las operaciones y lo registra en la base
de datos Y así sucesivamente hasta que se cumpla
nuevamente el grupo de operaciones que tiene definido o hasta que se detecte un
cambio de mes que es la condición inicial que trae el
sistema para ficar la condición inicial del sistema y que se pueda definir un
intervalo de operaciones o el grupo de operaciones a procesar antes de grabar
los movimientos debemos Ingresar a las opciones de configuración del manejador
de operaciones estas opciones de configuración las encontramos en la
operaciones una vez hemos ingresado a las opciones de configuración ingresamos
por la opción proceso de operaciones y allí en la parte inferior
encontramos la opción para fijar el intervalo de operaciones
procesadas se debe activar dicha opción y se le debe indicar el número de
operaciones que se deben procesar para proceder a regrar los movimientos y
cambios generados por las operaciones una vez se ha activado la
opción y se ha configurado el número de operaciones damos clic en aceptar para
cambios este esquema de trabajo minimiza un poco el rendimiento
del sistema en el procesamiento de bloques de operación
ya que cada que se cumpla el intervalo debe estar registrando los movimientos
generados por ella pero tiene la ventaja que permite que la información contable
de inventarios labores o costos que generan las operaciones pueda ser
consultada tan pronto se finalice de registrar el intervalo de operaciones en
bases de datos de gran número de transacciones se recomienda conservar la
configuración inicial del sistema es decir Desactivar esta opción para que se
registren los movimientos al terminar el bloque de operaciones o al detectar un
cambio de mes tengamos en cuenta que esta configuración solo aplica cuando se
procesan bloques de operaciones ya que habitualmente el sistema cada que
procesa una operación registra los movimientos generados por ella es esto
es todo acerca de intervalo para fijar cambios por proceso de
```

## Extracción

| Extraído (UTC) | 2026-06-04T03:40:36.360Z |
| Schema | 2 |
| JSON | `videos/2011/Me8ckbQvnsM.json` |
| yt-dlp crudo | `videos/2011/Me8ckbQvnsM.info.json` |
