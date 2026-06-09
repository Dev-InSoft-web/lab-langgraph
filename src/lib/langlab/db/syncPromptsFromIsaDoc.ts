import { AGENT_RAG_CORPUS } from "../agents/config.js";
import { loadBundledPromptFiles } from "../prompts/catalog.js";
import { CONSULTA_TIPOS } from "../prompts/types.js";
import { ensureLanglabSchema } from "./ensureSchema.js";
import { linkTdInstruccion, setTdCorpus, upsertInstruccion, upsertTdConsulta } from "./promptsRepo.js";

/** `data/patyia/prompts/catalog` (ISA-DOC) → `BD_LANGLAB.INSTRUCCION_INSTRUCCION` + corpus por agente. */
export async function syncLanglabPromptsFromBundled(opts?: { log?: boolean }): Promise<void> {
	await ensureLanglabSchema();
	const { baseMarkdown, agents } = await loadBundledPromptFiles();

	await upsertInstruccion({
		iinstruccion: "LANGLAB_BASE",
		ninstruccion: "PROMPT_LANGLAB_BASE",
		instruccion: baseMarkdown,
		descripcion: "Base asistente · 90-general.md",
		version: "ultra",
	});

	for (const tipo of CONSULTA_TIPOS) {
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
		console.log(`\n${CONSULTA_TIPOS.length} agentes + LANGLAB_BASE en PostgreSQL.`);
	}
}
