import { AGENT_RAG_CORPUS } from "../agents/config.js";
import { loadBundledPromptFiles } from "../prompts/catalog.js";
import { PATY_PROMPT_TIPOS } from "../prompts/types.js";
import { ensurePatyiaSchema } from "./ensureSchema.js";
import { linkTdInstruccion, setTdCorpus, upsertInstruccion, upsertTdConsulta } from "./promptsRepo.js";

/** `data/patyia/prompts/catalog` → `bd_paty.paty_instruccion` + corpus por agente. */
export async function syncPatyiaPromptsFromIsaDoc(opts?: { log?: boolean }): Promise<void> {
	await ensurePatyiaSchema();
	const { baseMarkdown, agents } = await loadBundledPromptFiles();

	await upsertInstruccion({
		iinstruccion: "PATY_BASE",
		ninstruccion: "PROMPT_PATY_BASE",
		instruccion: baseMarkdown,
		descripcion: "Base Paty · 90-general.md",
		version: "ultra",
	});

	for (const tipo of PATY_PROMPT_TIPOS) {
		const { markdown } = agents[tipo];
		await upsertTdConsulta({
			itdconsulta: tipo,
			nconsulta: `PROMPT_${tipo}`,
			descripcion: `PROMPT_${tipo}.md`,
		});
		await upsertInstruccion({
			iinstruccion: tipo,
			ninstruccion: `PROMPT_${tipo}`,
			instruccion: markdown,
			descripcion: `Prompt Ultra · ${tipo}`,
			version: "ultra",
		});
		await linkTdInstruccion(tipo, tipo, 1);
		const corpus = AGENT_RAG_CORPUS[tipo] ?? ["contapyme"];
		await setTdCorpus(tipo, corpus);
		if (opts?.log !== false) {
			console.log(`✓ ${tipo} (${corpus.length ? corpus.join(",") : "sin RAG"})`);
		}
	}

	if (opts?.log !== false) {
		console.log(`\n${PATY_PROMPT_TIPOS.length} agentes + PATY_BASE en PostgreSQL.`);
	}
}
