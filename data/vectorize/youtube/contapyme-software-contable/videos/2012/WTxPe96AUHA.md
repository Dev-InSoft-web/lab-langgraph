---
schemaVersion: 2
videoId: WTxPe96AUHA
source: youtube:WTxPe96AUHA
title: "Software contable ContaPyme - Configuración de Firebird"
duration_seconds: 6313
view_count: 2013
like_count: 
comment_count: 1
upload_date: 20121022
transcript_segments: 1050
description_chars: 166
extracted_at: 2026-06-04T03:26:43.496Z
---

# Software contable ContaPyme - Configuración de Firebird

## Identificación

| Campo | Valor |
| --- | --- |
| **Video ID** | `WTxPe96AUHA` |
| **URL** | https://www.youtube.com/watch?v=WTxPe96AUHA |
| **Título (yt-dlp)** | Software contable ContaPyme - Configuración de Firebird |
| **Título (oEmbed)** | Software contable ContaPyme - Configuración de Firebird |
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
| Vistas | 2013 |
| Me gusta | — |
| Comentarios (reportados) | 1 |
| Comentarios (extraídos) | 1 |
| Duración | 1:45:13 (6313 s) |
| Fecha publicación | 2012-10-22 |
| Segmentos transcripción | 1050 |
| Caracteres transcripción | 71724 |

## Descripción

http://www.contapyme.com
Este video explica las formas de configurar Firebird para obtener un mejor rendimiento con el software contable ContaPyme.
CP40-005-040B-010M

## Clasificación

| Categorías | Science & Technology |
| Etiquetas | ContaPyme, sistema contable, software contable, sistema de contabilidad, software para pymes, sistema de gestion empresarial, software para contadores, programas contables, software contable colombia |

## Información técnica (yt-dlp)

| Campo | Valor |
| --- | --- |
| Mejor formato | 18 |
| Contenedor | mp4 |
| Resolución | 640x360 |
| Dimensiones | 640×360 |
| FPS | 30 |
| Video codec | avc1.42001E |
| Audio codec | mp4a.40.2 |
| Tasa audio (abr) | — |
| Tasa video (vbr) | — |
| Tasa total (tbr) | 200.3 |
| Sample rate | 44100 |
| Tamaño aprox. | 151 MiB |
| Formatos listados | 5 |
| Embebible | true |
| Límite edad | 0 |

### Miniatura principal

![](https://i.ytimg.com/vi/WTxPe96AUHA/maxresdefault.jpg)

## Capítulos

| Inicio | Título |
| --- | --- |
| 00:00:00.000 | <Untitled Chapter 1> |
| 00:00:04.000 | Uso de licencia de otro servidor temporalmente |
| 00:21:59.000 | Mejorar desempeño del servidor de datos |
| 00:38:12.000 | Mejorar desempeño: Internet |
| 00:50:54.000 | Mejorar desempeño: Firebird.conf |

## Comentarios (muestra)

> Origen: yt-dlp `--write-comments`. Pueden faltar si YouTube limita la API o el video no tiene comentarios.

| # | Autor | Me gusta | Fecha (UTC) | Texto |
| ---: | --- | ---: | --- | --- |
| 1 | @Jhannuz | 0 | 2023-06-04T00:00:00.000Z | Hola... Yo aplique los cambios que comento en el video... Pero ya usando el servidor no se ve reflejado los cambios sigue usando la misma cantidad de ram y no usa todos los núcleos.... Ya reinicie el servidor y no hay cambios.. Que puede ser ahi |

## Transcripción (subtítulos / ASR)

| Método | yt-dlp-vtt-deduped |
| Idioma track | es |

> Texto automático de YouTube; puede contener errores en nombres y siglas.

### Con marcas de tiempo

[00:00:04.279] el uso de licencias de otro servidor de datos temporalmente consiste en Iniciar
[00:00:09.430] sesión del programa en un cliente conectarnos a un servidor de datos pero
[00:00:17.550] usando una licencia de otro servidor de datos esto es muy útil cuando yo tengo
[00:00:23.670] una licencia con pocos módulos y necesito Conectarme a un área de trabajo
[00:00:30.630] a trabajar en ciertos módulos que no tengo en esa licencia entonces puedo
[00:00:34.389] prestar una licencia de otro servidor que sí tenga esos módulos que yo
[00:00:39.270] requiero esto pues es muy útil digamos para los contadores normalmente trabajan
[00:00:44.430] en una empresa se llevan una copia de seguridad o se conectan desde su casa y
[00:00:49.110] pues allá tienen otro licenciamiento diferente esta nueva característica está
[00:00:54.709] presente en el Release número TR que incluso hoy ya estamos habilitando en la
[00:01:00.389] página de internet para que ustedes puedan iniciar las descargas y pruebas
[00:01:04.670] de estas nuevas características esta parte debemos tener
[00:01:09.109] en cuenta estas dos notas y son contapyme y agroin
[00:01:15.710] monousuario el mon usuario recordemos que es como una especie de cliente solo
[00:01:20.830] que tiene el servidor integrado y cuando yo utilizo la parte de cliente que me
[00:01:26.190] conecto a otro servidor de datos en ese momento puedo hacer el uso de la
[00:01:32.789] licencia prestada pero cuando yo necesito iniciar
[00:01:37.389] un cliente y quiero usar una licencia de una instalación monousuario no se puede
[00:01:43.789] recordemos que las instalaciones monousuario son como un servidor como
[00:01:47.870] una especie de isla Entonces él no puede prestar esa licencia el
[00:01:52.870] monousuario pero el monousuario actuando como cliente y conectándose a otro
[00:01:58.230] servidor de datos sí puede hacer el manejo de licencias
[00:02:03.680] prestadas vamos a ver acá los pasos para hacer el manejo de licencia
[00:02:10.630] prestada entonces aquí está cada paso con su explicación cuando iniciamos con
[00:02:20.949] conexión entonces en la lista de licencias al final hay un nuevo ítem que
[00:02:27.150] dice usar licencia de otro servidor de datos
[00:02:31.190] datos temporalmente al seleccionar esta opción
[00:02:34.430] nos va a aparecer un mensaje informativo el cual nos Explica
[00:02:39.869] brevemente qué es lo que va a pasar a continuación entonces as el usuario pues
[00:02:46.350] va a tener claro qué es lo que sigue cuando le damos a esa ventana
[00:02:51.350] informativa solicitar licencia prestada Entonces nos va a preguntar
[00:02:57.670] cuál es el servidor de datos que que va a prestar la licencia entonces ahí
[00:03:02.630] debemos escribir o si ya está en la listica seleccionar el servidor de datos
[00:03:08.670] por ejemplo yo estoy ubicado en local Host acá arriba pueden ver que en la
[00:02:16.869] caja de conexión inicial dice local Host y cuando yo le solicito la licencia
[00:03:19.030] prestada se la estoy solicitando al servidor
[00:03:23.789] servidor server cuando yo le doy a aceptar
[00:03:26.710] entonces me va a salir la caja de datos de conexión Esta es necesaria porque
[00:03:32.710] como yo le estoy pidiendo una licencia prestada a otro servidor yo debo hacer
[00:03:37.550] uso de esa licencia y en ese servidor quedar registrada de que esa licencia se
[00:03:43.429] está usando una vez o sea llevar el conteo de esa manera no tenemos
[00:03:50.270] problemas con la cuestión de licenciamiento que no es que yo presto
[00:03:54.990] licencias y entonces la puedo usar 10 20 veces no él va llevando el conteo de las
[00:04:00.789] veces que está permitida una vez yo le doy el botón
[00:04:05.509] prestar licencia él me retorna a la caja de datos de conexión inicial y en la
[00:04:12.030] parte de licencia aparecen los datos que él va a usar con la licencia prestada y
[00:04:18.270] una vez yo me doy la opción conectar él va a hacer el proceso común y corriente
[00:04:23.350] de conectarme al área de trabajo y voy a usar esa licencia que me prestó el otro
[00:04:30.430] servidor cuando ya finalice sesión o cierre el
[00:04:33.550] programa entonces en el servidor que prestó la licencia se va a cerrar ese
[00:04:40.670] uso de licencia la libera y en el servidor al cual estoy conectado yo al
[00:04:45.710] área de trabajo también se va a cerrar común y
[00:04:49.350] corriente Entonces de esa forma puedo prestar la
[00:04:54.270] licencia se lleva el conteo y cuando se cierra se cierran ambas sesiones
[00:05:01.189] vamos a mirar acá algunos casos prácticos de cuándo se puede utilizar
[00:05:05.790] este sistema de licenciamiento prestada Por ejemplo yo soy un contador
[00:05:11.270] y llevo la contabilidad de varias empresas en mi oficina tengo instalado
[00:05:15.749] contapyme monousuario o servidor y cliente no importa con una licencia
[00:05:22.390] pequeña o sea licencia mínima de contador y en las empresas tienen un
[00:05:27.189] licenciamiento superior a la mía tienen costos inventarios
[00:05:33.680] etcétera cu abajo en la yo me traigo de la empresa x de donde Soy contador me
[00:05:39.749] traigo una copia de seguridad de pronto para generar informes y revisar los
[00:05:45.230] informes pero cuando yo voy ver informes de los módulos que yo no tengo en mi
[00:05:50.590] licencia Pues quedó varado entonces lo que yo puedo hacer en ese momento
[00:05:55.710] es abro contapyme abro mi conta mon
[00:06:00.790] usuario en la parte donde pregunta el servidor dejo mon
[00:06:07.110] usuario entro y le digo en la parte de solicitar licencia en el servidor de la
[00:06:13.589] empresa lógicamente yo deo tener internet y en la empresa estará
[00:06:23.919] internet selecciono la licencia que quiero que me preste el servidor Y con
[00:06:29.110] esa licencia me conecto al área de trabajo que tengo aquí local de esa
[00:06:35.029] Consultar los informes de los módulos que tiene esa empresa y finalmente
[00:06:41.749] cuando yo cierre la sesión pues se liberan el servidor se liberan la
[00:06:45.629] licencia prestada y acá en mi computador se cierra el área de trabajo ese sería
[00:06:52.749] un caso el segundo
[00:06:55.589] caso puede ser al contrario yo soy el y llevo la contabilidad de varias empresas
[00:07:02.309] en mi oficina tengo instalado una licencia que tiene múltiples módulos
[00:07:09.510] contabilidad inventarios presupuesto pero las empresas las a las
[00:07:14.710] que yo asesoro pues no los pongo a que compren módulos una licencia con todos
[00:07:19.270] los módulos sino que compren solo lo que necesitan ellos digitar y yo luego me
[00:07:25.350] conecto con ellos y termino de hacer las operaciones eh más
[00:07:31.749] avanzadas pero como ellos no tienen la licencia con los módulos que yo necesito
[00:07:36.550] Entonces yo utilizo la licencia que tengo aquí en mi
[00:07:39.950] computador sí Entonces en este caso es yo me conecto por internet al
[00:07:47.149] servidor de datos de la empresa al área de trabajo de ellos y le digo que voy a
[00:07:54.029] prestar una licencia y selecciono la licencia que tengo en mi computador
[00:07:59.469] Entonces de esa forma puedo trabajar en los módulos que yo necesito pero que ese
[00:08:08.639] tiene y el tercer caso serían por ejemplo yo necesito
[00:08:14.710] trabajar es en mi portátil en mi portátil yo inicio el contap cliente o
[00:08:20.469] agroin cliente y le puedo por ejemplo solicitar prestada la licencia al
[00:08:26.909] computador de mi oficina al servidor de datos de mi oficina y conectarme al área
[00:08:32.269] de trabajo de una de las empresas en las que yo trabajo o
[00:08:37.070] viceversa podría ser que me conectes al área de trabajo de mi oficina y
[00:08:42.029] utilizando una licencia de una de las empresas tenemos tres casos prácticos de
[00:08:49.269] cuándo se usa este sistema de prestar
[00:08:54.509] licencia vamos a mirar en contapyme entonces las ventanas que se presentan
[00:09:04.320] opción aquí estoy iniciando cont pye aquí despliego más
[00:09:11.640] opciones entonces aquí aparece la licencia que yo tengo en este computador
[00:09:16.269] que puede ser una licencia básica la licencia servidor porque estoy
[00:09:21.790] en local Host aquí local Host o sea en mi
[00:09:25.630] mi computador y aquí está la opción usar
[00:09:28.389] licencia de otro servidor de datos temporalmente cuando yo le doy clic
[00:09:33.949] entonces me saca una ventana informativa donde me dice pues que va a pedirme los
[00:09:39.990] datos de conexión del servidor al que yo le voy a solicitar la licencia prestada
[00:09:45.710] ahí me pregunta el nombre del servidor pues si no lo tenemos en la listica pues
[00:09:54.519] escribimos ahora me dice datos de conexión Pero estos datos de conexión
[00:09:59.750] solo para usar la licencia nos vamos a conectar a
[00:10:04.790] server Aquí voy a colocar mi usuario y mi
[00:10:09.069] mi contraseña y selecciono qué licencia
[00:10:12.110] quiero que me preste ese servidor Por qué tengo que usar esta ventana de
[00:10:16.630] conexión porque en el servidor que me va a prestar la licencia debo quedar
[00:10:21.509] registrado como usando esa licencia Entonces por tal motivo yo debo estar
[00:10:27.190] creado en ese servidor como un usuario y conocer una tener la contraseña y tener
[00:10:33.630] disponible un área de trabajo cualquiera y la licencia que yo voy a prestar vamos
[00:10:39.430] a decirle prestar licencia entonces noten que aquí dice
[00:10:45.310] licencia dice quién prestó la licencia server y dice Qué licencia
[00:10:52.880] prestó voy a validar acá para entrar
[00:10:59.480] Bueno aquí me qued
[00:11:02.560] mal y
[00:11:10.279] conectar Ahí estamos cargando el programa en el cual estamos usando una
[00:11:22.880] datos vamos a mirar por acá por usuarios conectados entonces aquí aparece que es
[00:11:32.310] Suárez que es mi computador está conectado a esta área de trabajo o sea
[00:11:40.590] que aparece aparezco conectado como unic
[00:11:43.230] corriente Ahora me voy a cambiar al servidor sí voy a cambiar al servidor
[00:11:48.190] para ver esta parte en esta misma opción de usuarios conectados que yo no estoy
[00:11:54.750] conectado allá a ninguna área de trabajo Solo estoy usando es una licencia de
[00:11:58.910] allá entonces me voy a ir para el servidor listo aquí ya estamos viendo el
[00:12:09.160] servidor aquí lógicamente es usuario distinto con una contraseña diferente
[00:12:34.120] bueno acá ya cargamos el programa y vamos a mirar usuarios
[00:12:39.790] conectados entonces aquí está conectado e Suárez que es la conexión que yo tengo
[00:12:46.069] acá en mi otro en mi computador desde que estoy viendo la
[00:12:49.389] presentación y noten que aquí dice conectado a otro servidor de datos local
[00:12:55.670] Host área trabajo 1 admin este conectado servidor de datos quiere decir que me
[00:13:02.550] pidió prestada una licencia y este PC server pues es el
[00:13:07.590] computador servidor desde el cual les estoy mostrando en este momento Entonces
[00:13:11.550] de esa forma podemos un usuario podría saber que los conteos de licencia se le
[00:13:17.230] acabaron y no hay nadie conectado Ah pudo haber sido que es que se están
[00:13:20.910] conectando prestando la licencia Entonces se puedes llevar ese
[00:13:26.639] control voy a regresar a a mi computador voy a cerrar la sesión del
[00:13:32.990] servidor Y regresamos acá al a mi computador Entonces de esa forma
[00:13:39.750] podemos hacer el uso de licencias prestadas si
[00:13:45.040] observamos aquí par ccd aquí en licencia virtual activa no
[00:13:51.150] aparece nada porque es que este computador no está usando ninguna
[00:13:54.910] licencia Realmente está usando es la de otro computador no la no una de acá por
[00:14:04.880] vacío Bueno vamos a aprovechar y hacemos un un pequeño tiempo de preguntas como
[00:14:13.030] para cerrar esta parte de licencias prestadas
[00:14:18.600] prestadas
[00:14:34.399] Por acá nos preguntan al trabajar de esta forma si tengo un solo usuario
[00:14:40.030] cliente solo puede trabajar un usuario o dos sesiones con el mismo
[00:14:45.470] usuario como esta parte de licencias prestadas funciona con el registro de
[00:14:50.350] licencia Entonces cuando yo entro desde mi computador y Solicito la licencia
[00:14:55.150] prestada al servidor y el servidor solo tenía una ejecución Entonces yo estoy
[00:15:00.189] gastando esa ejecución si allá en la empresa alguien va a entrar le va a
[00:15:05.150] decir que no puede que la licencia está en uso hasta que yo no cierre sesión
[00:15:09.670] aquí allá en el servidor de la empresa no pueden
[00:15:23.560] licencia los datos de cada área son independientes
[00:15:29.189] independientes Sí cuando yo me conecto desde aquí en mi
[00:15:34.309] computador yo me conecto a un área de trabajo
[00:15:37.710] trabajo local y en el servidor de la empresa que
[00:15:41.430] le estoy pidiendo prestada la licencia yo tengo que seleccionar un área de
[00:15:44.829] trabajo y usuario es solamente con los fines de validación porque yo no puedo
[00:15:49.829] prestar licencias si yo no tengo como ese permiso es como la forma de validar
[00:15:55.069] de que sí tengo permiso de usar esa licencia
[00:15:59.150] licencia y cuando me conecto no tengo que ver
[00:16:01.350] nada con el área de trabajo que hay en la empresa porque yo me estaba
[00:16:04.749] conectando realmente era a la de aquí de mi computador voy a volver a iniciar la
[00:16:13.000] contapyme Para que veamos miren que yo me estoy conectando a local
[00:16:17.870] Host área de trabajo uno esta área de trabajo es mía aquí de mi computador es
[00:16:24.910] a los datos a los que yo me voy a conectar cuando yo Solicito la la
[00:16:30.350] licencia prestada él aquí Aparentemente se me va
[00:16:33.590] a conectar a un área de trabajo pero solo es con fines de validar el usuario
[00:16:38.309] y contraseña para poder usar esta licencia
[00:16:41.430] que yo estoy pidiendo prestada de esa forma si por ejemplo un contador ya no
[00:16:47.230] trabaja en esa empr en esa simplemente quitan el
[00:16:51.829] usuario lo bloquean lo borran o le cambian la fecha de finalización y ese
[00:16:56.509] contador ya no podía ya no podrá prestar licencia Pues porque ya no pertenece a
[00:17:08.559] empresa por acá nos preguntan que si desde la empresa le pueden Cerrar la
[00:17:14.350] sesión al contador Bueno ahí sí está un poco complicado
[00:17:21.189] porque cuando se registra digamos que se pierde un poco el control porque es otro
[00:17:26.949] computador que está en otro lugar pero podríamos analizar un poco esa
[00:17:32.510] opción porque si el de sistemas determina que no que ese Contador se le
[00:17:37.110] metió y no debería Entonces debería de alguna forma poderlo bloquear o o
[00:17:42.630] cerrarle esa sesión vamos aquí a tener en cuenta
[00:17:54.720] tip el contador se conecta y se le olvida cerrar sesión bueno como la
[00:18:01.549] sesación que está usando el cont aquí el contador está gastando una licencia ya
[00:18:07.310] en el servidor é la puede tener abierta el tiempo que sea es muy difícil
[00:18:11.990] controlar de que si se le olvidó apagar el computador y dejó contap abierto
[00:18:16.230] porque uno no sabe si está trabajando realmente o no desde la empresa entonces
[00:18:22.190] ahí tocaría esperar que cierre la sesión ahí si no habría pues como otra forma
[00:18:26.350] Porque si uno va y le mata la sesión le podría dañar quién sabe qué datos que
[00:18:34.240] realmente Existe algún límite de veces para prestar licencia
[00:18:39.750] Eh no eh en el momento no tenemos ningún
[00:18:44.870] límite ni ningún control esta opción pues es nueva miren que apenas la
[00:18:48.630] estamos lanzando en este Release con estas preguntas pues ya van a
[00:18:52.510] apareciendo sugerencias las cuales podemos ir teniendo en cuenta y podría
[00:18:56.789] ser que llevemos podría ser no es que lo vayamos a hacer que llevemos un conteo
[00:19:00.710] de préstamos así por ejemplo el jefe de sistemas de la empresa dice no le voy a
[00:19:05.390] prestar la licencia tres veces entonces aquí el contador la puede usar Solo
[00:19:15.679] veces con el solo nombre del servidor se puede conectar bueno no con solo el
[00:19:21.630] nombre no porque tiene que validarse como usuario entonces por eso tiene que
[00:19:38.799] tengo un caso en que en que un usuario tiene una empresa
[00:19:45.510] y quiere montar el sistema en un servidor con su licencia full pero la
[00:19:53.149] esposa esora y quiere en el equipo el programa
[00:19:56.310] pero es una licencia contador Bueno si en el mismo computador el mismo
[00:20:02.149] servidor de datos van a instalar dos licencias Pues digamos que
[00:20:08.350] depende como lo manejen no habría necesidad ni siquiera de usar el uso de
[00:20:12.190] préstamo en el mismo servidor pues se registran las dos licencias o sea
[00:20:16.510] Recuerden que un servidor de datos puede tener muchas licencias registradas y
[00:20:20.750] luego ya se le dice a cada usuario que licencia puede usar
[00:20:29.520] el servidor de datos que presta la licencia debe estar siempre
[00:20:35.630] prendido sí lo que miramos ahorita es que yo estoy aquí yo soy el contador y
[00:20:41.750] me voy a conectar al servidor de datos de la empresa para que me preste la
[00:20:46.149] licencia entonces debe estar prendido y los dos deben tener internet pues porque
[00:21:03.120] puedo hacer que una licencia se pueda o no prestar por ejemplo bloquearla para
[00:21:08.149] algunos usuarios Esta es una buena pregunta porque entonces nos va a servir
[00:21:14.310] como un tip para ir mejorando esta parte en el momento está abierto o sea
[00:21:19.870] cualquier usuario podría prestar cualquier licencia pero ya podemos ver
[00:21:23.909] que es necesario decir que licencias serían prestables
[00:21:28.950] A qué usuarios de esa forma pues no se nos puede meter cualquiera y ir usando
[00:21:46.200] licencias bueno eh
[00:21:59.120] Entonces vamos a pasar al punto dos que es mejora desempeño del servidor de
[00:22:03.830] datos el servidor de datos vamos a hablar del computador donde se instala
[00:22:09.230] contapyme o agrowin server ese va a ser nuestro servidor de
[00:22:14.070] datos podemos mejorarlo en cuatro aspectos sistema operativo ya vamos a
[00:22:21.190] ver en detalle cada uno Hardware internet y F
[00:22:28.789] Entonces vamos a mirar algunos tips con relación a Cómo mejorar el desempeño en
[00:22:33.590] el sistema operativo normalmente cuando uno compra
[00:22:38.549] un computador servidor que viene con el Windows server 2003 2008 eso viene sin
[00:22:45.310] programas viene simplemente el sistema operativo y ya uno le empieza a instalar
[00:22:50.870] Pero hay veces que como ese Windows que que viene
[00:22:59.480] cualquier tipo deos servicios y tareas habilitados que de pronto Nuestra
[00:23:05.110] Empresa nunca va a usar Entonces Sería muy bueno de pronto esas tareas
[00:23:09.830] servicios programitas que no se van a usar
[00:23:13.190] usar deshabilitarlas comen consumen recursos
[00:23:16.430] consumen memoria RAM que puede ser poca pero consumen algo consumen
[00:23:22.190] procesador entonces La idea es como afinar el sistema operativo quitando
[00:23:28.070] esos programitas que yo no necesito digamos que ahí necesitaríamos
[00:23:33.950] Pues de pronto la asesoría de alguien que conozca un poco más pero nosotros
[00:23:39.070] digamos desde nuestro punto de vista básico simplemente Iniciando el
[00:23:43.269] administrador de tareas de Windows Aquí vemos las aplicaciones que
[00:23:48.390] están en ejecución y aquí vemos los procesos que están en ejecución noten
[00:23:53.149] que es una gran cantidad de procesos y un servidor puede tener muchos más
[00:23:58.549] entonces uno podría determinar por ejemplo aquí qué procesos podrían
[00:24:03.750] realmente no ser necesarios yo aquí pues más o menos lo
[00:24:07.710] tengo depurado pero aquí podrían aparecer procesos raros que no son ni de
[00:24:12.950] Microsoft ni de algo que yo conozca entonces podría Investigar un poco y de
[00:24:17.789] pronto mirar cómo Deshabilitar ese proceso porque miren que esos procesos
[00:24:21.430] consumen memoria por ejemplo aquí hay uno que me está consumiendo 100 megas
[00:24:26.510] Bueno Este es el presentación que estamos haciendo por
[00:24:31.149] aquí hay otro este de audio me está consumiendo
[00:24:35.510] solo el controlor de audio me está consumiendo 15 megas entonces uno ahí
[00:24:39.470] podría revisar Qué programas de verdad no
[00:24:44.029] no necesito esa podría ser una tarea de
[00:24:46.789] optimización del sistema operativo también sucede que cuando uno
[00:24:53.230] compra un computador en alguna tienda que no es un servidor sino un computador
[00:24:57.310] bueno eso le
[00:25:01.520] inst y va y mira cuatro reproductores de video tiene Corel draw tiene J 1000
[00:25:09.630] programas que uno nunca usa entonces desinstalé Porque esos programas
[00:25:14.830] normalmente van y ponen cosas en el registro de Windows van y ponen cosas en
[00:25:19.230] el arranque de Windows entonces todo eso también me consume procesador me consume
[00:25:24.430] memoria hay algunos malucos uno está trabajando y una burb Ah hay una nueva
[00:25:29.269] actualización desea descargarla buo pero yo nunca uso Este programa o cuatro
[00:25:34.990] reproductores de video Pues con uno solo es suficiente entonces ahí también
[00:25:40.350] estaríamos optimizando nuestro computador y le estaríamos dejando más
[00:25:44.389] recursos a los programas que realmente lo
[00:25:47.990] lo necesitan hay una parte que es un poco
[00:25:51.350] ladrilla Por así decirlo y es el tema de los
[00:25:54.830] los antivirus normalmente en los
[00:25:56.669] computadores cuando uno mucho en internet y tiene abierta la puerta de
[00:26:01.149] internet pues está en riesgo de que se le meta algún virus si uno tiene cuidado
[00:26:06.269] de no abrir correos que no conoce de no meterse a páginas indebidas puede que
[00:26:11.029] nunca se le pegue un virus y nunca tuvo antivirus pero para prevenir esto pues
[00:26:15.590] todas las empresas y nosotros como usuarios tendemos a tener algún
[00:26:19.310] antivirus o programas similares esos son muy buenos pero
[00:26:23.750] frenan mucho el computador Porque todo lo que uno está haciendo el está
[00:26:29.149] constantemente lo está testeando entonces ahí está gastando tiempo el
[00:26:33.310] procesador está gastando tiempo en memoria usa el disco
[00:26:37.950] duro entonces hay en empresas que tienen servidores dedicados o sea es son
[00:26:42.789] servidores que están por allá en un cuarto y hay nadie trabaja normalmente
[00:26:46.669] esos servidores no necesitan antivirus Porque allá Nunca van a entrar a navegar
[00:26:50.430] en internet Nunca van a instalar programas raros entonces si yo ya tengo
[00:26:55.269] el servidor de datos de contapyme o abin pues
[00:26:58.870] pues Yo diría que a ese servidor no le
[00:27:01.230] montemos un antivirus y ahí estamos dejando que el servidor trabaje mucho
[00:27:06.549] mejor en los clientes Pues iba a ser necesario pero en el servidor podría ser
[00:27:12.310] que no ahora si el servidor de datos es un
[00:27:15.149] computador donde trabaja alguna persona Pues de pronto ahí sí podría necesitar
[00:27:23.559] riesgo otra parte que frena mucho los computadores por ejemplo tenemos el
[00:27:28.830] servidor de datos que decimos allá en un cuarto donde nadie lo usa y le ponemos
[00:27:32.590] un protector de pantalla y el protector de pantalla es de estos que son animados
[00:27:37.470] o que son de los que muestran figuras 3D entonces esos consumen mucho procesador
[00:27:43.310] ent imag un computador que está ya quietico dándole servicio a todos los
[00:27:47.430] clientes y con un protector de pantalla que se gasta harto
[00:27:52.029] procesador se está se está consumiendo recursos sin ser necesario entonces en
[00:27:57.789] lo posible en ese ese tipo de servidores donde nadie trabaja que normalmente se
[00:28:02.549] activan los protectores de pantalla Entonces se puede seleccionar la opción
[00:28:07.029] que se llama vacío Sí les voy a mostrar por
[00:28:12.029] por acá denmen un segundo yo la
[00:28:25.600] busco por acá uno le dice protector de pantalla Entonces estos de burbujas de
[00:28:33.310] texto 3D consumen procesador mientras está ahí mostrando la animación Entonces
[00:28:38.630] en este caso le podríamos decir vacío entonces simplemente cuando se active se
[00:28:42.509] pone la pantalla negra entonces conserva el monitor y no usa
[00:28:48.440] procesador Y pues también ahorra energía porque no está ahí mostrando nada en
[00:28:56.360] pantalla bueno en las empresas Este otro tip es muy bueno porque hay empresas
[00:29:03.909] que tienen un serv un buen servidor pero le instalan un mundo de servicios no
[00:29:08.830] Entonces tenemos un servidor pongámosle el servidor de datos de conta agroin
[00:29:13.310] pongámosle el servicio de internet pongámosle este otro programa entonces
[00:29:18.669] empiezan a sobrecargar ese servidor y cuando va a trabajar conim agroin pues
[00:29:23.669] trabaja Pero como hay tantos otros procesos pues entonces es un poco más
[00:29:28.950] entonces las empresas críticas que de pronto necesitan que el desempeño del
[00:29:34.590] servidor hacia los clientes sea inmediato muy rápido recomendar
[00:29:39.870] lógicamente Pues eso tiene sus costos recomendar Que tengan un servidor
[00:29:44.750] dedicado O sea que instalen simplemente el servidor de conta pyme agroin y no
[00:29:50.029] instalen más programas eso pues va a garantizar que con el tiempo entre más
[00:29:55.190] usuarios se conecten Pues a todos les va a dar un buen rendimiento porque el
[00:30:05.000] específica otro tip no sé por qué lo he visto algunos técnicos cuando van e
[00:30:11.669] instalan un sistema operativo siendo Windows de 64 bits la cpu perdón O sea
[00:30:18.590] la parte física del computador instalan el Windows de 32 bits ahí están
[00:30:23.990] desaprovechando el potencial físico que tiene el computador lo ideal es que si
[00:30:28.950] el computador físicamente es de 64 bits instalen el sistema operativo de 64 así
[00:30:35.430] se aprovecha al máximo los recursos físicos de pronto un tipito que me faltó
[00:30:41.389] acá es la Ups una recomendación grande es que el servidor de datos tenga Ups
[00:30:50.029] por qué esto decíamos que cuando los clientes se
[00:30:54.269] caen y se desconectan no pasa nada porque F por ser un sistema cliente
[00:31:01.310] servidor tiene Pues un manejo que si un cliente se cae a la base de datos no le
[00:31:06.149] pasa nada pero si se cae el servidor de datos se puede dañar la base de
[00:31:12.070] datos porque tiene índices abiertos tiene transes iniciadas entonces puede
[00:31:18.950] sufrir entonces por eso lo ideal es que el servidor de datos tenga una Ups hay
[00:31:25.909] upss que incluso se conectan a la cpu del computador y cuando se va la luz dig
[00:31:31.269] digamos Por cierto tiempo le mandan la instrucción al computador para que se
[00:31:36.110] apague Entonces al mandarle esa instrucción a Windows Windows cierra
[00:31:39.950] todos los programas adecuadamente y se apaga cuando se va la luz uno un
[00:31:45.789] segundito pues la Ops lo sostiene y cuando ya se va por mucho tiempo ent lo
[00:31:50.789] sostiene 10 minutos y le da la instrucción para que el servidor se
[00:31:53.909] apague entonces por eso también la Ups ayuda a controlar así el corte de
[00:31:58.190] energía sea por mucho tiempo Bueno entonces estas son mejoras
[00:32:03.830] relacionadas al sistema operativo lógicamente recomendamos pues
[00:32:09.669] tener eh sistema operativo eh última versión Yo sé que a
[00:32:23.279] veces lógicamente sabemos que Windows 7 pues ha salido muy bueno tiene
[00:32:28.590] muy buen soporte es muy estable consume menos recursos entonces pues
[00:32:33.269] recomendamos Windows 7 y si es un sistema un computador servidor puede ser
[00:32:39.149] un Windows 2008 o ahora en estos días ya está saliendo al mercado el Windows
[00:32:47.960] 2012 Bueno ahora hablemos de la parte de Hardware lógicamente las empresas que ya
[00:32:54.950] tienen su computador servidor pues van a usar el que tienen entonces de pronto
[00:32:59.350] pues ahí mejorar el Hardware es un poco más difícil pero si es alguna empresa
[00:33:03.029] que va a comprar podríamos tener en cuenta estos tips Y de pronto hacerle
[00:33:08.909] algunas recomendaciones por ejemplo la
[00:33:11.629] cpu la cpu pues antiguamente era simplemente un núcleo y lo iban
[00:33:23.120] velocidad ahora para poder como al mejorar al aumentarle la velocidad los
[00:33:28.830] procesadores se están calentando mucho entonces la estrategia de los que
[00:33:32.509] fabrican los procesadores no es aumentar y aumentar la velocidad sino tener como
[00:33:37.629] quien dice varios procesadores en uno entonces a eso se le denomina
[00:33:46.789] ejemplo tener un procesador de cuatro núcleos es como si tuviera un procesador
[00:33:51.870] como si tuviera cuatro procesadores Entonces miren acá el
[00:33:58.000] que si la cpu tiene un núcleo pues le van a llegar muchas peticiones de los
[00:34:02.430] clientes para procesos digamos hay tres o cuatro clientes a la vez conectados y
[00:34:07.830] va a ir atendiendo solo con un procesador si tiene varios procesadores
[00:34:14.990] o varios núcleos pues va a poder atender a varios a la vez entonces va a ser
[00:34:19.790] mucho más rápida la solución de las peticiones por ejemplo Hoy día hay
[00:34:24.950] procesadores con ocho y hasta 16 núcleos Entonces si uno comprar un computador
[00:34:31.589] servidor pues puede uno recomendar que tenga siquera mínimo cuatro núcleos
[00:34:38.030] mejor ocho y pues mucho mejor 16 lógicamente pues Los costos se
[00:34:44.589] suben también es muy importante cuando uno compra el computador que tenga algo
[00:34:50.869] que se llama cach de servidor eso es como un almacenamiento
[00:34:55.710] temporal que utilizan los procesadores cuando leen en el disco duro datos de
[00:35:00.390] tenerlos aquí no en la memoria RAM sino como en un punto intermedio que es muy
[00:35:05.069] rápida se como que intuye que es lo siguiente que va a pedir el al disco
[00:35:10.190] duro Entonces se anticipa y lo lee y muchas veces es lo mismo Entonces eso
[00:35:14.550] hace que sea muy rápido la lectura de datos en ese sentido pues
[00:33:41.269] recomendamos por ejemplo los procesadores de Intel Core i5 Core i7 y
[00:35:27.910] se que es más que todo para servidores y en amd uno que se llama el
[00:35:35.280] opteron la memoria RAM sabemos todos que entre más memoria RAM pues mucho más
[00:35:41.790] rápido hacer el computador porque no tiene que ir a utilizar el disco duro de
[00:35:46.630] almacenamiento temporal ahora si al servidor se conectan muchos
[00:35:51.670] usuarios no sé 20 30 entonces va a necesitar más memoria RAM entonces por
[00:35:58.790] eso está la flechita hacia arriba pues entre más mejor también dependiendo de
[00:36:03.230] la cantidad de usuarios que se conecten la velocidad de la memoria
[00:36:09.550] RAM normalmente los computadores nuevos traen ram de altas velocidades entonces
[00:36:15.109] pues si uno cum un computador nuevo pues verificar que la velocidad Pues si esté
[00:36:21.309] óptima el disco duro en este cuento de las bases de datos el disc duro es muy
[00:36:28.270] crítico porque toda la información de la base de datos está guardada en el disco
[00:36:31.990] duro entonces una base de datos por ejemplo de un
[00:36:36.150] giga va a tener que subirse del disco duro a la memoria Entonces el disco duro
[00:36:42.510] en este momento cuando está leyendo puede ser el cuello de botella entonces
[00:36:46.910] por eso recomendamos que mínimo la velocidad del disco duro sea 7200
[00:36:51.550] revoluciones por minuto si es un
[00:36:56.510] servidor un servidor de datos pues como tal entonces normalmente puede tener
[00:37:08.710] mejore mucho si tiene dos discos duros mejor
[00:37:12.190] por qué Porque en uno puede estar el sistema operativo o sea Windows
[00:37:16.510] normalmente está haciendo cosas y está leyendo el disco duro grabando en los
[00:37:20.750] temporales y el motor de base de datos También necesita hacer eso entonces
[00:37:25.270] podemos definir que un disco duro sea para el sistema operativo y otro disco
[00:37:29.430] duro sea para el motor de bases de datos todas estas características que
[00:37:35.270] hemos visto hasta ahora de sistema operativo y Hardware van a mejorar mucho
[00:37:01.150] el desempeño pero se va a notar mucho No solo con un usuario sino que cuando se
[00:37:45.589] conecten cinco se va a notar que no hay desmejora en el desempeño que eso es lo
[00:37:52.670] que normalmente sucede cuando un computador presta el servicio a un
[00:37:56.510] usuario es muy rápido un un s servidor puede ser igual de
[00:37:59.950] rápido que a un computador normalito pero si hace computador normalito se le
[00:38:04.109] conectan 10 usuarios pa se cae el desempeño pero al servidor normalmente
[00:38:09.550] sigue igual porque ya tiene todas esas configuraciones para prestar servicio a
[00:38:18.319] usuarios bueno para los que se conectan por internet Entonces el desempeño
[00:38:24.030] también nos puede jugar aquí también hay que
[00:38:29.230] analizarlo vamos a mirar acá el gráfico tenemos internet tenemos acá un
[00:38:36.349] cliente tenemos un servidor para que ese cliente se conecte hacia el servidor de
[00:38:44.309] cont pye necesita primero un canal de subida o sea del cliente que es un
[00:38:52.109] portátil o un computador de escritorio necesita hacer una petición la cual pasa
[00:38:57.150] por por internet y esa petición le llega hasta el servidor y el servidor sube la
[00:39:03.550] respuesta al internet pasa trá de internet y baja hacia el cliente con
[00:39:10.430] nuestros proveedores que tenemos de internet telmes une pv
[00:39:15.950] etcétera normalmente le siempre le dicen a uno no usted contrata la velocidad de
[00:39:20.950] bajada la velocidad bajada es 4 mbit por segundo 10 20 pero nunca le mencionó la
[00:39:27.829] velocidad de subida Y en este caso que estamos trabajando en las dos
[00:39:32.030] direcciones la velocidad de subida es crítica porque va a marcar el desempeño
[00:39:36.790] en la cual nos vamos a conectar los clientes a los servidores y vamos a
[00:39:45.670] velocidad de bajada le dicen a uno es de cu y la velocidad de subida que nunca le
[00:39:51.190] dicen Eh puede ser por ejemplo punto 6 o puede ser uno o puede ser dos
[00:39:41.309] normalmente la velocidad de subida es mucho más pequeña que la de bajada
[00:40:04.109] porque miren que todos los usuarios que usan internet siempre bajan bajan bajan
[00:40:08.790] programas bajan fotos y cuando uno sube de pronto digamos en Facebook uno sube
[00:40:14.710] la foto ahí es donde está la velocidad de subida lo que se demore de aquí en mi
[00:40:18.430] computador a subir la foto a Facebook miren que si yo bajo luego esa foto baja
[00:40:23.309] mucho más rápido de lo que subió porque el canal de bajada siempre es mucho más
[00:40:28.589] amplio entonces supongamos que estamos en conta pyme aquí en el cliente y
[00:40:34.910] solicita un informe digamos que el informe es en una base de datos grande y
[00:40:40.069] es un informe grande entonces contapyme hace una petición la
[00:40:47.190] petición es muy pequeñita miren que aquí La Barrita es delgadita y cabe por el
[00:40:51.910] canal de subida entonces la petición del cliente hacia internet pasa rápido
[00:40:57.910] porque es una petición chiquita cuando llega al Canal del
[00:41:02.790] servidor pueden haber más clientes conectados haciendo otro tipo de
[00:41:07.190] peticiones entrar a un catálogo hacer una operación y normalmente esas
[00:41:12.069] peticiones también son pequeñas y como el canal de bajada es amplio entonces
[00:41:17.230] por ahí caben muchas peticiones y es muy rápido pero cuando el servidor de
[00:41:22.710] F el servidor de contapyme que está aquí instalado en el servidor por medio el
[00:41:27.829] motor de base de datos fivir empieza a responder esas peticiones miren que el
[00:41:32.910] canal de subida que tiene el servidor hacia internet es muy pequeño entonces
[00:41:37.190] Esas peticiones se vuelven ahí un cuello de botella si es para un cliente que
[00:41:41.670] hizo una petición grande esa petición grande no cabe entonces tiene que
[00:41:45.109] mandarla como por pedazos Entonces el cliente tiene un canal ancho
[00:41:50.309] de bajada Pero tiene que esperar que todo pase por este canal pequeñito de su
[00:41:54.990] vida y si a eso se suma que había varios clientes haciendo peticiones a la vez
[00:41:59.630] Entonces se vuelve ahí como una cola de peticiones Entonces el internet que
[00:42:04.670] teníamos de 4 megas que uno dice que es muy bueno pero con una velocidad de
[00:42:08.710] subida de punto 6 ya se vuelve malo entonces ahí Tenemos que tener en cuenta
[00:42:14.550] cuando contratemos nuestro servicio de internet aclararle al proveedor Bueno
[00:42:20.589] usted Qué velocidad de subida me va a dar para saber si me sirve o no me sirve
[00:42:25.710] Entonces nosotros aquí tenemos esta recomendación para el servidor de datos
[00:42:31.030] la velocidad de bajada 4 mbit es buena si es más mucho mejor y la velocidad de
[00:42:39.190] subida que sea mínimo de 2 megabits porque es que esa es la
[00:42:43.870] velocidad crítica la velocidad de subida del servidor O sea que si nos dan más
[00:42:48.910] mejor pero que sea por lo menos dos por ejemplo nosotros acá en insoft hemos
[00:42:54.109] hecho las pruebas de Test los test que hace uno internet y nos ha dado 2.5 que
[00:43:00.309] es una buena velocidad y en el cliente la velocidad
[00:43:04.870] de bajada miren que la velocidad bajada del cliente 2 megabits puede ser igual a
[00:43:09.549] la que tenga el servidor de subida porque en esa canal de
[00:43:14.150] comunicación va a operar es la de menor Entonces si el servidor tiene dos
[00:43:18.470] Entonces los clientes pueden tener dos la subida puede ser pun 5.6 porque
[00:43:25.950] los clientes cuando hacen peticiones o envían datos pues es más bien poco poco
[00:43:30.990] el grosor de los datos que envía Entonces el cuello de botella con
[00:43:34.670] relación al internet está de en el servidor y con relación a la velocidad
[00:43:39.549] de suba si es difícil mejorar la velocidad
[00:43:43.190] de subida en el servidor Porque ya teníamos un internet contratado y no nos
[00:43:47.710] podemos cambiar la empresa no tiene con qué pagar un internet más rápido
[00:43:52.230] entonces podríamos considerar otras opciones como la de escritorio remoto o
[00:43:57.270] la de Tin stof Ya pues la mayoría saben cómo funciona recordemos que el Tin stof
[00:44:03.349] lo que yo hago es que el cliente cuando se conecta al servidor realmente se está
[00:44:13.069] Entonces de esa forma lo que fluye por el canal de comunicación no son los
[00:44:16.589] datos sino como la fotico de lo que yo voy haciendo en el servidor Entonces eso
[00:44:22.589] es mucho más rápido entonces ahí habría que evaluar
[00:44:27.430] Qué opciones tenemos con relación al internet si trabajar del cliente hacia
[00:44:08.510] el servidor utilizando en la caja de conexión la IP o si esta es muy lenta y
[00:44:37.549] no pudimos mejorarlo trabajar con escritorio
[00:44:44.040] remoto Bueno ahora vamos a mirar las mejoras que le podemos hacer al motor de
[00:44:52.480] fiv cuando uno instala el motor de base de datos en un servidor él instala unas
[00:44:59.069] configuraciones por defecto porque un programa eh
[00:45:05.589] Normalmente se instalan múltiples computadores y todos con distintas
[00:45:09.589] características unos con 1 gig de ram otros con cu otros con ocho otros con
[00:45:14.710] procesadores de varios núcleos otros con de un núcleo Entonces cuando F se
[00:45:21.069] instala instala con unas configuraciones por defecto y esas configuraciones por
[00:45:26.069] defecto norment son para los computadores más bajos de menor
[00:45:32.109] característica entonces uno puede afinar esas configuraciones para mejorar el
[00:45:37.990] desempeño del motor de bases de datos entonces Esas configuraciones se
[00:45:44.270] hacen en un archivo llamado f.com ya ahorita vamos a mirar Dónde se
[00:45:50.750] encuentra qué otras mejoras podemos hacer con relación a la base de datos es
[00:45:57.270] aplicar utilidades de mantenimiento miren que normalmente en una empresa
[00:46:02.870] están creando operaciones borrando creando terceros mirando informes o sea
[00:46:08.270] están haciendo un mundo de operaciones contra la base de datos esa base de
[00:46:12.150] datos con el tiempo se va haciendo algo que se llama
[00:46:17.750] fragmentando por ejemplo la base de datos tiene 10 terceros y le borran
[00:46:24.230] uno entonces ya no está ese tercero pero si uno va y mira el tamaño físico
[00:46:29.309] de la base de datos no disminuye de tamaño siempre vas
[00:46:34.190] creciendo esa es una estrategia para que las bases de datos sean rápidas pero
[00:46:38.430] cuando uno les borra información ella simplemente marca el registro como
[00:46:42.349] borrado y no lo limpia Entonces ahí es donde se va fragmentando la información
[00:46:47.390] las bases de datos se van engordando entonces en el momento pues
[00:46:51.390] nosotros tenemos una tenemos dos formas de hacerle mantenimiento una es con el
[00:46:58.109] reindex no sé si ustedes ya han visto que esa opción que teníamos en la
[00:47:02.349] versión tres acá en la versión cuatro la tenemos
[00:47:06.630] tenemos disponible les voy a mostrar Por dónde
[00:47:12.160] está el reindex lo que hace es reconstruir los índices de las tablas
[00:47:17.829] Entonces esto ayuda a que mejore el desempeño es bueno hacerla no sé cada
[00:47:23.710] mes cada dos meses o cuando Note puso como un poco
[00:47:31.150] lento cces por acá por esas opciones de mantenimiento siempre las vamos a
[00:47:35.630] encontrar disponibles por el menú servidor y aquí tenemos la opción
[00:47:41.270] reindex ahí simplemente la ejecutamos le damos reindexar y es un proceso que se
[00:47:51.599] poco hay otra opción que teníamos que es la verificación física que ya va
[00:47:57.549] físicamente mejora revisa la base de datos esta opción en la versión 4
[00:48:03.190] todavía no la tenemos desarrollada la tenemos Pues en diseño
[00:48:07.589] eh más adelante la vamos a sacar en en un parche o en un nuevo Release pero por
[00:48:13.230] ahora lo que podemos hacer es hacer copia de seguridad y
[00:48:17.670] recuperarla porque cuando se hace la copia de seguridad la hacemos con un
[00:48:22.069] comando propio del motor de base de datos la cual la depura O
[00:48:28.510] sea hay dat de de borrado entonces realmente nos limpia eh vuelve y
[00:48:36.069] reconstruye los índices y cuando uno recupera la base de datos incluso la
[00:48:40.910] copia de seguridad disminuye de tamaño entonces por eso es recomendable cada
[00:48:45.549] cierto tiempo dos meses hacer una copia de seguridad y ahí
[00:48:50.829] mismo recuperarla lógicamente pues deberían estar todos los usuarios
[00:48:58.200] y esta otra opción digamos que no es para mejorar el desempeño sino para no
[00:49:01.789] bajarlo y hemos notado Pues en algunas bases de datos que hemos revisado que de
[00:49:06.270] pronto han cometido este pequeño error y es el sistema tiene algunos campos de
[00:49:13.109] observaciones o notas y uno ahí puede por ejemplo pegar información de por
[00:49:18.950] allá hay un folleto de Word viene y la pega si esa información es demasiado
[00:49:24.950] grande todo eso va a ha serer que crezca la base de datos de tamaño entonces va
[00:49:32.990] perder desempeño otro caso es que llegan y
[00:49:35.390] dicen Bueno qué rico Ya contapyme en la información de los terceros tiene la
[00:49:40.750] foto vamos a tomarle la foto a todos los empleados y le toman la foto con la
[00:49:45.829] cámara Pues de 10 megapixeles de 12 y esa foto tal cual la tomaron vienen y la
[00:49:51.789] suben y la foto pesa 5 megas y tomaron 50 fotos multipliquen Entonces ese
[00:49:58.870] tamaño engorda en la base de datos Y la foto en en la información de los
[00:50:04.270] terceros sale pequeñita Entonces cuál es la recomendación a esa foto que tomaron
[00:50:08.950] con la cámara y está en un archivo jpg de pronto aplicarle con algún
[00:50:15.309] programita y reducirle el tamaño y una foto que pesaba 5 megas que es
[00:50:21.069] gigante y reducirla a 100k a 80k igual la foto a 100k se ve muy bien Quién es
[00:50:27.870] la persona Entonces es una recomendación que las fotos de los terceros o las
[00:50:34.710] fotos de los elementos de control el logotipo de la empresa todos esos
[00:50:39.309] archivos que uno sube recomendable que sean editados y
[00:50:44.030] bajarles el tamaño para que el tamaño de la base de datos no crezca tanto y así
[00:50:48.789] las copias de seguridad también van a quedar
[00:50:54.839] pequeñas bueno vamos a mirar entonces las configuraciones que les comentaba de
[00:51:01.109] de fibber que es nuestro motor de base de datos de contap agin y hay tres
[00:51:07.470] parámetros clave que ayudan a mejorar el desempeño del motor de base de datos
[00:51:13.349] Pero antes de modificarlos pues debemos tener presente las características
[00:51:17.430] físicas de nuestro computador para poder afinar el valor que le vamos a asignar
[00:51:22.470] Entonces los tres parámetros que vamos a modificar de nuestro archivo de f.com
[00:51:28.309] que tiene muchas configuraciones pero tres son las claves son cpu affinity Max
[00:51:35.789] este tiene que ver con los núcleos del procesador é por defecto utiliza un
[00:51:40.710] núcleo entonces tendríamos que verificar nuestro procesador cuántos núcleos tiene
[00:51:45.549] y así lo podemos afinar ya vamos a ver en detalle cada
[00:51:49.710] uno default de BK page este le permite A F saber Cuánta memoria RAM va a utilizar
[00:51:59.990] por cada base de datos que abra entonces también la podemos mejorar y el tem
[00:52:07.589] directory también lo podemos mejorar porque este es un directorio de trabajo
[00:52:12.670] temporal que cuando él ya se le acaba la ram que le asignamos porque abrió
[00:52:17.270] consultas muy grandes utiliza el disco duro para hacer ciertos
[00:52:21.510] procesos Entonces si utilizamos el disco duro c por por ejemplo y ahí es donde
[00:52:28.270] Windows Está también trabajando y lo mantiene ocupado y F también lo va a
[00:52:32.950] ocupar Entonces se puede volver un pequeño cuello de botella Entonces si
[00:52:36.870] tenemos un disco duro adicional podríamos decirle a f que no
[00:52:41.270] entonces va a estar más desocupado para que él
[00:52:47.030] trabaje lo que sí hay que tener en cuenta es que hay veces que los discos
[00:52:50.390] duros llegan particionados o sea es un solo disco duro y uno va y mira y
[00:52:54.670] aparece c y d O sea que el desempeño como es un solo disco duro pues es como
[00:53:00.630] si fuera una sola unidad Entonces tenemos que tener presente que si
[00:53:03.990] hacemos este temp directory sea físicamente a otro disco duro eso
[00:53:08.630] también lo podemos verificar desde aquí de nuestro
[00:53:12.069] Windows bueno la ubicación del archivo que vamos a configurar Normalmente se
[00:53:17.150] encuentra en archivos de programa o program file fb fbar 25 y se llama
[00:53:27.750] fb.com cada vez que hagamos cambios en este
[00:53:29.510] archivo debemos cerrar el servicio de F y volverlo a
[00:53:35.950] subir para el sub ya vamos a mirar cómo lo
[00:53:40.470] lo hacemos vamos a entrar en detalle en
[00:53:42.670] estas tres configuraciones cpu affinity
[00:53:46.870] Max cantidad de núcleos del procesador que usará
[00:53:51.470] F Entonces si el servidor de datos se usa principalmente como
[00:53:58.950] servidor de datos de cont pime agroin o sea está dedicado solo a los datos de
[00:54:05.109] cont pime agroin Entonces esta característica de cpu affinity Max se le
[00:54:11.230] pueden poner todos los núcleos que tenga nuestro procesador eemplo si el
[00:54:14.990] procesador tiene ocho le podemos asignar los
[00:54:17.829] los ocho pero si no es así digamos que ese
[00:54:20.789] servidor Ahí trabaja una persona o tienen otro tipo de programas Entonces
[00:54:26.030] si tien o procesadores ocho núcleos podríamos decirle que F use cuatro para
[00:54:40.119] Pues trabaja usa cuatro pero si el servidor está haciendo otras cosas puede
[00:54:45.230] utilizar los ocho incluso los cuatro que tenía f reservados
[00:54:51.069] s esta opción entonces aparece como número
[00:54:56.510] número affinity Max el signo número allá en el
[00:54:59.549] archivo de configuración quiere decir que va que no se está haciendo ningún
[00:55:04.510] cambio y entonces él utiliza el valor por defecto y el valor por defecto es un
[00:55:09.870] núcleo les voy a mostrar Cómo ver cuántos núcleos tiene un computador
[00:55:16.150] recuerdan la el administrador de tareas de Windows Aquí hay una pestaña que se
[00:55:22.549] llama rendimiento y ahí podemos ver por
[00:55:25.670] ejemplo aquí aquí en mi computador tenemos cuatro núcleos Entonces de esa
[00:55:30.549] forma yo ya sé este computador tiene cuatro
[00:55:36.839] núcleos Perdón por acá una
[00:55:43.920] opción bueno no bueno este computador tiene cuatro
[00:55:49.470] núcleos entonces podemos hacer la configuración para que F utilice los
[00:55:53.630] cuatro o utilice dos digamos que no lo dejamos en uno pues porque estaríamos
[00:55:59.390] desaprovechando el potencial físico que tiene el computador entonces pongámoslo
[00:56:03.230] en dos o en cuatro normalmente todo lo que tiene que ver con computadores van
[00:56:08.549] múltiplos de dos Entonces no se pueden utilizar tres sería 1 2 4 8
[00:56:17.359] etcétera entonces si el computador tiene varios núcleos si yo
[00:56:22.910] quiero usar dos en cpu affinity Max debo asignarle el valor
[00:56:27.230] TR si quiero que use cuatro núcleos le asigno el valor 15 si quiero que use
[00:56:33.349] ocho núcleos le asigno 255 Y si quiero que
[00:56:38.270] use núcleos le asigno este valor de 65300
[00:56:45.029] 65300 535 vamos a mirar dónde lo
[00:56:47.990] asignamos entonces voy a abrir acá el explorador de archivos de Windows
[00:56:55.349] vamos a archivos de
[00:57:00.430] f f 2.5 y ahí vamos a encontrar el archivo
[00:57:08.839] f.com cuando le damos doble clic voy aquí abrir otro para que nos salga la
[00:57:14.990] ventanita cuando le damos doble clic pues sale esta opción porque normalmente
[00:57:19.190] ese archivo no está asociado a ningún programa Entonces lo podríamos asociar
[00:57:27.069] simplemente con el bloc de
[00:57:28.710] notas Bueno yo acá pues ya lo tengo asociado simplemente le doy doble clic
[00:57:34.190] Sí con el bloc de notas ni con Word ni con el wordpad porque el bl Este es un
[00:57:39.349] archivo de texto plano y necesitamos que el programa que lo grabe lo grabe como
[00:57:43.430] archivo plano Entonces lo abrimos con el blog de
[00:57:52.400] buscar vamos a buscar cpu
[00:57:58.720] Entonces por aquí nos apareció cpu affinity Max cuando recuerden cuando
[00:58:04.630] tiene el signo número adelante quiere decir que no se está asignando ningún
[00:58:09.510] valor a esta configuración él tomará la por defecto Entonces le debo quitar el
[00:58:15.230] signo de número y le pongo por ejemplo 15 decíamos que
[00:58:24.150] 15 es para que use cu núcleos Entonces le podríamos en este
[00:58:31.069] caso dejar ese valor de 15 y le decimos guardar ya Hi el cambio
[00:58:41.230] pero todavía no lo Entonces qué debo hacer
[00:58:49.520] abro el administrador de servicios
[00:58:56.319] aquí ya lo abrí administrador de servicios y aquí en la lista de los
[00:59:06.359] F acá simplemente le doy detener voy a cerrar con pye antes de
[00:59:19.880] bloquea ent le decimos detener y le decimos
[00:59:29.400] Qué ventajas tiene utilizar varios procesadores si está trabajando un solo
[00:59:33.510] usuario y está haciendo un proceso y tenía un solo procesador
[00:59:38.670] Entonces le va a responder Pues digamos que una velocidad buena Pero si ya hay
[00:59:42.990] dos usuarios conectados o tres y solo tenía un procesador ese procesador pues
[00:59:50.150] se va a demorar respondiéndole a todos pero si utilizo varios procesadores le
[00:59:55.190] va a responder a todos de una forma muy rápida Entonces esta característica de
[01:00:01.190] cpu affinity nos permite eso decir Cuántos procesadores puedo utilizar
[01:00:05.829] fivir de los que yo tengo en mi computador vamos a pasar a default de
[01:00:12.390] bkch page es la cantidad de memoria RAM reservada por base de datos ahí debemos
[01:00:20.990] tener en cuenta que contap agroin cuando uno lo abre un área de trabajo él Abre
[01:00:26.630] tres bases de datos Y si uno Abre una segunda área de trabajo ya abre una Por
[01:00:34.109] qué en este caso Abre tres porque el sistema tiene dos bases de datos de
[01:00:38.670] configuraciones y la del área de trabajo entonces por
[01:00:44.349] eso siguientes veces solo va adicional este default de BK check page
[01:00:51.630] lo debemos configurar según la memoria RAM que tenga el computador
[01:01:02.200] computador que tiene aquí es 8 GB no 8 megas supongamos que tenemos un
[01:01:08.150] computador que tiene 8 GB de memoria RAM entonces podríamos
[01:01:14.150] asignarle este valor de 204800 a este parámetro de default de
[01:01:21.309] Bach Eso quiere decir que va a reservar unos 800 megas
[01:01:27.990] por cada base de datos entonces para un área de trabajo que abre tres bases de
[01:01:34.230] datos va a reservar 2.4 GB si tenemos dos áreas de trabajo abiertas a la vez
[01:01:40.950] Entonces ya va a gastar 3.2 GB Pero si por ejemplo el computador no
[01:01:47.870] tiene 8 GB sino que tiene cuatro o de pronto tiene seis Entonces en este
[01:01:54.789] parámetro ya no utilizaríamos un valor tan grande sino que le podríamos quitar
[01:01:58.750] aquí un cero o sea bajarlo al 10% y estaría utilizando unos 80 megas por
[01:02:06.549] cada una de las bases de datos que abra y el valor que trae el por defecto
[01:02:12.510] es apenas de 20,48 o sea 8 megas Entonces miren que s Es recomendable
[01:02:18.750] configurar este porque le vamos a subir de 8 megas por ejemplo a 80 o a
[01:02:25.910] 200 y esto podría mejorar mucho la velocidad también Cuando hacemos
[01:02:31.309] procesos complicados o sea le pedimos a cont py que haga de pronto un informe
[01:02:36.309] que tiene que hacer muchos cálculos o hay varios usuarios a la vez entonces
[01:02:41.870] por eso debemos tener muy en cuenta Cuánta Ram tenemos en nuestro
[01:02:45.990] computador Y cuánta tenemos Cuánta le podemos asignar a
[01:02:51.870] f vamos a mirar por acá por sobre mi equipo le decimos
[01:03:01.230] propiedades entonces aquí nos muestra las características y aquí dice memoria
[01:03:06.789] RAM instalada 4 Gb Entonces yo ya sé que si
[01:03:10.430] es de 4 Gb voy a utilizar este valor Entonces vamos a
[01:03:17.309] buscarlo allá en el archivo de configuración de
[01:03:28.119] y vamos a buscar 2048 que es el valor que tiene por
[01:03:34.029] defecto ent si quiero subirle simplemente le quito el signo número y
[01:03:38.750] le agrego acá el valor que quiero cerramos guardamos los cambios y
[01:03:45.470] igual tendríamos que detener el servicio de
[01:03:49.710] de F podríamos hacer todos los cambios a la
[01:03:52.349] vez listo aquí es porque estamos explicando entonces uno por uno volvemos
[01:03:57.349] a subir el servicio notemos que aquí dice el estado del servicio dice
[01:04:05.109] iniciado o sea que ya tomó el cambio que acabamos de
[01:04:12.760] hacer estos valores que hay acá normalmente pues son estos tres o
[01:04:18.029] también podríamos utilizar estos dos entonces de acuerdo pues a la memoria
[01:04:22.710] que tenga el computador disponible Por ejemplo si si tiene seis entonces
[01:04:27.309] podríamos utilizar de pronto este es bajito este
[01:04:32.670] 20,480 podríamos utilizar 81,920 ahí tendríamos que hacer como pruebas pero
[01:04:40.069] digamos que los recomendables son estos tres y en Casos intermedios podríamos
[01:04:54.640] dos ahora vamos a este si simplemente es asignarle a la
[01:05:06.559] variable sea un disco duro Ojalá diferente al del sistema operativo para
[01:05:11.789] que el desempeño si se note esto de que si se note son pues
[01:05:17.549] milisegundos pero todos en conjunto se pueden convertir en segundos incluso
[01:05:22.309] podríamos asignarle varios discos eh d c etcétera igual está en nuestro archivo
[01:05:30.710] de configuración de fiver vamos a
[01:05:38.680] buscarlo entonces simplemente le quitamos el signo número y le escribimos
[01:05:45.190] el la unidad que queremos Yo no le pongo e porque no
[01:05:50.829] tengo disco e Solo tengo d tem
[01:05:56.309] cerramos nuestro archivo lo guardamos como hicimos un cambio
[01:06:06.760] servicio y volverlo a
[01:06:14.520] subir y ya podemos abrir cont pime Entonces él va a tomar los cambios
[01:06:28.200] Bueno les digo les cuento que estas configuraciones si ustedes toman tiempo
[01:06:32.029] antes de hacerlas y luego de hacerlas pueden mejorar segundos o sea hicimos
[01:06:38.029] una prueba en un servidor de 8 gbas de ram con una tabla de referencia Cruzada
[01:06:45.309] y pasó de un minuto 35 segundos a un minuto 20 ustes dirán que la mejora no
[01:06:53.670] es significativa pero si hay 10 usuarios
[01:06:56.390] conectados haciendo el mismo informe sin estas configuraciones el desempeño se
[01:07:02.750] caería mucho en cambio con estas configuraciones el desempeño Se va se va
[01:07:08.069] a mantener casi igual entonces ahí donde sí se notaría cuando hay múltiples
[01:07:11.670] usuarios trabajando en Pues que abrió contapyme pues la
[01:07:16.910] prueba de tiempo pues no la podemos hacer por cuestiones de que la sesión es
[01:07:25.680] Bueno vamos a pasar aquí a unas recomendaciones finales y ya luego
[01:07:32.599] preguntas cuando uno instala el servidor de datos de contao agrin él instala el
[01:07:38.670] motor de bases de datos F ustedes ven que se lanza la instalación y instala la
[01:07:46.510] versión 2.51 que es la última versión que hay
[01:07:49.109] del motor de base de datos fiber y cont
[01:07:57.960] requiera esa porque como nosotros hicimos el desarrollo y Tratamos de
[01:08:02.870] utilizar todo el potencial de F utilizamos características que salieron
[01:08:07.670] en la versión 2.5 que no tiene la versión 2.1 ni la dos ni la
[01:08:13.710] 1 entonces si en una empresa ya está instalado fivir pues vamos a tener que
[01:08:20.309] pasarlo al 2.5 para que contap funcione bien pero ahí tenemos un Lio
[01:08:26.269] y cuál es el io aquí ya viene con el siguiente punto antes de instalar cont
[01:08:30.829] pim agroin server verifique que no está instalado fivir si ya está instalado y
[01:08:36.789] la versión es menor a la 2.5 a la que requi agroin contapyme averigüe Qué
[01:08:43.229] programa lo está usando y contacte los desarrolladores o la empresa que lo
[01:08:48.669] vende para poder pasar esa base de datos de la versión en la que esté a la nueva
[01:08:55.990] versión Por qué hay que hacer esto supongamos
[01:08:58.870] que estaba instalada la versión 2.1 y la base de datos Está construida
[01:09:07.510] con la versión 2.1 si simplemente desinstalamos fivir e
[01:09:12.630] instalamos el nuevo motor de la 2.5 y el otro programa que utilizaba que
[01:09:19.789] ya estaba instalado abre la base de datos puede que trabaje bien pero
[01:09:25.430] algunas características puede llegar a fallar puede que por ejemplo no muestre
[01:09:29.669] las tildes adecuadamente o las eñes porque ese fue un cambio de los que
[01:09:34.749] ellos hicieron los que crearon f en la versión
[01:09:39.309] versión 2.5 Entonces lo recomendable es que esa
[01:09:44.309] empresa o ese los desarrolladores de ese programa cojan la base de datos que está
[01:09:49.550] en 2 punto en 2.1 y la pasen a 2.5 y ahí ya podíamos trabajar Eso es muy sencillo
[01:09:58.550] los creadores de fib simplemente recomiendan que en la versión 2.5 2.1 o
[01:10:05.750] sea antes de desinstalar generen una copia de
[01:10:09.430] seguridad instalemos la versión 2.5 y se recupere esa copia de seguridad eso es
[01:10:15.470] Pues lo más sencillo pero tenemos que garantizar con los de ese programa si
[01:10:19.790] eso es suficiente porque si llegamos a
[01:10:23.910] instalamos de pronto le podemos hacer un daño al dueño de la empresa Mejor
[01:10:28.470] dicho entonces hay que tener cuidado con con la instalación de de esas versiones
[01:10:35.030] de F bueno otro tips Sito aquí de
[01:10:39.590] recomendaciones es cuando conectamos habilitamos a contapyme para
[01:10:46.229] que trabaje hacia internet debemos abrirle el Firework a Windows porque
[01:10:51.910] Windows tiene bloqueado todos los programas que pidan salir a internet él
[01:10:55.630] piensa que son virus entonces dice bloqueado o si es un
[01:11:01.870] antivirus bloqueado entonces debemos ir al fir de Windows y decirle que vamos a
[01:11:08.709] permitir que el programa cont pye o agrin servidor utilicen el puerto
[01:11:14.830] 3050 Ese es el puerto por el cual se va a comunicar los clientes hacia nuestro
[01:11:20.470] servidor de datos puede que hayan en empresas que por
[01:11:25.870] no no se puede utilizar el 3050 o cualquier otra cosa o tienen que
[01:11:30.229] redireccionar a otro Puerto Entonces es muy sencillo
[01:11:35.270] simplemente se puede entrar al archivo de configuración que estamos viendo
[01:11:39.310] ahora de F y hay un em que se llama Remote server por y le pueden cambiar el
[01:11:44.550] puerto vamos a mirarlo nuestro f.com
[01:12:01.360] por aquí está dice Remote server server service por defecto 3050 si lo
[01:12:08.510] necesitamos cambiar simplemente le quitaríamos el signo número y le ponemos
[01:12:14.070] el uno pero entonces los clientes que se
[01:12:16.950] conecten tienen que conectarse con este 3051 porque ellos van a hacer la
[01:12:23.149] petición por el 3050 eso pues en el caso que lo requieran que
[01:12:27.510] es muy muy eventual ya lo podríamos revisar con soporte para que les den
[01:12:41.520] asistencia Bueno hasta acá pues termina como esta parte de la presentación Vamos
[01:12:46.990] a continuar con algunas preguntas Permítame yo por acá Busco
[01:13:13.920] a ver Denme un minuto por acá yo voy leyendo las preguntas que hay varias de
[01:13:32.520] por acá Okay thank
[01:13:43.560] you Bueno les voy contando por acá mientras revisamos las preguntas esta
[01:13:48.629] presentación este archivo de Powerpoint se va a poner en internet disponible
[01:13:54.229] para ustedes para que les sirva de guía la presentación que también se ha
[01:13:59.070] grabado también se va a poner disponible Así que en cualquier momento pues pueden
[01:14:09.000] momento por acá dice la IP debe ser fijas o no es
[01:14:14.990] necesario digamos que pueden haber dos respuestas si la ip es fija pues va a
[01:14:20.790] ser mucho más fácil porque si yo estoy en una empresa y pongo una IP fija
[01:14:25.350] Solicito a telmes a une que me den una IP fija cada vez que yo me conecte desde
[01:14:30.470] un cliente Entonces siempre se va a conectar a la misma IP entonces pues va
[01:14:36.030] a ser muy fácil pero si la ip es dinámica Entonces el computador servidor
[01:14:41.990] de datos Mientras esté prendido va a tener la misma IP pero cuando se apague
[01:14:46.590] y se vuelva a prender ent el computador le pide a telmes a une o al que
[01:14:51.390] corresponda dice deme una IP puede que le dé la misma puede que le dé una nueva
[01:14:56.870] c si le da una nueva los clientes deben conocer que hay una IP nueva para
[01:15:02.870] conectarse Entonces digamos que lo recomendable es tener una IP fija por
[01:15:07.350] facilidad pero si es dinámica y cada vez cambia pues simplemente sería conocerla
[01:15:16.280] vez sería bueno tener un módulo de administración de usuarios como el
[01:15:20.510] administrador de tareas de Windows bueno Pues acá sí habría que
[01:15:25.950] mirar un poco porque cont pime pues tiene algunas opciones de mantenimiento
[01:15:31.590] que hemos ido y de control Pues de como administración que hemos ido colocando
[01:15:36.590] en la parte de servidor H de pronto podríamos revisar Y
[01:15:43.310] de pronto si nos recomiendas algunas opciones podríamos mirar Cuáles agregar
[01:15:59.360] para los que no tienen Windows server sino Windows 7 todo lo que hemos visto
[01:16:04.070] hoy Aplica para cualquier sistema operativo incluso para Windows XP de
[01:16:08.550] pronto Puede que haya características menos características más pero miren que
[01:16:12.470] la parte física memoria RAM disco duro aplicas es Windows XP la configuración
[01:16:18.149] de fib también aplica Windows 7 XP server
[01:16:31.520] bueno por acá nos dicen que tiene car pesqu y que molesta cuando va abrir
[01:16:36.030] agrino cont pyme porque los bloquea nosotros habemos este año y
[01:16:42.229] parte del año pasado hemos tenido como como ese problema con los antivirus Y es
[01:16:48.030] que los antivirus tienen algo que se llama Dj recordar el
[01:16:53.830] nombre falsos positivos tuvimos unos días en los que
[01:16:59.430] el kpes y otros antivirus nos estaban bloqueando los las dlls de contra pyme
[01:17:07.030] incluso borrás
[01:17:08.550] borrás entonces acá pues uno de nuestros
[01:17:12.149] colaboradores encargados se tomó la tarea de escribirle a kpes ellos
[01:17:16.709] respondieron sí señores con mucho gusto envíeme en la dll les enviamos la dll y
[01:17:22.550] nos dijeron sí es un falso positivo en la próxima actualización de carpes sale
[01:17:27.470] corregido y efectivamente salió corregido y pues nosotros tenemos a
[01:17:32.910] cerca de 200 o más dls entonces hay veces que hay alguna que otra que
[01:17:37.350] aparecen como falsos positivos apenas nosotros detectamos eso inmediatamente
[01:17:42.189] le escribimos a los desarrolladores del virus del antivirus y ellos hacen la
[01:17:46.990] corrección pero normalmente salen es en las actualizaciones Que ellos hacen si
[01:17:52.550] el cliente no actualiza el antivirus pues va a seguir bloqueado pero mientras
[01:17:56.790] mantenga el antivirus actualizado como nosotros vamos haciendo ese reporte
[01:18:00.669] Entonces se va a ir solucionando ese ese problema Y pues la otra opción es
[01:18:08.030] desactivarlo pues ahí sí es triste pero con hay antivirus que le hemos escrito y
[01:18:13.629] nunca hemos tenido respuesta de los antivirus eh más conocidos si hemos
[01:18:19.030] tenido la respuesta y solución por parte de ellos
[01:18:29.400] Por acá nos preguntan Cómo determinar los niveles de
[01:18:34.159] velocidad Bueno ahí esa parte pues una prueba que nosotros hemos hecho digamos
[01:18:40.030] sencilla es antes de hacer las cambios de configuración generar un informe que
[01:18:46.430] sea pesadito y tomarle el tiempo con un cronómetro hacer la configuración y
[01:18:51.990] volverle a hacer la prueba digamos que es una prueba simple de ver si la
[01:19:05.440] no por acá nos pregunta que el teof tiene costo y el escritorio remoto de
[01:19:13.709] Windows también Bueno sí desafortunadamente
[01:19:16.790] Estos son con Windows es un servicio que si uno se conecta desde un escritorio
[01:19:21.830] remoto y alguien está trabajando lo desconecta o sea solo puede trabajar una
[01:19:25.950] persona a la vez en un computador cuando son sistemas operativos servidores a
[01:19:31.270] veces traen dos o cinco ejecuciones depende del licenciamiento Entonces en
[01:19:37.070] este caso pues puede que sí toque comprar el team stof pero digamos que si
[01:19:41.950] uno compra el team stof que tiene x valor puede llegar a ser un costo mínimo
[01:19:47.990] con relación a la mejora en el desempeño o con tener que pagar un internet más
[01:19:53.430] costoso entonces ahí habría que buscar como un punto de equilibrio a ver qué
[01:19:57.910] qué es más beneficioso si mejorar el internet o utilizar un Team
[01:20:11.400] stof por acá me preguntan que si hay un orden para aplicar los procesos o lo
[01:20:18.470] puedo aplicar conforme quiera Bueno me imagino
[01:20:21.870] que es el orden de aplicar las configuraciones del servidor de del
[01:20:26.629] archivo de fb.com Yo podría ir a hacer los tres
[01:20:29.910] cambios a la vez bajo el servicio y lo subo de pronto acá yo lo mostré uno por
[01:20:34.590] uno pues por efectos de la explicación pero se puede hacer todos a la
[01:20:44.679] vez por acá nos preguntan Sería bueno que la verificación física de la base de
[01:20:49.229] datos sea automática y propio del sistema que no
[01:20:54.310] la la tenga que hacer el usuario la verificación que yo Les
[01:20:59.510] comento tenemos el el el reindex el reindex pues hay que ir a hacer
[01:21:05.310] simplemente ir a darle clic a la opción y decirle ejecutar ent va a reconstruir
[01:21:09.270] los índices son utilidades de mantenimiento que como decía se pueden
[01:21:12.750] hacer cada dos TR meses y la otra opción que en el momento
[01:21:17.910] no la hemos desarrollado que va a ser similar al rees simplemente ir activarla
[01:21:23.750] y decirle hacer verificación física digamos que es más más o menos
[01:21:29.910] automática eh Por ahora la podemos hacer como les
[01:21:32.550] decía hacer copia de seguridad y recuperarla pero en algún tiempo no no
[01:21:38.590] sé para cuándo estará lista esa opción vamos a tener la verificación física que
[01:21:44.270] sea automática O sea que el solito Determine y la haga pues es un poco
[01:21:48.270] difícil porque hay usuarios que pueden estar conectados y trabajando y es
[01:21:52.950] posible que estas opciones de de mantenimiento requieran que los usuarios
[01:21:57.350] estén desconectados entonces por eso sería mejor que digamos el administrador
[01:22:02.149] de sistemas o el responsable de cont pime agroin entre y la ejecute
[01:22:28.400] por acá pues hay unas preguntitas como un poco inconclusas con el Paint
[01:22:33.910] llevaría a bmp de pronto pues no entiendo como la
[01:22:38.830] finalidad de la pregunta el bmp es la extensión de los archivos que uno crea
[01:22:44.430] con el Pain pero no veo Ah bueno algo que sí
[01:22:49.149] Les recomiendo los bmp son archivos que cuando uno los graba quedan grandes
[01:22:54.470] entonces uno va a subir una foto de Paint normalmente quedan grandes cuando
[01:22:58.870] las graben recuerden darle mejor jpg y ojalá la editen con un programita
[01:23:04.390] que edite imágenes para que no solo Le bajen el peso de de tamaño físico sino
[01:23:10.270] el tamaño de la foto hay veces que las fotos son grandísimas pero necesitas que
[01:23:17.920] pequeñita por aquí me dicen y para la red por
[01:23:21.629] cableado bueno De pronto es algo que no est incluida en esta presentación pero
[01:23:25.669] les puedo hacer un pequeño resumen y es cuando estábamos en una intranet
[01:23:31.550] nosotros tenemos el servidor tenemos un switch Y tenemos los
[01:23:37.030] clientes en la actualidad hay tres velocidades de trabajo 10 100 y 1000 la
[01:23:45.590] de 10 ya son redes viejas son muy lentas yo creo que muy pocas empresas lo tienen
[01:23:51.510] y si lo tienen Pues están muy atrasados 100 la velocidad de 100 es la más común
[01:23:57.510] en todas las empresas O sea que entre el servidor y el switch y los clientes se
[01:24:03.510] van a conectar esa velocidad de 100 megabits por
[01:24:10.920] segundo Perdón 100 MB si vamos a pasar a una red de 1000 o
[01:24:18.790] sea de gigabit esa red de 1000 pues es mucho
[01:24:22.590] más rápido que la de 100 pero requiere qué que el servidor tenga
[01:24:28.550] una tarjeta de gigabit que el switche soporte la velocidad de gigabit que los
[01:24:36.510] clientes también tengan tarjeta de gigabit y que el cableado físico también
[01:24:43.310] sea soporte los la velocidad de gigabit creo que es categoría se o superior
[01:24:51.870] Entonces si la empresa tiene a 100 y tiene el switch y el cableado viejo Pues
[01:24:59.390] de pronto puede ser muy costoso pasar a gigabit entonces ahí tendrían pues como
[01:25:04.270] que evaluar si es una empresa que apenas va
[01:25:07.030] a empezar y va a montar el cableado puces Ah si uno le recomienda no Monte
[01:25:10.350] gigabit si va a comprar un servidor nuevo Pues cómprelo de una vez con
[01:25:13.990] gigabit porque de 100 a gigabit eso valdrá la tarjeta de red por ahí 20
[01:25:19.430] 30,000 pesos más entonces pues es mejor tener la lista de una vez la de gigabit
[01:25:41.239] a por acá hay bastantes
[01:25:49.520] preguntas Qué cuidados debo tener en cuenta para establecer una conexión
[01:25:53.709] clientes servidor la IP los puertos Firework F etcétera Y qué errores
[01:26:00.550] frecuentes se presentan estoy en ese caso explicar un poquito
[01:26:08.550] más bueno de pronto aquí como vimos fue como configuraciones de pronto no vimos
[01:26:13.470] como todo lo que implica poner un servidor de datos de cont pye a
[01:26:18.870] disposición para que trabaje correctamente en la red de pronto
[01:26:24.430] podríamos a esta presentación de pronto agregarle una o dos diapositivas eh con
[01:26:30.709] esa parte como de todos los todo lo que hay que tener en cuenta para poner un
[01:26:35.229] servidor de datos a punto entonces pues para no entrar
[01:26:40.030] ahorita como en esa explicación eh la vamos a dejar para incluirla en esta
[01:26:48.280] presentación la presentación no la pueden enviar a estos correos bueno eso
[01:26:52.910] ya con el ingeniero Alejandro vamos a cuadrarlo no sé si de pronto la pongamos
[01:26:57.629] en los recursos de distribuidores en internet o se las hagan llegar por
[01:27:01.830] correo ahí ya pues me pondré de acuerdo con
[01:27:09.400] él por acá qué recomendaciones para mejorar la velocidad en redes locales
[01:27:14.229] hamos hablado que se puede si tiene una red de 100 su
[01:27:25.960] y y las tarjetas de red es posible que el cableado que tengan ya lo soporte
[01:27:44.800] adecuada por aquí nos preguntan que si los computadores cliente también deben
[01:27:49.950] tener buena máquina procesador Ram Bueno hoy no hablamos de los computadores
[01:27:55.149] cliente siempre nos enfocamos en el servidor de
[01:27:58.229] datos Por qué nos enfocamos tanto en el servidor de datos Porque el servidor de
[01:28:02.990] datos normalmente puede atender a muchos usuarios a la vez 3 4 10 20 entonces se
[01:28:10.350] puede convertir en el cuello de botella y los servidores cliente pues
[01:28:14.990] normalmente como está trabajando es un solo usuario entonces a veces un equipo
[01:28:18.629] sencillo con Windows XP de pronto un procesador eh Windows Duo o corei 3 pues
[01:28:54.119] o más y con Windows XP o superior con
[01:28:59.070] Windows 98 la versión 4 no es compatible ni con Windows
[01:29:19.600] millennium Por acá nos preguntan que cómo
[01:29:23.030] cómo se si tengo abierto el puerto
[01:29:27.149] 3050 Bueno hay varias formas una puede ser desde un cliente hacerle algo que se
[01:29:33.270] llama un ping aquí al servidor y hacerlo por ese puerto si responde Entonces es
[01:29:39.350] que está abierto o la otra forma es estando aquí mismo en el
[01:29:45.280] servidor darle por acá la opción de fw y verificar si está incluido como
[01:29:55.920] firb de Windows por aquí abrí el firb de
[01:30:07.960] Windows a ver Buscar la
[01:30:14.800] opción permitir un programa una característica a través del F de
[01:30:20.750] Windows por acá yo creé F Aquí está le puedo decir
[01:30:28.070] detalles entonces aquí veo que tengo abierto el puerto 3050 y yo le asign el
[01:30:34.229] nombre de F aquí se le puede asignar el nombre que yo quiera puede ser contap
[01:30:38.390] server ag server F Lo importante es que el puerto esté abierto y que aquí sea
[01:30:52.239] tcp qué otro los programas manejan el fivir como software de base de datos
[01:30:58.070] para cuando vayamos a instalar contap agroin Bueno yo conozco
[01:31:05.990] eh acá en manizales hay otro que también es fuerte en la parte contable que se
[01:31:10.750] llama Mecano ellos también utilizan el motor de base de datos de
[01:31:15.910] fibber pero en el mercado pueden haber muchos programas muy variados
[01:31:24.510] no contabil pronto de otro tipo de
[01:31:27.510] administración o o por ejemplo de estos que hacen las
[01:31:33.590] revisiones de carros un programita que administra las la base de datos de
[01:31:39.870] revisiones y puede tener motor de de datos en F entonces ahí lo que habría
[01:31:44.510] que hacer es cuando uno antes de instalar puede entrar uno acá a la parte
[01:31:50.669] de programas y características el panel de control
[01:31:54.910] programas programas y características y verificar si está instalado F y ahí va a
[01:32:02.669] aparecer la versión Si vemos que la versión es inferior a 25 Entonces ahí
[01:32:08.669] tocaría ya hacer la el chequeo que yo les contaba verificar Qué programa ha
[01:32:13.790] instalado Qué características tiene quién lo
[01:32:17.669] desarrolló para que no no les vayamos a hacer un daño en esa empresa
[01:32:33.880] Por acá nos pregunta con el nombre de servidor no haría la
[01:32:45.199] pye Aquí vamos a decirle cambiar servidor miren que acá abajo hay unos
[01:32:50.430] ejemplos de qué puede ir aquí entonces puede de ir el nombre del servidor por
[01:32:56.270] ejemplo server porque estamos en una intranet y server es el nombre del
[01:33:01.270] servidor al que yo me quiero conectar también podría poner la ip de ese
[01:33:07.310] servidor y me conectaría a él ahora si es por internet Yo podría poner la
[01:33:13.470] dirección IP que tiene ese servidor hacia internet pública en internet o si
[01:33:20.270] es un servidor el cual tiene una dirección de dominio por ejemplo pueden
[01:33:28.719] esta miren que este es el servidor que tenemos aquí en insot Perdón
[01:33:34.709] local insot web.com Y si ustedes se conectan desde allá se van a conectar a
[01:33:40.030] este servidor y no están usando la dirección IP sino un nombre de dominio
[01:33:44.390] que los servidores de dominio internamente resuelven y encuentran la
[01:33:48.590] IP correcta para conectarse al servidor correcto
[01:33:57.159] el fivir Aplica para monousuario eh digamos que sí y no si es una
[01:34:05.070] instalación monousuario él internamente instala el
[01:34:08.109] motor de base de datos fber en bebido O sea no instala a fivir con todas sus
[01:34:14.830] características sino que lo instala es en la misma carpeta donde está el
[01:34:19.550] programa si yo instalo el motor de bases de datos fber
[01:34:23.830] Perdón agrino contapyme mon usuario instalado 5.1 no tengo ningún
[01:34:30.149] inconveniente cuando yo instal usuario él se instala solito para contapyme no
[01:34:34.950] afecta las otras instalaciones y tampoco tengo que ir
[01:34:39.709] hacerle las configuraciones de de memoria de procesadores lo puedo dejar
[01:34:46.109] así como está porque normalmente como es para un solo usuario entonces pues él va
[01:34:51.189] a aprovechar los recursos para ese usuario
[01:34:54.430] usuario recordemos que las configuraciones que
[01:34:55.830] hacíamos ahorita decíamos que nos ayudan a mejorar más que todo en servidores
[01:34:59.950] porque se conectan en múltiples usuarios entonces mon usuario no afecta
[01:35:06.189] las otras instalaciones de F y no requiere las configuraciones del archivo
[01:35:12.470] f.com pero sí podemos mejorar la memoria RAM bajar los servicios que no
[01:35:17.910] utilizamos esas otras sí las podemos aplicar
[01:35:33.719] cuando se conecta por internet a un servidor no es mejor utilizar escritorio
[01:35:38.870] remoto el software cliente no es más rápido Sí tienes razón cuando yo me
[01:35:45.590] conecto por internet y yo coloco aquí la IP entonces lo que veíamos ahorita en la
[01:35:50.629] Gráfica por el canal de internet lo que va a viajar son los datos perdón
[01:35:57.109] y aquí retomo miren que por estos canales que hay unos pequeñitos y otros
[01:36:03.189] gorditos cuando yo pido los datos viajan son una consulta viajan todos los datos
[01:36:08.870] de la consulta entonces aquí se va a demorar y aquí va a bajar más o menos
[01:36:13.629] rápido Entonces si me conecto directamente de un
[01:36:18.669] cliente al servidor van a fluir los datos cuando yo desde el cliente me
[01:36:24.790] conecto al servidor a escritorio remoto aquí en el servidor se abre una
[01:36:29.910] sesión de escritorio remoto y se abre ahí el programa y lo que fluye por este
[01:36:35.430] canal de internet es como la imagen de lo que yo estoy haciendo aquí como la
[01:36:40.709] fotico de lo que yo voy trabajando Entonces claro eso es mucho más rápido
[01:36:45.189] que fluya aquí como una fotico y aquí yo voy viendo es la foto y estoy trabajando
[01:36:50.669] realmente es en el servidor Por ejemplo si se va la luz y yo vuelvo
[01:36:56.070] a conectarme al escritorio Ahí está contap abierto si se va la luz en el
[01:37:00.669] cliente Pero si yo estoy conectado es desde aquí con cont pime cliente y se
[01:37:06.750] me va la luz aquí pues se me cierra contap y cuando entre debo volver a
[01:37:09.990] iniciarlo entonces por eso es más rápido escritorio remoto
[01:37:15.790] que que conectarme por Internet pero si yo me conecto al servidor por escritorio
[01:37:23.870] remoto y hay otros 10 usuarios conectados a escritorio remoto son 10
[01:37:30.990] usuarios que utizar abriendo el programa usando
[01:37:34.070] la base de datos El escritorio remoto como tal también gasta memoria En cambio
[01:37:39.830] cuando yo me conecto desde un servidor desde un cliente hacia el servidor
[01:37:53.599] entonces podríamos decir que si el servidor va a recibir hasta
[01:38:00.310] cinco usuarios por escritorio remoto pueden trabajar pero si ya son más de 5
[01:38:06.870] 10 15 entonces sí es mejor que lo hagan a través
[01:38:12.109] de el cliente Para que se distribuya el uso de de los recursos
[01:38:27.719] por aquí me dicen que si retornamos a los casos dos y
[01:38:36.440] TR atrás caso
[01:38:42.550] dos Ah bueno por acá me que para copiarlos igual Pues esta presentación
[01:38:47.669] se les va a poner disponible para que ustedes
[01:38:50.229] ustedes la la puedan tener
[01:39:01.400] puede uno mismo habilitar esos puertos o es potestad de nuestro predor de
[01:39:07.109] internet el puerto 3050 Sí ahí hay que mirar de pronto con soporte pues ellos
[01:39:13.149] ya tienen como la práctica de Cómo configurar porque ahí algunos proos de
[01:39:18.229] internet cuando llega al router la petición pues ahí queda entonces hay que
[01:39:23.750] hacer que ese router la redireccione la petición al puerto 3050 a algún
[01:39:29.350] computador porque yo puedo tener cinco computadores el router debe saber como A
[01:39:34.430] quién redireccionar o hay otras estrategias que es tener otro router
[01:39:39.149] intermedio y hacer pues la configuración es con soporte En caso que lo necesiten
[01:40:04.239] servo de
[01:40:08.400] componentes bueno de pronto aquí es por lo que tengo escondido la barra de
[01:40:13.390] Windows que yo abría los programas pronto En algunos momentos no no veían
[01:40:18.790] cómo lo abrí la voy a poner ahí un momento
[01:40:23.870] momento déjen yo cierro por acá algunos
[01:40:40.480] programas acá la barra Pues acá con con Windows 7 es muy
[01:40:46.830] sencillo normalmente cuando yo entro acá en esta parte de buscar yo le digo el
[01:40:51.990] programa que necesito o más o menos alguna parte Entonces por ejemplo le
[01:40:56.310] digo servicios entonces acá me sale servicios Entonces ya lo selecciono y
[01:41:03.589] ahí está el programa para administrar los servicios si por ejemplo necesito H
[01:41:10.629] algún otro por ejemplo el panel de control puedo poner panel entonces sin
[01:41:16.510] saber yo Dónde está el programa simplemente más o menos con saber una de
[01:41:19.550] las palabras que componen el nombre la escribo y ahí me aparece
[01:41:23.910] esa puede ser una forma rápida de Buscar programas en general podría Buscar Excel
[01:41:37.599] aparece sobre las redes locales inalámbricas Bueno ahí sí pues no no
[01:41:44.669] tengo en este momento conocimiento la velocidad de las redes inalámbricas en
[01:41:48.030] qué va pero hasta hace algún tiempo eran más bien lentas
[01:41:53.790] Y de pronto se interrumpían con mucha facilidad entonces en la versión 3 de
[01:41:58.510] agroin teníamos inconvenientes porque con que se interrumpiera un segundito se
[01:42:03.270] nos colgaba agrin con tap versión 3 ahora con la versión 4 é tiene un
[01:42:09.830] sistema en que si hay una desconexión tiene un tiempo más largo de que no se
[01:42:15.510] bloquea y si se pierde por mucho rato saca una ventanita donde dice que se
[01:42:20.669] perdió la conexión que si desea hacer un test a ver si ya se recuperó y cuando se
[01:42:25.990] recupere la conexión ya el usuario puede seguir trabajando y No sabría las redes
[01:42:32.270] inalámbricas en este momento en qué va pero yo creo que son también lentas pero
[01:42:50.239] sí por acá nos preguntan que si usa red cable Ada WiFi o sea se puede usar el
[01:42:56.270] WiFi pero es más lento Que la cableada Entonces si es una empresa pues se
[01:43:00.669] recomienda más cableada porque normalmente pues está toda la
[01:43:09.360] fija por internet no funciona con el nombre del
[01:43:13.950] servidor si es el nombre es un dominio así como pusimos local web.com si va a
[01:43:21.270] funcionar porque llega a internet y sabe que ese dominio se debe redireccionar
[01:43:26.589] computador pero si coloco el nombre del servidor tendría que estar en la
[01:43:39.280] intranet por acá Bueno creo que est ya lo habíamos mostrado que en el F de
[01:43:44.629] Windows Cómo puedo ver el nombre del puerto
[01:43:47.830] puerto 3050 Sí normalmente yo soy el que le
[01:43:50.790] pongo el nombre y solo la asigno que 3050 lo usé f o cont pime
[01:44:17.320] server Ah bueno Por acá nos dicen que cuando tiene
[01:44:23.510] Eso depende de los montajes les voy a leer la pregunta es bueno aclarar que el
[01:44:28.910] problema del escritor remoto es que consume muchos recursos en el servidor Y
[01:44:34.709] entonces sería bueno tener otro servidor para servidor det terminales distinto al
[01:44:41.430] de F ahí Cómo sería la la solución eso
[01:44:45.709] implicaría ya tener dos servidores de pronto pues habrán empresas que no
[01:44:49.310] pueden costear dos servidores pero para las que sí entes podrían tener en un
[01:44:56.589] servidor como dicen el manejo de los escritorios remotos o sea tener
[01:45:00.830] instalado ahí el team stop todos los usuarios que se conectan por internet se
[01:45:05.629] conectan a ese computador y abren ahí cont pime y lo usan pero F

### Texto para referencia (RAG indexa `transcript.segments` del `.json`, uno por cue con `startMs`)

```text
## Descripción del video

http://www.contapyme.com
Este video explica las formas de configurar Firebird para obtener un mejor rendimiento con el software contable ContaPyme.
CP40-005-040B-010M

## Transcripción

el uso de licencias de otro servidor de datos temporalmente consiste en Iniciar
sesión del programa en un cliente conectarnos a un servidor de datos pero
usando una licencia de otro servidor de datos esto es muy útil cuando yo tengo
una licencia con pocos módulos y necesito Conectarme a un área de trabajo
a trabajar en ciertos módulos que no tengo en esa licencia entonces puedo
prestar una licencia de otro servidor que sí tenga esos módulos que yo
requiero esto pues es muy útil digamos para los contadores normalmente trabajan
en una empresa se llevan una copia de seguridad o se conectan desde su casa y
pues allá tienen otro licenciamiento diferente esta nueva característica está
presente en el Release número TR que incluso hoy ya estamos habilitando en la
página de internet para que ustedes puedan iniciar las descargas y pruebas
de estas nuevas características esta parte debemos tener
en cuenta estas dos notas y son contapyme y agroin
monousuario el mon usuario recordemos que es como una especie de cliente solo
que tiene el servidor integrado y cuando yo utilizo la parte de cliente que me
conecto a otro servidor de datos en ese momento puedo hacer el uso de la
licencia prestada pero cuando yo necesito iniciar
un cliente y quiero usar una licencia de una instalación monousuario no se puede
recordemos que las instalaciones monousuario son como un servidor como
una especie de isla Entonces él no puede prestar esa licencia el
monousuario pero el monousuario actuando como cliente y conectándose a otro
servidor de datos sí puede hacer el manejo de licencias
prestadas vamos a ver acá los pasos para hacer el manejo de licencia
prestada entonces aquí está cada paso con su explicación cuando iniciamos con
conexión entonces en la lista de licencias al final hay un nuevo ítem que
dice usar licencia de otro servidor de datos
datos temporalmente al seleccionar esta opción
nos va a aparecer un mensaje informativo el cual nos Explica
brevemente qué es lo que va a pasar a continuación entonces as el usuario pues
va a tener claro qué es lo que sigue cuando le damos a esa ventana
informativa solicitar licencia prestada Entonces nos va a preguntar
cuál es el servidor de datos que que va a prestar la licencia entonces ahí
debemos escribir o si ya está en la listica seleccionar el servidor de datos
por ejemplo yo estoy ubicado en local Host acá arriba pueden ver que en la
caja de conexión inicial dice local Host y cuando yo le solicito la licencia
prestada se la estoy solicitando al servidor
servidor server cuando yo le doy a aceptar
entonces me va a salir la caja de datos de conexión Esta es necesaria porque
como yo le estoy pidiendo una licencia prestada a otro servidor yo debo hacer
uso de esa licencia y en ese servidor quedar registrada de que esa licencia se
está usando una vez o sea llevar el conteo de esa manera no tenemos
problemas con la cuestión de licenciamiento que no es que yo presto
licencias y entonces la puedo usar 10 20 veces no él va llevando el conteo de las
veces que está permitida una vez yo le doy el botón
prestar licencia él me retorna a la caja de datos de conexión inicial y en la
parte de licencia aparecen los datos que él va a usar con la licencia prestada y
una vez yo me doy la opción conectar él va a hacer el proceso común y corriente
de conectarme al área de trabajo y voy a usar esa licencia que me prestó el otro
servidor cuando ya finalice sesión o cierre el
programa entonces en el servidor que prestó la licencia se va a cerrar ese
uso de licencia la libera y en el servidor al cual estoy conectado yo al
área de trabajo también se va a cerrar común y
corriente Entonces de esa forma puedo prestar la
licencia se lleva el conteo y cuando se cierra se cierran ambas sesiones
vamos a mirar acá algunos casos prácticos de cuándo se puede utilizar
este sistema de licenciamiento prestada Por ejemplo yo soy un contador
y llevo la contabilidad de varias empresas en mi oficina tengo instalado
contapyme monousuario o servidor y cliente no importa con una licencia
pequeña o sea licencia mínima de contador y en las empresas tienen un
licenciamiento superior a la mía tienen costos inventarios
etcétera cu abajo en la yo me traigo de la empresa x de donde Soy contador me
traigo una copia de seguridad de pronto para generar informes y revisar los
informes pero cuando yo voy ver informes de los módulos que yo no tengo en mi
licencia Pues quedó varado entonces lo que yo puedo hacer en ese momento
es abro contapyme abro mi conta mon
usuario en la parte donde pregunta el servidor dejo mon
usuario entro y le digo en la parte de solicitar licencia en el servidor de la
empresa lógicamente yo deo tener internet y en la empresa estará
internet selecciono la licencia que quiero que me preste el servidor Y con
esa licencia me conecto al área de trabajo que tengo aquí local de esa
Consultar los informes de los módulos que tiene esa empresa y finalmente
cuando yo cierre la sesión pues se liberan el servidor se liberan la
licencia prestada y acá en mi computador se cierra el área de trabajo ese sería
un caso el segundo
caso puede ser al contrario yo soy el y llevo la contabilidad de varias empresas
en mi oficina tengo instalado una licencia que tiene múltiples módulos
contabilidad inventarios presupuesto pero las empresas las a las
que yo asesoro pues no los pongo a que compren módulos una licencia con todos
los módulos sino que compren solo lo que necesitan ellos digitar y yo luego me
conecto con ellos y termino de hacer las operaciones eh más
avanzadas pero como ellos no tienen la licencia con los módulos que yo necesito
Entonces yo utilizo la licencia que tengo aquí en mi
computador sí Entonces en este caso es yo me conecto por internet al
servidor de datos de la empresa al área de trabajo de ellos y le digo que voy a
prestar una licencia y selecciono la licencia que tengo en mi computador
Entonces de esa forma puedo trabajar en los módulos que yo necesito pero que ese
tiene y el tercer caso serían por ejemplo yo necesito
trabajar es en mi portátil en mi portátil yo inicio el contap cliente o
agroin cliente y le puedo por ejemplo solicitar prestada la licencia al
computador de mi oficina al servidor de datos de mi oficina y conectarme al área
de trabajo de una de las empresas en las que yo trabajo o
viceversa podría ser que me conectes al área de trabajo de mi oficina y
utilizando una licencia de una de las empresas tenemos tres casos prácticos de
cuándo se usa este sistema de prestar
licencia vamos a mirar en contapyme entonces las ventanas que se presentan
opción aquí estoy iniciando cont pye aquí despliego más
opciones entonces aquí aparece la licencia que yo tengo en este computador
que puede ser una licencia básica la licencia servidor porque estoy
en local Host aquí local Host o sea en mi
mi computador y aquí está la opción usar
licencia de otro servidor de datos temporalmente cuando yo le doy clic
entonces me saca una ventana informativa donde me dice pues que va a pedirme los
datos de conexión del servidor al que yo le voy a solicitar la licencia prestada
ahí me pregunta el nombre del servidor pues si no lo tenemos en la listica pues
escribimos ahora me dice datos de conexión Pero estos datos de conexión
solo para usar la licencia nos vamos a conectar a
server Aquí voy a colocar mi usuario y mi
mi contraseña y selecciono qué licencia
quiero que me preste ese servidor Por qué tengo que usar esta ventana de
conexión porque en el servidor que me va a prestar la licencia debo quedar
registrado como usando esa licencia Entonces por tal motivo yo debo estar
creado en ese servidor como un usuario y conocer una tener la contraseña y tener
disponible un área de trabajo cualquiera y la licencia que yo voy a prestar vamos
a decirle prestar licencia entonces noten que aquí dice
licencia dice quién prestó la licencia server y dice Qué licencia
prestó voy a validar acá para entrar
Bueno aquí me qued
mal y
conectar Ahí estamos cargando el programa en el cual estamos usando una
datos vamos a mirar por acá por usuarios conectados entonces aquí aparece que es
Suárez que es mi computador está conectado a esta área de trabajo o sea
que aparece aparezco conectado como unic
corriente Ahora me voy a cambiar al servidor sí voy a cambiar al servidor
para ver esta parte en esta misma opción de usuarios conectados que yo no estoy
conectado allá a ninguna área de trabajo Solo estoy usando es una licencia de
allá entonces me voy a ir para el servidor listo aquí ya estamos viendo el
servidor aquí lógicamente es usuario distinto con una contraseña diferente
bueno acá ya cargamos el programa y vamos a mirar usuarios
conectados entonces aquí está conectado e Suárez que es la conexión que yo tengo
acá en mi otro en mi computador desde que estoy viendo la
presentación y noten que aquí dice conectado a otro servidor de datos local
Host área trabajo 1 admin este conectado servidor de datos quiere decir que me
pidió prestada una licencia y este PC server pues es el
computador servidor desde el cual les estoy mostrando en este momento Entonces
de esa forma podemos un usuario podría saber que los conteos de licencia se le
acabaron y no hay nadie conectado Ah pudo haber sido que es que se están
conectando prestando la licencia Entonces se puedes llevar ese
control voy a regresar a a mi computador voy a cerrar la sesión del
servidor Y regresamos acá al a mi computador Entonces de esa forma
podemos hacer el uso de licencias prestadas si
observamos aquí par ccd aquí en licencia virtual activa no
aparece nada porque es que este computador no está usando ninguna
licencia Realmente está usando es la de otro computador no la no una de acá por
vacío Bueno vamos a aprovechar y hacemos un un pequeño tiempo de preguntas como
para cerrar esta parte de licencias prestadas
prestadas
Por acá nos preguntan al trabajar de esta forma si tengo un solo usuario
cliente solo puede trabajar un usuario o dos sesiones con el mismo
usuario como esta parte de licencias prestadas funciona con el registro de
licencia Entonces cuando yo entro desde mi computador y Solicito la licencia
prestada al servidor y el servidor solo tenía una ejecución Entonces yo estoy
gastando esa ejecución si allá en la empresa alguien va a entrar le va a
decir que no puede que la licencia está en uso hasta que yo no cierre sesión
aquí allá en el servidor de la empresa no pueden
licencia los datos de cada área son independientes
independientes Sí cuando yo me conecto desde aquí en mi
computador yo me conecto a un área de trabajo
trabajo local y en el servidor de la empresa que
le estoy pidiendo prestada la licencia yo tengo que seleccionar un área de
trabajo y usuario es solamente con los fines de validación porque yo no puedo
prestar licencias si yo no tengo como ese permiso es como la forma de validar
de que sí tengo permiso de usar esa licencia
licencia y cuando me conecto no tengo que ver
nada con el área de trabajo que hay en la empresa porque yo me estaba
conectando realmente era a la de aquí de mi computador voy a volver a iniciar la
contapyme Para que veamos miren que yo me estoy conectando a local
Host área de trabajo uno esta área de trabajo es mía aquí de mi computador es
a los datos a los que yo me voy a conectar cuando yo Solicito la la
licencia prestada él aquí Aparentemente se me va
a conectar a un área de trabajo pero solo es con fines de validar el usuario
y contraseña para poder usar esta licencia
que yo estoy pidiendo prestada de esa forma si por ejemplo un contador ya no
trabaja en esa empr en esa simplemente quitan el
usuario lo bloquean lo borran o le cambian la fecha de finalización y ese
contador ya no podía ya no podrá prestar licencia Pues porque ya no pertenece a
empresa por acá nos preguntan que si desde la empresa le pueden Cerrar la
sesión al contador Bueno ahí sí está un poco complicado
porque cuando se registra digamos que se pierde un poco el control porque es otro
computador que está en otro lugar pero podríamos analizar un poco esa
opción porque si el de sistemas determina que no que ese Contador se le
metió y no debería Entonces debería de alguna forma poderlo bloquear o o
cerrarle esa sesión vamos aquí a tener en cuenta
tip el contador se conecta y se le olvida cerrar sesión bueno como la
sesación que está usando el cont aquí el contador está gastando una licencia ya
en el servidor é la puede tener abierta el tiempo que sea es muy difícil
controlar de que si se le olvidó apagar el computador y dejó contap abierto
porque uno no sabe si está trabajando realmente o no desde la empresa entonces
ahí tocaría esperar que cierre la sesión ahí si no habría pues como otra forma
Porque si uno va y le mata la sesión le podría dañar quién sabe qué datos que
realmente Existe algún límite de veces para prestar licencia
Eh no eh en el momento no tenemos ningún
límite ni ningún control esta opción pues es nueva miren que apenas la
estamos lanzando en este Release con estas preguntas pues ya van a
apareciendo sugerencias las cuales podemos ir teniendo en cuenta y podría
ser que llevemos podría ser no es que lo vayamos a hacer que llevemos un conteo
de préstamos así por ejemplo el jefe de sistemas de la empresa dice no le voy a
prestar la licencia tres veces entonces aquí el contador la puede usar Solo
veces con el solo nombre del servidor se puede conectar bueno no con solo el
nombre no porque tiene que validarse como usuario entonces por eso tiene que
tengo un caso en que en que un usuario tiene una empresa
y quiere montar el sistema en un servidor con su licencia full pero la
esposa esora y quiere en el equipo el programa
pero es una licencia contador Bueno si en el mismo computador el mismo
servidor de datos van a instalar dos licencias Pues digamos que
depende como lo manejen no habría necesidad ni siquiera de usar el uso de
préstamo en el mismo servidor pues se registran las dos licencias o sea
Recuerden que un servidor de datos puede tener muchas licencias registradas y
luego ya se le dice a cada usuario que licencia puede usar
el servidor de datos que presta la licencia debe estar siempre
prendido sí lo que miramos ahorita es que yo estoy aquí yo soy el contador y
me voy a conectar al servidor de datos de la empresa para que me preste la
licencia entonces debe estar prendido y los dos deben tener internet pues porque
puedo hacer que una licencia se pueda o no prestar por ejemplo bloquearla para
algunos usuarios Esta es una buena pregunta porque entonces nos va a servir
como un tip para ir mejorando esta parte en el momento está abierto o sea
cualquier usuario podría prestar cualquier licencia pero ya podemos ver
que es necesario decir que licencias serían prestables
A qué usuarios de esa forma pues no se nos puede meter cualquiera y ir usando
licencias bueno eh
Entonces vamos a pasar al punto dos que es mejora desempeño del servidor de
datos el servidor de datos vamos a hablar del computador donde se instala
contapyme o agrowin server ese va a ser nuestro servidor de
datos podemos mejorarlo en cuatro aspectos sistema operativo ya vamos a
ver en detalle cada uno Hardware internet y F
Entonces vamos a mirar algunos tips con relación a Cómo mejorar el desempeño en
el sistema operativo normalmente cuando uno compra
un computador servidor que viene con el Windows server 2003 2008 eso viene sin
programas viene simplemente el sistema operativo y ya uno le empieza a instalar
Pero hay veces que como ese Windows que que viene
cualquier tipo deos servicios y tareas habilitados que de pronto Nuestra
Empresa nunca va a usar Entonces Sería muy bueno de pronto esas tareas
servicios programitas que no se van a usar
usar deshabilitarlas comen consumen recursos
consumen memoria RAM que puede ser poca pero consumen algo consumen
procesador entonces La idea es como afinar el sistema operativo quitando
esos programitas que yo no necesito digamos que ahí necesitaríamos
Pues de pronto la asesoría de alguien que conozca un poco más pero nosotros
digamos desde nuestro punto de vista básico simplemente Iniciando el
administrador de tareas de Windows Aquí vemos las aplicaciones que
están en ejecución y aquí vemos los procesos que están en ejecución noten
que es una gran cantidad de procesos y un servidor puede tener muchos más
entonces uno podría determinar por ejemplo aquí qué procesos podrían
realmente no ser necesarios yo aquí pues más o menos lo
tengo depurado pero aquí podrían aparecer procesos raros que no son ni de
Microsoft ni de algo que yo conozca entonces podría Investigar un poco y de
pronto mirar cómo Deshabilitar ese proceso porque miren que esos procesos
consumen memoria por ejemplo aquí hay uno que me está consumiendo 100 megas
Bueno Este es el presentación que estamos haciendo por
aquí hay otro este de audio me está consumiendo
solo el controlor de audio me está consumiendo 15 megas entonces uno ahí
podría revisar Qué programas de verdad no
no necesito esa podría ser una tarea de
optimización del sistema operativo también sucede que cuando uno
compra un computador en alguna tienda que no es un servidor sino un computador
bueno eso le
inst y va y mira cuatro reproductores de video tiene Corel draw tiene J 1000
programas que uno nunca usa entonces desinstalé Porque esos programas
normalmente van y ponen cosas en el registro de Windows van y ponen cosas en
el arranque de Windows entonces todo eso también me consume procesador me consume
memoria hay algunos malucos uno está trabajando y una burb Ah hay una nueva
actualización desea descargarla buo pero yo nunca uso Este programa o cuatro
reproductores de video Pues con uno solo es suficiente entonces ahí también
estaríamos optimizando nuestro computador y le estaríamos dejando más
recursos a los programas que realmente lo
lo necesitan hay una parte que es un poco
ladrilla Por así decirlo y es el tema de los
los antivirus normalmente en los
computadores cuando uno mucho en internet y tiene abierta la puerta de
internet pues está en riesgo de que se le meta algún virus si uno tiene cuidado
de no abrir correos que no conoce de no meterse a páginas indebidas puede que
nunca se le pegue un virus y nunca tuvo antivirus pero para prevenir esto pues
todas las empresas y nosotros como usuarios tendemos a tener algún
antivirus o programas similares esos son muy buenos pero
frenan mucho el computador Porque todo lo que uno está haciendo el está
constantemente lo está testeando entonces ahí está gastando tiempo el
procesador está gastando tiempo en memoria usa el disco
duro entonces hay en empresas que tienen servidores dedicados o sea es son
servidores que están por allá en un cuarto y hay nadie trabaja normalmente
esos servidores no necesitan antivirus Porque allá Nunca van a entrar a navegar
en internet Nunca van a instalar programas raros entonces si yo ya tengo
el servidor de datos de contapyme o abin pues
pues Yo diría que a ese servidor no le
montemos un antivirus y ahí estamos dejando que el servidor trabaje mucho
mejor en los clientes Pues iba a ser necesario pero en el servidor podría ser
que no ahora si el servidor de datos es un
computador donde trabaja alguna persona Pues de pronto ahí sí podría necesitar
riesgo otra parte que frena mucho los computadores por ejemplo tenemos el
servidor de datos que decimos allá en un cuarto donde nadie lo usa y le ponemos
un protector de pantalla y el protector de pantalla es de estos que son animados
o que son de los que muestran figuras 3D entonces esos consumen mucho procesador
ent imag un computador que está ya quietico dándole servicio a todos los
clientes y con un protector de pantalla que se gasta harto
procesador se está se está consumiendo recursos sin ser necesario entonces en
lo posible en ese ese tipo de servidores donde nadie trabaja que normalmente se
activan los protectores de pantalla Entonces se puede seleccionar la opción
que se llama vacío Sí les voy a mostrar por
por acá denmen un segundo yo la
busco por acá uno le dice protector de pantalla Entonces estos de burbujas de
texto 3D consumen procesador mientras está ahí mostrando la animación Entonces
en este caso le podríamos decir vacío entonces simplemente cuando se active se
pone la pantalla negra entonces conserva el monitor y no usa
procesador Y pues también ahorra energía porque no está ahí mostrando nada en
pantalla bueno en las empresas Este otro tip es muy bueno porque hay empresas
que tienen un serv un buen servidor pero le instalan un mundo de servicios no
Entonces tenemos un servidor pongámosle el servidor de datos de conta agroin
pongámosle el servicio de internet pongámosle este otro programa entonces
empiezan a sobrecargar ese servidor y cuando va a trabajar conim agroin pues
trabaja Pero como hay tantos otros procesos pues entonces es un poco más
entonces las empresas críticas que de pronto necesitan que el desempeño del
servidor hacia los clientes sea inmediato muy rápido recomendar
lógicamente Pues eso tiene sus costos recomendar Que tengan un servidor
dedicado O sea que instalen simplemente el servidor de conta pyme agroin y no
instalen más programas eso pues va a garantizar que con el tiempo entre más
usuarios se conecten Pues a todos les va a dar un buen rendimiento porque el
específica otro tip no sé por qué lo he visto algunos técnicos cuando van e
instalan un sistema operativo siendo Windows de 64 bits la cpu perdón O sea
la parte física del computador instalan el Windows de 32 bits ahí están
desaprovechando el potencial físico que tiene el computador lo ideal es que si
el computador físicamente es de 64 bits instalen el sistema operativo de 64 así
se aprovecha al máximo los recursos físicos de pronto un tipito que me faltó
acá es la Ups una recomendación grande es que el servidor de datos tenga Ups
por qué esto decíamos que cuando los clientes se
caen y se desconectan no pasa nada porque F por ser un sistema cliente
servidor tiene Pues un manejo que si un cliente se cae a la base de datos no le
pasa nada pero si se cae el servidor de datos se puede dañar la base de
datos porque tiene índices abiertos tiene transes iniciadas entonces puede
sufrir entonces por eso lo ideal es que el servidor de datos tenga una Ups hay
upss que incluso se conectan a la cpu del computador y cuando se va la luz dig
digamos Por cierto tiempo le mandan la instrucción al computador para que se
apague Entonces al mandarle esa instrucción a Windows Windows cierra
todos los programas adecuadamente y se apaga cuando se va la luz uno un
segundito pues la Ops lo sostiene y cuando ya se va por mucho tiempo ent lo
sostiene 10 minutos y le da la instrucción para que el servidor se
apague entonces por eso también la Ups ayuda a controlar así el corte de
energía sea por mucho tiempo Bueno entonces estas son mejoras
relacionadas al sistema operativo lógicamente recomendamos pues
tener eh sistema operativo eh última versión Yo sé que a
veces lógicamente sabemos que Windows 7 pues ha salido muy bueno tiene
muy buen soporte es muy estable consume menos recursos entonces pues
recomendamos Windows 7 y si es un sistema un computador servidor puede ser
un Windows 2008 o ahora en estos días ya está saliendo al mercado el Windows
2012 Bueno ahora hablemos de la parte de Hardware lógicamente las empresas que ya
tienen su computador servidor pues van a usar el que tienen entonces de pronto
pues ahí mejorar el Hardware es un poco más difícil pero si es alguna empresa
que va a comprar podríamos tener en cuenta estos tips Y de pronto hacerle
algunas recomendaciones por ejemplo la
cpu la cpu pues antiguamente era simplemente un núcleo y lo iban
velocidad ahora para poder como al mejorar al aumentarle la velocidad los
procesadores se están calentando mucho entonces la estrategia de los que
fabrican los procesadores no es aumentar y aumentar la velocidad sino tener como
quien dice varios procesadores en uno entonces a eso se le denomina
ejemplo tener un procesador de cuatro núcleos es como si tuviera un procesador
como si tuviera cuatro procesadores Entonces miren acá el
que si la cpu tiene un núcleo pues le van a llegar muchas peticiones de los
clientes para procesos digamos hay tres o cuatro clientes a la vez conectados y
va a ir atendiendo solo con un procesador si tiene varios procesadores
o varios núcleos pues va a poder atender a varios a la vez entonces va a ser
mucho más rápida la solución de las peticiones por ejemplo Hoy día hay
procesadores con ocho y hasta 16 núcleos Entonces si uno comprar un computador
servidor pues puede uno recomendar que tenga siquera mínimo cuatro núcleos
mejor ocho y pues mucho mejor 16 lógicamente pues Los costos se
suben también es muy importante cuando uno compra el computador que tenga algo
que se llama cach de servidor eso es como un almacenamiento
temporal que utilizan los procesadores cuando leen en el disco duro datos de
tenerlos aquí no en la memoria RAM sino como en un punto intermedio que es muy
rápida se como que intuye que es lo siguiente que va a pedir el al disco
duro Entonces se anticipa y lo lee y muchas veces es lo mismo Entonces eso
hace que sea muy rápido la lectura de datos en ese sentido pues
recomendamos por ejemplo los procesadores de Intel Core i5 Core i7 y
se que es más que todo para servidores y en amd uno que se llama el
opteron la memoria RAM sabemos todos que entre más memoria RAM pues mucho más
rápido hacer el computador porque no tiene que ir a utilizar el disco duro de
almacenamiento temporal ahora si al servidor se conectan muchos
usuarios no sé 20 30 entonces va a necesitar más memoria RAM entonces por
eso está la flechita hacia arriba pues entre más mejor también dependiendo de
la cantidad de usuarios que se conecten la velocidad de la memoria
RAM normalmente los computadores nuevos traen ram de altas velocidades entonces
pues si uno cum un computador nuevo pues verificar que la velocidad Pues si esté
óptima el disco duro en este cuento de las bases de datos el disc duro es muy
crítico porque toda la información de la base de datos está guardada en el disco
duro entonces una base de datos por ejemplo de un
giga va a tener que subirse del disco duro a la memoria Entonces el disco duro
en este momento cuando está leyendo puede ser el cuello de botella entonces
por eso recomendamos que mínimo la velocidad del disco duro sea 7200
revoluciones por minuto si es un
servidor un servidor de datos pues como tal entonces normalmente puede tener
mejore mucho si tiene dos discos duros mejor
por qué Porque en uno puede estar el sistema operativo o sea Windows
normalmente está haciendo cosas y está leyendo el disco duro grabando en los
temporales y el motor de base de datos También necesita hacer eso entonces
podemos definir que un disco duro sea para el sistema operativo y otro disco
duro sea para el motor de bases de datos todas estas características que
hemos visto hasta ahora de sistema operativo y Hardware van a mejorar mucho
el desempeño pero se va a notar mucho No solo con un usuario sino que cuando se
conecten cinco se va a notar que no hay desmejora en el desempeño que eso es lo
que normalmente sucede cuando un computador presta el servicio a un
usuario es muy rápido un un s servidor puede ser igual de
rápido que a un computador normalito pero si hace computador normalito se le
conectan 10 usuarios pa se cae el desempeño pero al servidor normalmente
sigue igual porque ya tiene todas esas configuraciones para prestar servicio a
usuarios bueno para los que se conectan por internet Entonces el desempeño
también nos puede jugar aquí también hay que
analizarlo vamos a mirar acá el gráfico tenemos internet tenemos acá un
cliente tenemos un servidor para que ese cliente se conecte hacia el servidor de
cont pye necesita primero un canal de subida o sea del cliente que es un
portátil o un computador de escritorio necesita hacer una petición la cual pasa
por por internet y esa petición le llega hasta el servidor y el servidor sube la
respuesta al internet pasa trá de internet y baja hacia el cliente con
nuestros proveedores que tenemos de internet telmes une pv
etcétera normalmente le siempre le dicen a uno no usted contrata la velocidad de
bajada la velocidad bajada es 4 mbit por segundo 10 20 pero nunca le mencionó la
velocidad de subida Y en este caso que estamos trabajando en las dos
direcciones la velocidad de subida es crítica porque va a marcar el desempeño
en la cual nos vamos a conectar los clientes a los servidores y vamos a
velocidad de bajada le dicen a uno es de cu y la velocidad de subida que nunca le
dicen Eh puede ser por ejemplo punto 6 o puede ser uno o puede ser dos
normalmente la velocidad de subida es mucho más pequeña que la de bajada
porque miren que todos los usuarios que usan internet siempre bajan bajan bajan
programas bajan fotos y cuando uno sube de pronto digamos en Facebook uno sube
la foto ahí es donde está la velocidad de subida lo que se demore de aquí en mi
computador a subir la foto a Facebook miren que si yo bajo luego esa foto baja
mucho más rápido de lo que subió porque el canal de bajada siempre es mucho más
amplio entonces supongamos que estamos en conta pyme aquí en el cliente y
solicita un informe digamos que el informe es en una base de datos grande y
es un informe grande entonces contapyme hace una petición la
petición es muy pequeñita miren que aquí La Barrita es delgadita y cabe por el
canal de subida entonces la petición del cliente hacia internet pasa rápido
porque es una petición chiquita cuando llega al Canal del
servidor pueden haber más clientes conectados haciendo otro tipo de
peticiones entrar a un catálogo hacer una operación y normalmente esas
peticiones también son pequeñas y como el canal de bajada es amplio entonces
por ahí caben muchas peticiones y es muy rápido pero cuando el servidor de
F el servidor de contapyme que está aquí instalado en el servidor por medio el
motor de base de datos fivir empieza a responder esas peticiones miren que el
canal de subida que tiene el servidor hacia internet es muy pequeño entonces
Esas peticiones se vuelven ahí un cuello de botella si es para un cliente que
hizo una petición grande esa petición grande no cabe entonces tiene que
mandarla como por pedazos Entonces el cliente tiene un canal ancho
de bajada Pero tiene que esperar que todo pase por este canal pequeñito de su
vida y si a eso se suma que había varios clientes haciendo peticiones a la vez
Entonces se vuelve ahí como una cola de peticiones Entonces el internet que
teníamos de 4 megas que uno dice que es muy bueno pero con una velocidad de
subida de punto 6 ya se vuelve malo entonces ahí Tenemos que tener en cuenta
cuando contratemos nuestro servicio de internet aclararle al proveedor Bueno
usted Qué velocidad de subida me va a dar para saber si me sirve o no me sirve
Entonces nosotros aquí tenemos esta recomendación para el servidor de datos
la velocidad de bajada 4 mbit es buena si es más mucho mejor y la velocidad de
subida que sea mínimo de 2 megabits porque es que esa es la
velocidad crítica la velocidad de subida del servidor O sea que si nos dan más
mejor pero que sea por lo menos dos por ejemplo nosotros acá en insoft hemos
hecho las pruebas de Test los test que hace uno internet y nos ha dado 2.5 que
es una buena velocidad y en el cliente la velocidad
de bajada miren que la velocidad bajada del cliente 2 megabits puede ser igual a
la que tenga el servidor de subida porque en esa canal de
comunicación va a operar es la de menor Entonces si el servidor tiene dos
Entonces los clientes pueden tener dos la subida puede ser pun 5.6 porque
los clientes cuando hacen peticiones o envían datos pues es más bien poco poco
el grosor de los datos que envía Entonces el cuello de botella con
relación al internet está de en el servidor y con relación a la velocidad
de suba si es difícil mejorar la velocidad
de subida en el servidor Porque ya teníamos un internet contratado y no nos
podemos cambiar la empresa no tiene con qué pagar un internet más rápido
entonces podríamos considerar otras opciones como la de escritorio remoto o
la de Tin stof Ya pues la mayoría saben cómo funciona recordemos que el Tin stof
lo que yo hago es que el cliente cuando se conecta al servidor realmente se está
Entonces de esa forma lo que fluye por el canal de comunicación no son los
datos sino como la fotico de lo que yo voy haciendo en el servidor Entonces eso
es mucho más rápido entonces ahí habría que evaluar
Qué opciones tenemos con relación al internet si trabajar del cliente hacia
el servidor utilizando en la caja de conexión la IP o si esta es muy lenta y
no pudimos mejorarlo trabajar con escritorio
remoto Bueno ahora vamos a mirar las mejoras que le podemos hacer al motor de
fiv cuando uno instala el motor de base de datos en un servidor él instala unas
configuraciones por defecto porque un programa eh
Normalmente se instalan múltiples computadores y todos con distintas
características unos con 1 gig de ram otros con cu otros con ocho otros con
procesadores de varios núcleos otros con de un núcleo Entonces cuando F se
instala instala con unas configuraciones por defecto y esas configuraciones por
defecto norment son para los computadores más bajos de menor
característica entonces uno puede afinar esas configuraciones para mejorar el
desempeño del motor de bases de datos entonces Esas configuraciones se
hacen en un archivo llamado f.com ya ahorita vamos a mirar Dónde se
encuentra qué otras mejoras podemos hacer con relación a la base de datos es
aplicar utilidades de mantenimiento miren que normalmente en una empresa
están creando operaciones borrando creando terceros mirando informes o sea
están haciendo un mundo de operaciones contra la base de datos esa base de
datos con el tiempo se va haciendo algo que se llama
fragmentando por ejemplo la base de datos tiene 10 terceros y le borran
uno entonces ya no está ese tercero pero si uno va y mira el tamaño físico
de la base de datos no disminuye de tamaño siempre vas
creciendo esa es una estrategia para que las bases de datos sean rápidas pero
cuando uno les borra información ella simplemente marca el registro como
borrado y no lo limpia Entonces ahí es donde se va fragmentando la información
las bases de datos se van engordando entonces en el momento pues
nosotros tenemos una tenemos dos formas de hacerle mantenimiento una es con el
reindex no sé si ustedes ya han visto que esa opción que teníamos en la
versión tres acá en la versión cuatro la tenemos
tenemos disponible les voy a mostrar Por dónde
está el reindex lo que hace es reconstruir los índices de las tablas
Entonces esto ayuda a que mejore el desempeño es bueno hacerla no sé cada
mes cada dos meses o cuando Note puso como un poco
lento cces por acá por esas opciones de mantenimiento siempre las vamos a
encontrar disponibles por el menú servidor y aquí tenemos la opción
reindex ahí simplemente la ejecutamos le damos reindexar y es un proceso que se
poco hay otra opción que teníamos que es la verificación física que ya va
físicamente mejora revisa la base de datos esta opción en la versión 4
todavía no la tenemos desarrollada la tenemos Pues en diseño
eh más adelante la vamos a sacar en en un parche o en un nuevo Release pero por
ahora lo que podemos hacer es hacer copia de seguridad y
recuperarla porque cuando se hace la copia de seguridad la hacemos con un
comando propio del motor de base de datos la cual la depura O
sea hay dat de de borrado entonces realmente nos limpia eh vuelve y
reconstruye los índices y cuando uno recupera la base de datos incluso la
copia de seguridad disminuye de tamaño entonces por eso es recomendable cada
cierto tiempo dos meses hacer una copia de seguridad y ahí
mismo recuperarla lógicamente pues deberían estar todos los usuarios
y esta otra opción digamos que no es para mejorar el desempeño sino para no
bajarlo y hemos notado Pues en algunas bases de datos que hemos revisado que de
pronto han cometido este pequeño error y es el sistema tiene algunos campos de
observaciones o notas y uno ahí puede por ejemplo pegar información de por
allá hay un folleto de Word viene y la pega si esa información es demasiado
grande todo eso va a ha serer que crezca la base de datos de tamaño entonces va
perder desempeño otro caso es que llegan y
dicen Bueno qué rico Ya contapyme en la información de los terceros tiene la
foto vamos a tomarle la foto a todos los empleados y le toman la foto con la
cámara Pues de 10 megapixeles de 12 y esa foto tal cual la tomaron vienen y la
suben y la foto pesa 5 megas y tomaron 50 fotos multipliquen Entonces ese
tamaño engorda en la base de datos Y la foto en en la información de los
terceros sale pequeñita Entonces cuál es la recomendación a esa foto que tomaron
con la cámara y está en un archivo jpg de pronto aplicarle con algún
programita y reducirle el tamaño y una foto que pesaba 5 megas que es
gigante y reducirla a 100k a 80k igual la foto a 100k se ve muy bien Quién es
la persona Entonces es una recomendación que las fotos de los terceros o las
fotos de los elementos de control el logotipo de la empresa todos esos
archivos que uno sube recomendable que sean editados y
bajarles el tamaño para que el tamaño de la base de datos no crezca tanto y así
las copias de seguridad también van a quedar
pequeñas bueno vamos a mirar entonces las configuraciones que les comentaba de
de fibber que es nuestro motor de base de datos de contap agin y hay tres
parámetros clave que ayudan a mejorar el desempeño del motor de base de datos
Pero antes de modificarlos pues debemos tener presente las características
físicas de nuestro computador para poder afinar el valor que le vamos a asignar
Entonces los tres parámetros que vamos a modificar de nuestro archivo de f.com
que tiene muchas configuraciones pero tres son las claves son cpu affinity Max
este tiene que ver con los núcleos del procesador é por defecto utiliza un
núcleo entonces tendríamos que verificar nuestro procesador cuántos núcleos tiene
y así lo podemos afinar ya vamos a ver en detalle cada
uno default de BK page este le permite A F saber Cuánta memoria RAM va a utilizar
por cada base de datos que abra entonces también la podemos mejorar y el tem
directory también lo podemos mejorar porque este es un directorio de trabajo
temporal que cuando él ya se le acaba la ram que le asignamos porque abrió
consultas muy grandes utiliza el disco duro para hacer ciertos
procesos Entonces si utilizamos el disco duro c por por ejemplo y ahí es donde
Windows Está también trabajando y lo mantiene ocupado y F también lo va a
ocupar Entonces se puede volver un pequeño cuello de botella Entonces si
tenemos un disco duro adicional podríamos decirle a f que no
entonces va a estar más desocupado para que él
trabaje lo que sí hay que tener en cuenta es que hay veces que los discos
duros llegan particionados o sea es un solo disco duro y uno va y mira y
aparece c y d O sea que el desempeño como es un solo disco duro pues es como
si fuera una sola unidad Entonces tenemos que tener presente que si
hacemos este temp directory sea físicamente a otro disco duro eso
también lo podemos verificar desde aquí de nuestro
Windows bueno la ubicación del archivo que vamos a configurar Normalmente se
encuentra en archivos de programa o program file fb fbar 25 y se llama
fb.com cada vez que hagamos cambios en este
archivo debemos cerrar el servicio de F y volverlo a
subir para el sub ya vamos a mirar cómo lo
lo hacemos vamos a entrar en detalle en
estas tres configuraciones cpu affinity
Max cantidad de núcleos del procesador que usará
F Entonces si el servidor de datos se usa principalmente como
servidor de datos de cont pime agroin o sea está dedicado solo a los datos de
cont pime agroin Entonces esta característica de cpu affinity Max se le
pueden poner todos los núcleos que tenga nuestro procesador eemplo si el
procesador tiene ocho le podemos asignar los
los ocho pero si no es así digamos que ese
servidor Ahí trabaja una persona o tienen otro tipo de programas Entonces
si tien o procesadores ocho núcleos podríamos decirle que F use cuatro para
Pues trabaja usa cuatro pero si el servidor está haciendo otras cosas puede
utilizar los ocho incluso los cuatro que tenía f reservados
s esta opción entonces aparece como número
número affinity Max el signo número allá en el
archivo de configuración quiere decir que va que no se está haciendo ningún
cambio y entonces él utiliza el valor por defecto y el valor por defecto es un
núcleo les voy a mostrar Cómo ver cuántos núcleos tiene un computador
recuerdan la el administrador de tareas de Windows Aquí hay una pestaña que se
llama rendimiento y ahí podemos ver por
ejemplo aquí aquí en mi computador tenemos cuatro núcleos Entonces de esa
forma yo ya sé este computador tiene cuatro
núcleos Perdón por acá una
opción bueno no bueno este computador tiene cuatro
núcleos entonces podemos hacer la configuración para que F utilice los
cuatro o utilice dos digamos que no lo dejamos en uno pues porque estaríamos
desaprovechando el potencial físico que tiene el computador entonces pongámoslo
en dos o en cuatro normalmente todo lo que tiene que ver con computadores van
múltiplos de dos Entonces no se pueden utilizar tres sería 1 2 4 8
etcétera entonces si el computador tiene varios núcleos si yo
quiero usar dos en cpu affinity Max debo asignarle el valor
TR si quiero que use cuatro núcleos le asigno el valor 15 si quiero que use
ocho núcleos le asigno 255 Y si quiero que
use núcleos le asigno este valor de 65300
65300 535 vamos a mirar dónde lo
asignamos entonces voy a abrir acá el explorador de archivos de Windows
vamos a archivos de
f f 2.5 y ahí vamos a encontrar el archivo
f.com cuando le damos doble clic voy aquí abrir otro para que nos salga la
ventanita cuando le damos doble clic pues sale esta opción porque normalmente
ese archivo no está asociado a ningún programa Entonces lo podríamos asociar
simplemente con el bloc de
notas Bueno yo acá pues ya lo tengo asociado simplemente le doy doble clic
Sí con el bloc de notas ni con Word ni con el wordpad porque el bl Este es un
archivo de texto plano y necesitamos que el programa que lo grabe lo grabe como
archivo plano Entonces lo abrimos con el blog de
buscar vamos a buscar cpu
Entonces por aquí nos apareció cpu affinity Max cuando recuerden cuando
tiene el signo número adelante quiere decir que no se está asignando ningún
valor a esta configuración él tomará la por defecto Entonces le debo quitar el
signo de número y le pongo por ejemplo 15 decíamos que
15 es para que use cu núcleos Entonces le podríamos en este
caso dejar ese valor de 15 y le decimos guardar ya Hi el cambio
pero todavía no lo Entonces qué debo hacer
abro el administrador de servicios
aquí ya lo abrí administrador de servicios y aquí en la lista de los
F acá simplemente le doy detener voy a cerrar con pye antes de
bloquea ent le decimos detener y le decimos
Qué ventajas tiene utilizar varios procesadores si está trabajando un solo
usuario y está haciendo un proceso y tenía un solo procesador
Entonces le va a responder Pues digamos que una velocidad buena Pero si ya hay
dos usuarios conectados o tres y solo tenía un procesador ese procesador pues
se va a demorar respondiéndole a todos pero si utilizo varios procesadores le
va a responder a todos de una forma muy rápida Entonces esta característica de
cpu affinity nos permite eso decir Cuántos procesadores puedo utilizar
fivir de los que yo tengo en mi computador vamos a pasar a default de
bkch page es la cantidad de memoria RAM reservada por base de datos ahí debemos
tener en cuenta que contap agroin cuando uno lo abre un área de trabajo él Abre
tres bases de datos Y si uno Abre una segunda área de trabajo ya abre una Por
qué en este caso Abre tres porque el sistema tiene dos bases de datos de
configuraciones y la del área de trabajo entonces por
eso siguientes veces solo va adicional este default de BK check page
lo debemos configurar según la memoria RAM que tenga el computador
computador que tiene aquí es 8 GB no 8 megas supongamos que tenemos un
computador que tiene 8 GB de memoria RAM entonces podríamos
asignarle este valor de 204800 a este parámetro de default de
Bach Eso quiere decir que va a reservar unos 800 megas
por cada base de datos entonces para un área de trabajo que abre tres bases de
datos va a reservar 2.4 GB si tenemos dos áreas de trabajo abiertas a la vez
Entonces ya va a gastar 3.2 GB Pero si por ejemplo el computador no
tiene 8 GB sino que tiene cuatro o de pronto tiene seis Entonces en este
parámetro ya no utilizaríamos un valor tan grande sino que le podríamos quitar
aquí un cero o sea bajarlo al 10% y estaría utilizando unos 80 megas por
cada una de las bases de datos que abra y el valor que trae el por defecto
es apenas de 20,48 o sea 8 megas Entonces miren que s Es recomendable
configurar este porque le vamos a subir de 8 megas por ejemplo a 80 o a
200 y esto podría mejorar mucho la velocidad también Cuando hacemos
procesos complicados o sea le pedimos a cont py que haga de pronto un informe
que tiene que hacer muchos cálculos o hay varios usuarios a la vez entonces
por eso debemos tener muy en cuenta Cuánta Ram tenemos en nuestro
computador Y cuánta tenemos Cuánta le podemos asignar a
f vamos a mirar por acá por sobre mi equipo le decimos
propiedades entonces aquí nos muestra las características y aquí dice memoria
RAM instalada 4 Gb Entonces yo ya sé que si
es de 4 Gb voy a utilizar este valor Entonces vamos a
buscarlo allá en el archivo de configuración de
y vamos a buscar 2048 que es el valor que tiene por
defecto ent si quiero subirle simplemente le quito el signo número y
le agrego acá el valor que quiero cerramos guardamos los cambios y
igual tendríamos que detener el servicio de
de F podríamos hacer todos los cambios a la
vez listo aquí es porque estamos explicando entonces uno por uno volvemos
a subir el servicio notemos que aquí dice el estado del servicio dice
iniciado o sea que ya tomó el cambio que acabamos de
hacer estos valores que hay acá normalmente pues son estos tres o
también podríamos utilizar estos dos entonces de acuerdo pues a la memoria
que tenga el computador disponible Por ejemplo si si tiene seis entonces
podríamos utilizar de pronto este es bajito este
20,480 podríamos utilizar 81,920 ahí tendríamos que hacer como pruebas pero
digamos que los recomendables son estos tres y en Casos intermedios podríamos
dos ahora vamos a este si simplemente es asignarle a la
variable sea un disco duro Ojalá diferente al del sistema operativo para
que el desempeño si se note esto de que si se note son pues
milisegundos pero todos en conjunto se pueden convertir en segundos incluso
podríamos asignarle varios discos eh d c etcétera igual está en nuestro archivo
de configuración de fiver vamos a
buscarlo entonces simplemente le quitamos el signo número y le escribimos
el la unidad que queremos Yo no le pongo e porque no
tengo disco e Solo tengo d tem
cerramos nuestro archivo lo guardamos como hicimos un cambio
servicio y volverlo a
subir y ya podemos abrir cont pime Entonces él va a tomar los cambios
Bueno les digo les cuento que estas configuraciones si ustedes toman tiempo
antes de hacerlas y luego de hacerlas pueden mejorar segundos o sea hicimos
una prueba en un servidor de 8 gbas de ram con una tabla de referencia Cruzada
y pasó de un minuto 35 segundos a un minuto 20 ustes dirán que la mejora no
es significativa pero si hay 10 usuarios
conectados haciendo el mismo informe sin estas configuraciones el desempeño se
caería mucho en cambio con estas configuraciones el desempeño Se va se va
a mantener casi igual entonces ahí donde sí se notaría cuando hay múltiples
usuarios trabajando en Pues que abrió contapyme pues la
prueba de tiempo pues no la podemos hacer por cuestiones de que la sesión es
Bueno vamos a pasar aquí a unas recomendaciones finales y ya luego
preguntas cuando uno instala el servidor de datos de contao agrin él instala el
motor de bases de datos F ustedes ven que se lanza la instalación y instala la
versión 2.51 que es la última versión que hay
del motor de base de datos fiber y cont
requiera esa porque como nosotros hicimos el desarrollo y Tratamos de
utilizar todo el potencial de F utilizamos características que salieron
en la versión 2.5 que no tiene la versión 2.1 ni la dos ni la
1 entonces si en una empresa ya está instalado fivir pues vamos a tener que
pasarlo al 2.5 para que contap funcione bien pero ahí tenemos un Lio
y cuál es el io aquí ya viene con el siguiente punto antes de instalar cont
pim agroin server verifique que no está instalado fivir si ya está instalado y
la versión es menor a la 2.5 a la que requi agroin contapyme averigüe Qué
programa lo está usando y contacte los desarrolladores o la empresa que lo
vende para poder pasar esa base de datos de la versión en la que esté a la nueva
versión Por qué hay que hacer esto supongamos
que estaba instalada la versión 2.1 y la base de datos Está construida
con la versión 2.1 si simplemente desinstalamos fivir e
instalamos el nuevo motor de la 2.5 y el otro programa que utilizaba que
ya estaba instalado abre la base de datos puede que trabaje bien pero
algunas características puede llegar a fallar puede que por ejemplo no muestre
las tildes adecuadamente o las eñes porque ese fue un cambio de los que
ellos hicieron los que crearon f en la versión
versión 2.5 Entonces lo recomendable es que esa
empresa o ese los desarrolladores de ese programa cojan la base de datos que está
en 2 punto en 2.1 y la pasen a 2.5 y ahí ya podíamos trabajar Eso es muy sencillo
los creadores de fib simplemente recomiendan que en la versión 2.5 2.1 o
sea antes de desinstalar generen una copia de
seguridad instalemos la versión 2.5 y se recupere esa copia de seguridad eso es
Pues lo más sencillo pero tenemos que garantizar con los de ese programa si
eso es 
… [truncado]
```

## Extracción

| Extraído (UTC) | 2026-06-04T03:26:43.496Z |
| Schema | 2 |
| JSON | `videos/2012/WTxPe96AUHA.json` |
| yt-dlp crudo | `videos/2012/WTxPe96AUHA.info.json` |
