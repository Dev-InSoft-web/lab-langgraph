/**
 * Solo scripts de sync/seed — NO usar en handlers HTTP.
 * Importa MD locales → upsert en BD_LANGLAB.INSTRUCCION.
 */
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { PATYIA_PROMPTS_CATALOG } from "../../core/lab-data-paths.js";
import type { ConsultaTipo } from "../prompts/types.js";
import { CONSULTA_TIPOS } from "../prompts/types.js";

export async function loadBundledPromptFiles(): Promise<{
	baseMarkdown: string;
	agents: Record<ConsultaTipo, { markdown: string; filename: string }>;
}> {
	const catalogRoot = PATYIA_PROMPTS_CATALOG();
	const baseMarkdown = await readFile(join(catalogRoot, "90-general.md"), "utf8");
	const agents = {} as Record<ConsultaTipo, { markdown: string; filename: string }>;
	for (const tipo of CONSULTA_TIPOS) {
		const catalogPath = join(catalogRoot, `PROMPT_${tipo}.md`);
		const ultraPath = join(catalogRoot, "Ultra", `PROMPT_${tipo}.md`);
		let markdown: string;
		let filename: string;
		try {
			await access(catalogPath);
			markdown = await readFile(catalogPath, "utf8");
			filename = `PROMPT_${tipo}.md`;
		} catch {
			markdown = await readFile(ultraPath, "utf8");
			filename = `Ultra/PROMPT_${tipo}.md`;
		}
		agents[tipo] = { markdown, filename };
	}
	return { baseMarkdown, agents };
}
