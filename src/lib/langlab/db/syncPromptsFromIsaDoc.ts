import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PATYIA_PROMPTS_CATALOG } from "../../core/lab-data-paths.js";
import { AGENT_RAG_CORPUS } from "../agents/config.js";
import { loadBundledPromptFiles } from "./bundled-prompts-loader.js";
import { CONSULTA_TIPOS } from "../prompts/types.js";
import { ensureLanglabSchema } from "./ensureSchema.js";
import {
	CLASSIFIER_KEY,
	linkTdInstruccion,
	setTdCorpus,
	upsertInstruccion,
	upsertTdConsulta,
} from "./promptsRepo.js";

async function syncClassifierFromBundledMd(log: boolean): Promise<void> {
	const path = join(PATYIA_PROMPTS_CATALOG(), "operativo", "clasificador-tipo-consulta-pmpt.md");
	try {
		const md = await readFile(path, "utf8");
		const block = md.match(/```\s*([\s\S]*?)```/);
		const instruccion = block?.[1]?.includes("tipo_consulta") ? block[1].trim() : "";
		if (!instruccion) return;
		await upsertInstruccion({
			iinstruccion: CLASSIFIER_KEY,
			ninstruccion: CLASSIFIER_KEY,
			instruccion,
			descripcion: "clasificador-tipo-consulta-pmpt.md",
			version: "operativo",
		});
		if (log) console.log(`✓ ${CLASSIFIER_KEY}`);
	} catch {
		/* sin archivo local */
	}
}

/** `data/patyia/prompts/catalog` (ISA-DOC) → `BD_LANGLAB.INSTRUCCION_INSTRUCCION` + corpus por agente. */
export async function syncLanglabPromptsFromBundled(opts?: { log?: boolean }): Promise<void> {
	await ensureLanglabSchema();
	const log = opts?.log !== false;
	await syncClassifierFromBundledMd(log);
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
