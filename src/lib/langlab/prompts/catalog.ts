import {
	getAgentSystemPromptFromDb,
	getBasePromptMarkdown,
	listAgentTipos,
	listInstruccionesFromDb,
} from "../db/promptsRepo.js";
import type { ConsultaTipo, PromptCatalogFile } from "./types.js";
import { CONSULTA_TIPOS } from "./types.js";
import { interpolatePromptVars } from "./vars.js";
import { wrapAgentPrompt } from "./prompt-common.js";

export { interpolatePromptVars };

/** @deprecated Solo sync/seed — usar `bundled-prompts-loader.ts` */
export { loadBundledPromptFiles } from "../db/bundled-prompts-loader.js";

/** @deprecated Alias */
export { loadBundledPromptFiles as loadIsaDocPromptFiles } from "../db/bundled-prompts-loader.js";

export async function getAgentDefinition(
	tipo: ConsultaTipo,
	nombreUsuario: string,
): Promise<{ tipo: ConsultaTipo; systemPrompt: string }> {
	const systemPrompt = await getAgentSystemPromptFromDb(tipo, nombreUsuario);
	return { tipo, systemPrompt };
}

export async function getPromptCatalogSummary(): Promise<{
	syncedAt: string;
	agents: { tipo: string; filename: string }[];
}> {
	const rows = await listInstruccionesFromDb();
	const agents = rows
		.filter((r) => r.iinstruccion !== "LANGLAB_BASE" && r.iinstruccion !== "CLASSIFIER_TIPO_CONSULTA")
		.map((r) => ({
			tipo: r.iinstruccion,
			filename: r.descripcion?.includes(".md") ? r.descripcion : `PROMPT_${r.iinstruccion}.md`,
		}));
	return {
		syncedAt: new Date().toISOString(),
		agents,
	};
}

/** Catálogo completo desde BD_LANGLAB.INSTRUCCION (sin leer MD locales). */
export async function getPromptCatalog(_forceRefresh = false): Promise<PromptCatalogFile> {
	const baseMarkdown = await getBasePromptMarkdown();
	const rows = await listInstruccionesFromDb();
	const byKey = new Map(rows.map((r) => [r.iinstruccion, r]));

	const catalogAgents = {} as PromptCatalogFile["agents"];
	for (const tipo of CONSULTA_TIPOS) {
		const row = byKey.get(tipo);
		const markdown = row?.instruccion ?? "";
		const filename = row?.descripcion?.includes(".md")
			? row.descripcion
			: `PROMPT_${tipo}.md`;
		catalogAgents[tipo] = {
			tipo,
			filename,
			markdown,
			systemPrompt: interpolatePromptVars(wrapAgentPrompt(baseMarkdown, markdown), {
				nombre_usuario: "{{nombre_usuario}}",
			}),
		};
	}
	return {
		schemaVersion: 1,
		syncedAt: new Date().toISOString(),
		isaDocRoot: "",
		baseMarkdown,
		agents: catalogAgents,
	};
}
