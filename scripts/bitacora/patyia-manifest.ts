import type { BitacoraLayoutNode } from "../../src/lib/bitacora/types.js";

/** Rutas relativas a lab-langgraph/data/bitacora/patyia */
export const PATYIA_BITACORA_DATA = "data/bitacora/patyia";

export type MdRef = { id: string; path: string; dayId?: string };
export type SqlRef = {
	id: string;
	sqlPath: string;
	title: string;
	desc: string;
	checkKey: string;
	confirmKind?: "warning" | "danger" | "info";
	confirmMessage?: string;
	height?: string;
};

export const PATYIA_MD_SEGMENTS: MdRef[] = [
	{ id: "md.2026-06-09.vision-reasoning", path: "md/2026-06/09/01-vision-reasoning-estrategias.md", dayId: "2026-06-09" },
	{ id: "md.2026-06-06.catalog", path: "md/2026-06/06/01-prompts-catalog-actualizacion.md", dayId: "2026-06-06" },
	{ id: "md.2026-06-06.tk1435328", path: "md/2026-06/06/02-tk1435328-prompts-catalog.md", dayId: "2026-06-06" },
	{ id: "md.2026-06-05.catalog", path: "md/2026-06/05/01-prompts-catalog-actualizacion.md", dayId: "2026-06-05" },
	{ id: "md.2026-06-04.resumen", path: "md/2026-06/04/01-resumen-2026-06-04.md", dayId: "2026-06-04" },
	{ id: "md.2026-06-04.tk1433943", path: "md/2026-06/04/02-tk1433943-prompts-ultra-hoy.md", dayId: "2026-06-04" },
	{ id: "md.2026-06-04.tk1433968", path: "md/2026-06/04/03-tk1433968-prompts-openai.md", dayId: "2026-06-04" },
	{ id: "md.2026-06-03.resumen", path: "md/2026-06/03/01-resumen-2026-06-03.md", dayId: "2026-06-03" },
	{ id: "md.2026-06-03.gpt5-adjuntos", path: "md/2026-06/03/05-gpt5-nano-vs-mini-adjuntos-multimedia.md", dayId: "2026-06-03" },
	{ id: "md.2026-06-01.resumen", path: "md/2026-06/01/01-resumen-2026-06-01.md", dayId: "2026-06-01" },
	{ id: "md.2026-06-01.tk1431662", path: "md/2026-06/01/02-tk1431662-modelo-por-instruccion.md", dayId: "2026-06-01" },
	{ id: "md.2026-06-01.prompts-ultra", path: "md/2026-06/01/03-prompts-ultra-tdconsulta.md", dayId: "2026-06-01" },
	{ id: "md.2026-06-01.conversacion-log", path: "md/2026-06/01/04-conversacion-log-tabla.md", dayId: "2026-06-01" },
	{ id: "md.2026-06-01.tk1432903", path: "md/2026-06/01/05-tk1432903-cierre.md", dayId: "2026-06-01" },
	{ id: "md.2026-06-01.prompts-catalog", path: "md/2026-06/01/06-prompts-catalog-actualizacion.md", dayId: "2026-06-01" },
	{ id: "md.2026-05-29.reunion", path: "md/2026-05/29/02-reunion-propuesta-mejora-patyia.md", dayId: "2026-05-29" },
	{ id: "md.2026-05-29.cleanup", path: "md/2026-05/29/01-instrucciones-listado-y-limpieza.md", dayId: "2026-05-29" },
	{ id: "md.2026-05-28.saludo", path: "md/2026-05/28/01-saludo-perdido-diagnostico.md", dayId: "2026-05-28" },
	{ id: "md.2026-05-28.engines", path: "md/2026-05/28/02-comparativa-engines-responses-vs-agents.md", dayId: "2026-05-28" },
	{ id: "md.2026-05-25.intro", path: "md/2026-05/25/01-prompts-tdconsulta-intro.md", dayId: "2026-05-25" },
];

export const PATYIA_SQL_SEGMENTS: SqlRef[] = [
	{
		id: "sql.2026-06-06.seed-catalog",
		sqlPath: "sql/seed-prompts-tdconsulta.sql",
		title: "AYUDASCP_IA_STAGING · MERGE catálogo base (INSTRUCCION + TDCONSULTAXINSTRUCCION)",
		desc: "MERGE idempotente desde los 13 PROMPT_<TIPO>.md en catalog/. Tras editar .md: node scripts/patyia/prompts/build-paty-prompts-sql.mjs. Verificación: 13 filas en SELECT final.",
		checkKey: "2026-06-06.patyia.seed-prompts-catalog",
		confirmKind: "warning",
		confirmMessage: "Se actualizarán los 13 textos de INSTRUCCION con el contenido actual de catalog/PROMPT_<TIPO>.md (versión 1.0).\n\n¿Continuar en AYUDASCP_IA_STAGING?",
		height: "360px",
	},
	{
		id: "sql.2026-06-05.seed-catalog",
		sqlPath: "sql/seed-prompts-tdconsulta.sql",
		title: "AYUDASCP_IA_STAGING · MERGE catálogo base (INSTRUCCION + TDCONSULTAXINSTRUCCION)",
		desc: "MERGE idempotente: iinstruccion=<TIPO>, ninstruccion=PROMPT_<TIPO>, instruccion = texto literal de catalog/PROMPT_<TIPO>.md. Verificación: 13 filas.",
		checkKey: "2026-06-05.patyia.seed-prompts-catalog",
		confirmKind: "warning",
		confirmMessage: "Se actualizarán los 13 textos de INSTRUCCION con la versión catálogo base (PROMPT_<TIPO>.md, 1.0).\n\n¿Continuar en AYUDASCP_IA_STAGING?",
		height: "360px",
	},
	{
		id: "sql.2026-06-04.seed-ultra",
		sqlPath: "sql/seed-prompts-ultra-tdconsulta.sql",
		title: "AYUDASCP_IA_STAGING · MERGE Ultra (INSTRUCCION + TDCONSULTAXINSTRUCCION)",
		desc: "Tras editar .md: node scripts/patyia/prompts/build-paty-prompts-ultra-sql.mjs. Verificación: 13 filas PROMPT_%.",
		checkKey: "2026-06-04.patyia.seed-prompts-ultra-tk1433943",
		confirmKind: "warning",
		confirmMessage: "Se actualizarán los 13 textos Ultra en INSTRUCCION (2.0-ultra, TK-1433943).\n\n¿Continuar en AYUDASCP_IA_STAGING?",
		height: "360px",
	},
	{
		id: "sql.2026-06-01.modelo-nano",
		sqlPath: "sql/update-instruccion-modelo-gpt5-nano.sql",
		title: "AYUDASCP_IA · UPDATE MODELO = gpt-5-nano (todas las filas)",
		desc: "UPDATE en dbo.INSTRUCCION: todas las filas quedan con MODELO = gpt-5-nano.",
		checkKey: "2026-06-01.patyia.instruccion.modelo-nano",
		confirmKind: "warning",
		confirmMessage: "Se actualizará MODELO = gpt-5-nano en todas las filas de INSTRUCCION.\n\n¿Continuar?",
		height: "320px",
	},
	{
		id: "sql.2026-06-01.conversacion-log",
		sqlPath: "sql/create-conversacion-log.sql",
		title: "AYUDASCP_IA_STAGING · CREATE TABLE CONVERSACION_LOG (solo DDL)",
		desc: "Crea dbo.CONVERSACION_LOG si no existe. Solo DDL, sin relleno.",
		checkKey: "2026-06-01.patyia.conversacion-log.ddl",
		confirmKind: "warning",
		confirmMessage: "Se creará dbo.CONVERSACION_LOG en AYUDASCP_IA_STAGING.\n\n¿Continuar?",
		height: "360px",
	},
	{
		id: "sql.2026-06-01.seed-catalog",
		sqlPath: "sql/seed-prompts-tdconsulta.sql",
		title: "AYUDASCP_IA · MERGE prompts catálogo (INSTRUCCION + TDCONSULTAXINSTRUCCION)",
		desc: "MERGE idempotente sobre INSTRUCCION con contenido literal de catalog/PROMPT_<TIPO>.md.",
		checkKey: "2026-06-01.patyia.seed-prompts-catalog",
		confirmKind: "warning",
		confirmMessage: "Se actualizarán los 13 textos de INSTRUCCION con la versión catálogo base.\n\n¿Continuar?",
		height: "360px",
	},
	{
		id: "sql.2026-06-01.seed-ultra",
		sqlPath: "sql/seed-prompts-ultra-tdconsulta.sql",
		title: "AYUDASCP_IA · MERGE prompts Ultra (INSTRUCCION + TDCONSULTAXINSTRUCCION)",
		desc: "MERGE idempotente: texto Ultra con placeholders {{nombre_usuario}}.",
		checkKey: "2026-06-01.patyia.seed-prompts-ultra",
		confirmKind: "warning",
		confirmMessage: "Se actualizarán los 13 textos de INSTRUCCION con la versión Ultra.\n\n¿Continuar?",
		height: "360px",
	},
	{
		id: "sql.2026-05-29.select-instrucciones",
		sqlPath: "sql/select-all-instrucciones.sql",
		title: "AYUDASCP_IA · SELECT TOP 1000 INSTRUCCION",
		desc: "Lectura de inspección sobre dbo.INSTRUCCION (TOP 1000).",
		checkKey: "2026-05-29.patyia.instrucciones.select",
		height: "280px",
	},
	{
		id: "sql.2026-05-29.cleanup-instrucciones",
		sqlPath: "sql/cleanup-instrucciones-vacias.sql",
		title: "AYUDASCP_IA · CLEANUP INSTRUCCION sin contenido",
		desc: "DELETE de filas con INSTRUCCION y DESCRIPCION vacías (premisas residuales).",
		checkKey: "2026-05-29.patyia.instrucciones.cleanup",
		confirmKind: "danger",
		confirmMessage: "Se eliminarán filas de INSTRUCCION vacías (premisas residuales).\n\n¿Continuar?",
		height: "340px",
	},
	{
		id: "sql.2026-05-26.ninstruccion",
		sqlPath: "sql/update-nombres-instruccion.sql",
		title: "AYUDASCP_IA · UPDATE NINSTRUCCION con nombres semánticos en español",
		desc: "UPDATE NINSTRUCCION para los 13 tipos de instrucción.",
		checkKey: "2026-05-26.patyia.ninstruccion.update",
		confirmKind: "warning",
		confirmMessage: "Se actualizará NINSTRUCCION en los 13 registros.\n\n¿Continuar?",
		height: "340px",
	},
	{
		id: "sql.2026-05-25.seed-prompts",
		sqlPath: "sql/seed-prompts-tdconsulta.sql",
		title: "AYUDASCP_IA · MERGE de prompts específicos (INSTRUCCION + TDCONSULTAXINSTRUCCION)",
		desc: "MERGE idempotente sobre INSTRUCCION con contenido literal de cada .md.",
		checkKey: "2026-05-25.patyia.seed-prompts",
		confirmKind: "warning",
		height: "360px",
	},
	{
		id: "sql.2026-05-25.update-descripciones",
		sqlPath: "sql/update-descripciones-instruccion.sql",
		title: "AYUDASCP_IA · UPDATE de descripcion en INSTRUCCION (13 prompts)",
		desc: "UPDATE descripción funcional de los 13 PROMPT_<TIPO>.",
		checkKey: "2026-05-25.patyia.update-descripciones",
		confirmKind: "warning",
		height: "360px",
	},
];

export const PATYIA_LAYOUT_NODES: BitacoraLayoutNode[] = [
	{
		type: "day",
		title: "2026-06-09 — PatyIA: matriz visión × reasoning (jailbreak)",
		titleIcon: "mdi:calendar",
		open: true,
		checkKeys: ["2026-06-09.patyia.vision-reasoning-matrix"],
		children: [
			{
				type: "section",
				title: "Comparativa estrategias visión × reasoning (low / medium / high)",
				titleIcon: "mdi:scale-balance",
				checkKey: "2026-06-09.patyia.vision-reasoning-matrix",
				children: [{ type: "md", segmentId: "md.2026-06-09.vision-reasoning" }],
			},
		],
	},
	{
		type: "day",
		title: "2026-06-06 — PatyIA: TK-1435328 · MERGE prompts catálogo (13 tipos)",
		titleIcon: "mdi:calendar",
		open: false,
		checkKeys: ["2026-06-06.patyia.seed-prompts-catalog", "tickets.TK-1435328"],
		children: [
			{
				type: "section",
				title: "TK-1435328 · Refuerzo instrucciones Paty V3 (catálogo mejorado)",
				titleIcon: "mdi:text-box-check-outline",
				checkKeys: ["2026-06-06.patyia.seed-prompts-catalog", "tickets.TK-1435328"],
				children: [
					{ type: "md", segmentId: "md.2026-06-06.tk1435328" },
					{ type: "widget", widget: "PatyPgPromptsSync", props: { autoOnMount: true } },
					{ type: "sql", segmentId: "sql.2026-06-06.seed-catalog" },
				],
			},
			{
				type: "section",
				title: "Prompts catálogo · MERGE (050-prompts/catalog/PROMPT_*.md)",
				titleIcon: "mdi:text-box-multiple-outline",
				checkKey: "2026-06-06.patyia.seed-prompts-catalog",
				children: [
					{ type: "md", segmentId: "md.2026-06-06.catalog" },
				],
			},
		],
	},
	{
		type: "day",
		title: "2026-06-05 — PatyIA: actualización prompts catálogo base (13 tipos)",
		titleIcon: "mdi:calendar",
		open: false,
		checkKeys: ["2026-06-05.patyia.seed-prompts-catalog"],
		children: [
			{
				type: "section",
				title: "Prompts catálogo base · MERGE (catalog/PROMPT_*.md)",
				titleIcon: "mdi:text-box-multiple-outline",
				checkKey: "2026-06-05.patyia.seed-prompts-catalog",
				children: [
					{ type: "md", segmentId: "md.2026-06-05.catalog" },
					{ type: "sql", segmentId: "sql.2026-06-05.seed-catalog" },
				],
			},
		],
	},
	{
		type: "day",
		title: "2026-06-04 — PatyIA: TK-1433943 (Ultra BD) · TK-1433968 (pmpt obsoletos)",
		titleIcon: "mdi:calendar",
		open: false,
		checkKeys: ["2026-06-04.patyia.seed-prompts-ultra-tk1433943", "tickets.TK-1433943"],
		children: [
			{
				type: "section",
				title: "Resumen del día",
				titleIcon: "mdi:notebook-edit-outline",
				children: [{ type: "md", segmentId: "md.2026-06-04.resumen" }],
			},
			{
				type: "section",
				title: "TK-1433943 · Prompts Ultra reforzados (13 tipos)",
				titleIcon: "mdi:text-box-check-outline",
				checkKeys: ["2026-06-04.patyia.seed-prompts-ultra-tk1433943", "tickets.TK-1433943"],
				children: [
					{ type: "md", segmentId: "md.2026-06-04.tk1433943" },
					{ type: "widget", widget: "PatyPgPromptsSync", props: { autoOnMount: true } },
					{ type: "sql", segmentId: "sql.2026-06-04.seed-ultra" },
				],
			},
			{
				type: "section",
				title: "TK-1433968 · Objetos Prompt OpenAI obsoletos (pmpt_*)",
				titleIcon: "mdi:alert-decagram-outline",
				children: [{ type: "md", segmentId: "md.2026-06-04.tk1433968" }],
			},
		],
	},
	{
		type: "day",
		title: "2026-06-03 — PatyIA: gpt-5-nano vs gpt-5-mini (adjuntos multimedia)",
		titleIcon: "mdi:calendar",
		open: false,
		children: [
			{
				type: "section",
				title: "Resumen del día",
				titleIcon: "mdi:notebook-edit-outline",
				children: [{ type: "md", segmentId: "md.2026-06-03.resumen" }],
			},
			{
				type: "section",
				title: "gpt-5-nano vs gpt-5-mini · adjuntos en respuesta",
				titleIcon: "mdi:image-multiple-outline",
				children: [
					{ type: "widget", widget: "Gpt5AdjuntosDiscovery" },
					{ type: "md", segmentId: "md.2026-06-03.gpt5-adjuntos" },
				],
			},
		],
	},
	{
		type: "day",
		title: "2026-06-01 — PatyIA: TK-1431662, prompts Ultra y catálogo",
		titleIcon: "mdi:calendar",
		open: false,
		checkKeys: [
			"2026-06-01.patyia.instruccion.modelo-nano",
			"2026-06-01.patyia.seed-prompts-ultra",
			"2026-06-01.patyia.seed-prompts-catalog",
		],
		children: [
			{
				type: "section",
				title: "Resumen del día",
				titleIcon: "mdi:notebook-edit-outline",
				children: [{ type: "md", segmentId: "md.2026-06-01.resumen" }],
			},
			{
				type: "section",
				title: "TK-1431662 · MODELO en INSTRUCCION",
				titleIcon: "mdi:brain",
				checkKey: "2026-06-01.patyia.instruccion.modelo-nano",
				children: [
					{ type: "md", segmentId: "md.2026-06-01.tk1431662" },
					{ type: "sql", segmentId: "sql.2026-06-01.modelo-nano" },
				],
			},
			{
				type: "section",
				title: "TK-1432903 · CONVERSACION_LOG",
				titleIcon: "mdi:database-plus-outline",
				checkKeys: ["2026-06-01.patyia.conversacion-log.ddl", "tickets.TK-1432903"],
				children: [
					{ type: "md", segmentId: "md.2026-06-01.conversacion-log" },
					{ type: "md", segmentId: "md.2026-06-01.tk1432903" },
					{ type: "sql", segmentId: "sql.2026-06-01.conversacion-log" },
				],
			},
			{
				type: "section",
				title: "Prompts catálogo base · MERGE",
				titleIcon: "mdi:text-box-multiple-outline",
				checkKey: "2026-06-01.patyia.seed-prompts-catalog",
				children: [
					{ type: "md", segmentId: "md.2026-06-01.prompts-catalog" },
					{ type: "sql", segmentId: "sql.2026-06-01.seed-catalog" },
				],
			},
			{
				type: "section",
				title: "Prompts Ultra · MERGE",
				titleIcon: "mdi:text-box-check-outline",
				checkKeys: ["2026-06-01.patyia.seed-prompts-ultra", "2026-06-01.patyia.instruccion.modelo-nano"],
				children: [
					{ type: "md", segmentId: "md.2026-06-01.prompts-ultra" },
					{ type: "sql", segmentId: "sql.2026-06-01.seed-ultra" },
				],
			},
		],
	},
	{
		type: "group",
		title: "Mayo 2026 — Entradas diarias",
		titleIcon: "mdi:calendar-month",
		open: false,
		children: [
			{
				type: "day",
				title: "2026-05-29 — reunión, listado y limpieza INSTRUCCION",
				titleIcon: "mdi:calendar",
				open: true,
				checkKeys: ["2026-05-29.patyia.instrucciones.select", "2026-05-29.patyia.instrucciones.cleanup"],
				children: [
					{
						type: "section",
						title: "Análisis reunión · propuesta de mejora PatyIA",
						titleIcon: "mdi:file-document-outline",
						children: [{ type: "md", segmentId: "md.2026-05-29.reunion" }],
					},
					{
						type: "section",
						title: "Contexto · premisas dejan de persistirse en BD",
						titleIcon: "mdi:note-text-outline",
						children: [{ type: "md", segmentId: "md.2026-05-29.cleanup" }],
					},
					{
						type: "section",
						title: "INSTRUCCION · listado completo",
						titleIcon: "mdi:database-search-outline",
						checkKey: "2026-05-29.patyia.instrucciones.select",
						children: [{ type: "sql", segmentId: "sql.2026-05-29.select-instrucciones" }],
					},
					{
						type: "section",
						title: "INSTRUCCION · DELETE premisas residuales",
						titleIcon: "mdi:database-remove-outline",
						checkKey: "2026-05-29.patyia.instrucciones.cleanup",
						children: [{ type: "sql", segmentId: "sql.2026-05-29.cleanup-instrucciones" }],
					},
				],
			},
			{
				type: "day",
				title: "2026-05-28 — diagnóstico saludo perdido",
				titleIcon: "mdi:calendar",
				open: true,
				children: [
					{
						type: "section",
						title: "Diagnóstico · override instructions sobre PR_GENERAL",
						titleIcon: "mdi:bug-outline",
						children: [{ type: "md", segmentId: "md.2026-05-28.saludo" }],
					},
					{
						type: "section",
						title: "Comparativa Responses vs Agents SDK",
						titleIcon: "mdi:scale-balance",
						children: [{ type: "md", segmentId: "md.2026-05-28.engines" }],
					},
				],
			},
			{
				type: "day",
				title: "2026-05-26 — NINSTRUCCION semánticos",
				titleIcon: "mdi:calendar",
				open: true,
				checkKeys: ["2026-05-26.patyia.ninstruccion.update"],
				children: [
					{
						type: "section",
						title: "INSTRUCCION · Actualizar NINSTRUCCION",
						titleIcon: "mdi:translate",
						checkKey: "2026-05-26.patyia.ninstruccion.update",
						children: [{ type: "sql", segmentId: "sql.2026-05-26.ninstruccion" }],
					},
				],
			},
			{
				type: "day",
				title: "2026-05-25 — Carga inicial prompts por tipo",
				titleIcon: "mdi:calendar",
				open: true,
				checkKeys: ["2026-05-25.patyia.seed-prompts", "2026-05-25.patyia.update-descripciones"],
				children: [
					{
						type: "section",
						title: "Modelado: INSTRUCCION + TDCONSULTAXINSTRUCCION",
						titleIcon: "mdi:database-arrow-down-outline",
						children: [{ type: "md", segmentId: "md.2026-05-25.intro" }],
					},
					{
						type: "section",
						title: "SQL · Seed y actualización",
						titleIcon: "mdi:database-edit-outline",
						checkKeys: ["2026-05-25.patyia.seed-prompts", "2026-05-25.patyia.update-descripciones"],
						children: [
							{ type: "sql", segmentId: "sql.2026-05-25.seed-prompts" },
							{ type: "sql", segmentId: "sql.2026-05-25.update-descripciones" },
						],
					},
				],
			},
		],
	},
];
