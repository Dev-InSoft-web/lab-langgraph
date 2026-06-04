import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PATYIA_PROMPTS_CATALOG } from "../../core/lab-data-paths.js";
import { getAgentSystemPromptFromDb, listAgentTipos } from "../db/promptsRepo.js";
import type { PatyPromptTipo, PromptCatalogFile } from "./types.js";
import { PATY_PROMPT_TIPOS } from "./types.js";
import { interpolatePromptVars } from "./vars.js";

export { interpolatePromptVars };

/** Prompts empaquetados en `data/patyia/prompts/catalog` (sync → PG). */
export async function loadBundledPromptFiles(): Promise<{
	baseMarkdown: string;
	agents: Record<PatyPromptTipo, { markdown: string; filename: string }>;
}> {
	const catalogRoot = PATYIA_PROMPTS_CATALOG();
	const baseMarkdown = await readFile(join(catalogRoot, "90-general.md"), "utf8");
	const agents = {} as Record<PatyPromptTipo, { markdown: string; filename: string }>;
	for (const tipo of PATY_PROMPT_TIPOS) {
		const markdown = await readFile(
			join(catalogRoot, "Ultra", `PROMPT_${tipo}.md`),
			"utf8",
		);
		agents[tipo] = { markdown, filename: `PROMPT_${tipo}.md` };
	}
	return { baseMarkdown, agents };
}

/** @deprecated Alias — usar loadBundledPromptFiles */
export const loadIsaDocPromptFiles = loadBundledPromptFiles;

export async function getAgentDefinition(
	tipo: PatyPromptTipo,
	nombreUsuario: string,
): Promise<{ tipo: PatyPromptTipo; systemPrompt: string }> {
	const systemPrompt = await getAgentSystemPromptFromDb(tipo, nombreUsuario);
	return { tipo, systemPrompt };
}

export async function getPromptCatalogSummary(): Promise<{
	syncedAt: string;
	agents: { tipo: string; filename: string }[];
}> {
	const tipos = await listAgentTipos();
	return {
		syncedAt: new Date().toISOString(),
		agents: tipos.map((tipo) => ({ tipo, filename: `PROMPT_${tipo}.md` })),
	};
}

export async function getPromptCatalog(_forceRefresh = false): Promise<PromptCatalogFile> {
	const { baseMarkdown, agents } = await loadBundledPromptFiles();
	const catalogAgents = {} as PromptCatalogFile["agents"];
	for (const tipo of PATY_PROMPT_TIPOS) {
		const a = agents[tipo];
		catalogAgents[tipo] = {
			tipo,
			filename: a.filename,
			markdown: a.markdown,
			systemPrompt: interpolatePromptVars(
				`${baseMarkdown}\n\n---\n\n## Agente activo\n\n${a.markdown}`,
				{ nombre_usuario: "{{nombre_usuario}}" },
			),
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
