import type { BitacoraLayoutNode } from "../../src/lib/bitacora/types.js";

/** Árbol de bitácora ClientesIS (espejo de BitacoraPanel.svelte). */
export const CLIENTESIS_LAYOUT_NODES: BitacoraLayoutNode[] = [
	{
		type: "section",
		title: "Cursos (ISW) — Reglas, restricciones y avances",
		titleIcon: "mdi:book-education-outline",
		children: [{ type: "md", segmentId: "md.topics.cursos.cursos-isw-reglas" }],
	},
	{ type: "widget", widget: "OldRebuildSection", props: {} },
	{
		type: "group",
		title: "Mayo 2026 — Entradas diarias",
		titleIcon: "mdi:calendar-month",
		open: false,
		children: [
			{
				type: "day",
				title: "2026-05-29 — QA Camilo: errores en itdform=create para Contenido de curso y Cursos integrados",
				titleIcon: "mdi:calendar",
				open: true,
				children: [
					{
						type: "section",
						title: "Video dmlU60yHNEc · Contexto para TK-1430975 y TK-1430974",
						titleIcon: "mdi:video-outline",
						children: [{ type: "md", segmentId: "md.2026-05-29.01-qa-camilo-itdform-create" }],
					},
				],
			},
			{
				type: "day",
				title: "2026-05-26 — PatyIA: actualización de NINSTRUCCION con nombres semánticos en español",
				titleIcon: "mdi:calendar",
				open: true,
				checkKeys: ["2026-05-26.patyia.ninstruccion.update"],
				children: [
					{
						type: "section",
						title: "AYUDASCP_IA · Actualizar NINSTRUCCION con labels semánticos",
						titleIcon: "mdi:translate",
						checkKey: "2026-05-26.patyia.ninstruccion.update",
						children: [
							{ type: "md", segmentId: "md.2026-05-26.01-patyia-ninstruccion" },
							{ type: "sql", segmentId: "sql.2026-05-26.paty.ninstruccion" },
						],
					},
				],
			},
			{
				type: "day",
				title: "2026-05-21 — Cierre TK-1426681/1426900/1428161 + estandarización de helpers de tickets y Accordion",
				titleIcon: "mdi:calendar",
				open: true,
				children: [
					{ type: "section", title: "Cierre del TK-1426681 (Cursos / Planes de Estudio)", titleIcon: "mdi:check-decagram", children: [{ type: "md", segmentId: "md.2026-05-21.01-cierre-tk1426681" }] },
					{ type: "section", title: "Estándar de imágenes para tickets (img() + imgbb)", titleIcon: "mdi:image-multiple-outline", children: [{ type: "md", segmentId: "md.2026-05-21.02-img-imgbb" }] },
					{ type: "section", title: "Helper simpleTable y tablas email-safe centralizadas", titleIcon: "mdi:table", children: [{ type: "md", segmentId: "md.2026-05-21.03-simple-table" }] },
					{ type: "section", title: "Iconos como <img> con color por query y min/max width", titleIcon: "mdi:image-outline", children: [{ type: "md", segmentId: "md.2026-05-21.04-icon-img-color" }] },
					{ type: "section", title: "Accordion con checkKey/checkKeys (auto RevisadoCheck)", titleIcon: "mdi:check-circle-outline", children: [{ type: "md", segmentId: "md.2026-05-21.05-accordion-checks" }] },
					{ type: "section", title: "Estándar: commits + resumen de tiempos al culminar un TK", titleIcon: "mdi:source-commit", children: [{ type: "md", segmentId: "md.2026-05-21.06-commits-tiempos-obligatorios" }] },
					{ type: "section", title: "Cierre TK-1426900 y TK-1428161 (Cursos integrados + persistencia de columnas)", titleIcon: "mdi:ticket-confirmation-outline", children: [{ type: "md", segmentId: "md.2026-05-21.07-tickets-cerrados-cursos" }] },
					{ type: "section", title: "Fix: merge remoto borró entradas de imgbb-map.json + iconos faltantes", titleIcon: "mdi:alert-circle-outline", children: [{ type: "md", segmentId: "md.2026-05-21.08-fix-bitacora-mapa-iconos" }] },
				],
			},
			{
				type: "day",
				title: "2026-05-15 — Capacitación: alta de acciones extendidas (Verificar / Duplicar / Recodificar / Consolidar / Eliminar) para Cursos y Planes de Estudio",
				titleIcon: "mdi:calendar",
				open: true,
				checkKeys: ["2026-05-15.seguridad.acciones.cursos.plandeestudio"],
				children: [
					{
						type: "section",
						title: "Seguridad · Insertar acciones faltantes en SEG_ACCIONESXROL (Cursos, PlanDeEstudio)",
						titleIcon: "mdi:shield-key-outline",
						checkKey: "2026-05-15.seguridad.acciones.cursos.plandeestudio",
						children: [{ type: "sql", segmentId: "sql.2026-05-15.seguridad.acciones" }],
					},
				],
			},
			{
				type: "day",
				title: "2026-05-14 — Capacitación: JCONFIG v2 (nomenclatura = componentes) + iplanpadre como BtnRef",
				titleIcon: "mdi:calendar",
				open: true,
				checkKeys: ["2026-05-14.driver.atributos.jconfig.v2", "2026-05-14.atributos.planes.cleanup.vacios"],
				children: [
					{
						type: "section",
						title: "Drivers · JCONFIG v2 (InputText, InputNumber, Switch, RichEditor, SelectObject, BtnRef, CatalogoGen)",
						titleIcon: "mdi:code-json",
						checkKey: "2026-05-14.driver.atributos.jconfig.v2",
						children: [
							{ type: "md", segmentId: "md.2026-05-14.driver-atributos-jconfig-v2-intro" },
							{ type: "widget", widget: "JconfigDriverMatrix" },
							{ type: "sql", segmentId: "sql.2026-05-14.jconfig.v2" },
						],
					},
					{
						type: "section",
						title: "CAPAC_ATRIBUTOS_PLANES · Limpieza de filas con VALOR vacío",
						titleIcon: "mdi:broom",
						open: false,
						checkKey: "2026-05-14.atributos.planes.cleanup.vacios",
						children: [{ type: "sql", segmentId: "sql.2026-05-14.atributos.cleanup" }],
					},
				],
			},
			{
				type: "widget",
				widget: "DailySummary",
				props: {
					title: "2026-05-13 — Cierre QA Capacitación (acciones en list-slaves, scroll Details) y normativa de tiquetes en ISA-DOC",
					open: true,
					segmentIds: {
						isa: "md.2026-05-13.resumen-isa",
						isp: "md.2026-05-13.resumen-isp",
						iswIsp: "md.2026-05-13.resumen-isw-isp",
						iss: "md.2026-05-13.resumen-iss",
						seguimiento: "md.2026-05-13.resumen-seguimiento",
					},
				},
			},
			{
				type: "widget",
				widget: "DailySummary",
				props: {
					title: "2026-05-11 — Consolidado (09–11): TreeView (historial, candado, ciclos Svelte 5), módulos Capacitación y releases ispsveltecomponents 0.0.106–0.0.108",
					open: true,
					segmentIds: {
						isa: "md.2026-05-11.resumen-isa",
						iswIsp: "md.2026-05-11.resumen-isw-isp",
						iss: "md.2026-05-11.resumen-iss",
						seguimiento: "md.2026-05-11.resumen-seguimiento",
					},
				},
			},
			{
				type: "widget",
				widget: "DailySummary",
				props: {
					title: "2026-05-08 — Capacitación: refactor TreeView (cascada de adaptadores) + cierre del Plan de contenidos del curso",
					open: true,
					segmentIds: {
						isa: "md.2026-05-08.resumen-isa",
						iswIsp: "md.2026-05-08.resumen-isw-isp",
						iss: "md.2026-05-08.resumen-iss",
						seguimiento: "md.2026-05-08.resumen-seguimiento",
					},
				},
			},
			{
				type: "widget",
				widget: "DailySummary",
				props: {
					title: "2026-05-07 — Capacitación: Plan ↔ Curso (drawer + auto-open BtnRef) y fix de ciclo reactivo en TreeContenidos",
					open: true,
					segmentIds: {
						isa: "md.2026-05-07.resumen-isa",
						iswIsp: "md.2026-05-07.resumen-isw-isp",
						iss: "md.2026-05-07.resumen-iss",
						seguimiento: "md.2026-05-07.resumen-seguimiento",
					},
				},
			},
			{
				type: "day",
				title: "2026-05-06 — Capacitación: tracking temporal de índices",
				titleIcon: "mdi:calendar",
				open: true,
				checkKeys: ["2026-05-06.atributosplan.driver_recurso_codes"],
				children: [
					{
						type: "widget",
						widget: "DailySummary",
						props: {
							title: "Resumen del día",
							open: false,
							segmentIds: {
								isa: "md.2026-05-06.resumen-isa",
								iswIsp: "md.2026-05-06.resumen-isw-isp",
								iss: "md.2026-05-06.resumen-iss",
							},
							inner: true,
						},
					},
					{
						type: "section",
						title: "Atributos de plan · Migrar códigos legacy de TTDriverRecurso a numérico (IATRIBUTO=3)",
						titleIcon: "mdi:numeric",
						open: false,
						checkKey: "2026-05-06.atributosplan.driver_recurso_codes",
						children: [{ type: "sql", segmentId: "sql.2026-05-06.driver-recurso-codes" }],
					},
				],
			},
			{
				type: "day",
				title: "2026-05-05 — Capacitación: IMAGENDRIVER / DOCUMENTODRIVER → atributos plan + auditoría",
				titleIcon: "mdi:calendar",
				open: true,
				checkKeys: [
					"2026-05-05.imgdoc.fase1a",
					"2026-05-05.imgdoc.fase1b",
					"2026-05-05.imgdoc.fase2a",
					"2026-05-05.imgdoc.fase2b",
					"2026-05-05.imgdoc.fase2c",
					"2026-05-05.audit.add_columns",
					"2026-05-05.audit.drop_columns",
					"2026-05-05.cursos.activate_all",
					"2026-05-05.cursos.delete_sin_driver",
				],
				children: [
					{
						type: "widget",
						widget: "DailySummary",
						props: {
							title: "Resumen del día",
							open: false,
							segmentIds: {
								isa: "md.2026-05-05.resumen-isa",
								iswIsp: "md.2026-05-05.resumen-isw-isp",
								iss: "md.2026-05-05.resumen-iss",
								seguimiento: "md.2026-05-05.resumen-seguimiento",
							},
							inner: true,
						},
					},
					{ type: "widget", widget: "ImagenDocumentoDriverMigration" },
					{
						type: "section",
						title: "Auditoría y activación · Cursos / Planes de Estudio",
						titleIcon: "mdi:database-cog",
						open: false,
						checkKeys: [
							"2026-05-05.audit.add_columns",
							"2026-05-05.audit.drop_columns",
							"2026-05-05.cursos.activate_all",
							"2026-05-05.cursos.delete_sin_driver",
						],
						children: [
							{ type: "md", segmentId: "md.topics.audit.intro" },
							{ type: "sql", segmentId: "sql.2026-05-05.audit.add" },
							{ type: "md", segmentId: "md.topics.audit.drop-intro" },
							{ type: "sql", segmentId: "sql.2026-05-05.audit.drop" },
							{ type: "sql", segmentId: "sql.2026-05-05.cursos.activate" },
							{ type: "sql", segmentId: "sql.2026-05-05.cursos.delete-sin-driver" },
						],
					},
				],
			},
			{
				type: "day",
				title: "2026-05-04 — Capacitación: limpieza, migración IPLANPADRE, reconstrucción CAPAC_*_OLD y snapshots",
				titleIcon: "mdi:calendar",
				open: true,
				checkKeys: [
					"2026-05-04.cleanup.run",
					"2026-05-04.cleanup.atributos_planes",
					"2026-05-04.iplanpadre.fase1",
					"2026-05-04.iplanpadre.fase2a",
					"2026-05-04.iplanpadre.fase2",
					"2026-05-04.iplanpadre.fase3",
					"2026-05-04.iplanpadre.fase4",
				],
				children: [
					{
						type: "widget",
						widget: "DailySummary",
						props: {
							title: "Resumen del día",
							open: false,
							segmentIds: {
								isa: "md.2026-05-04.resumen-isa",
								iswIsp: "md.2026-05-04.resumen-isw-isp",
								iss: "md.2026-05-04.resumen-iss",
							},
							inner: true,
						},
					},
					{ type: "widget", widget: "CleanupTestDataMigration" },
					{ type: "widget", widget: "IplanpadreToAtributoMigration" },
				],
			},
			{
				type: "day",
				title: "2026-05-03 — Curso GET/UPDATE devuelve 500 tras npm i",
				titleIcon: "mdi:calendar",
				open: true,
				children: [{ type: "md", segmentId: "md.2026-05-03.curso-get-update-500" }],
			},
		],
	},
	{
		type: "day",
		title: "2026-06-01 — Resumen: TK-1430974 (correcciones, documentación y evidencia pendiente)",
		titleIcon: "mdi:calendar",
		open: true,
		children: [{ type: "md", segmentId: "md.2026-06-01.01-resumen-2026-06-01" }],
	},
];
