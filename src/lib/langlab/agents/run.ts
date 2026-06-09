import { getRagDatabaseUrlOptional } from "../../core/config.js";
import { invokeOrchestratedLanglabChat } from "../../llm/orchestrated-chat.js";
import { ask, formatContext } from "../../rag/ask.js";
import { normalizeCorpusList } from "../../rag/metadata.js";
import { getAgentDefinition } from "../prompts/catalog.js";
import { getCorpusForTipo } from "../db/promptsRepo.js";
import type { ConsultaTipo } from "../prompts/types.js";
import { corpusForAgent, temperatureForAgent } from "./config.js";

export type runLanglabAgentInput = {
	tipo: ConsultaTipo;
	userPrompt: string;
	nombreUsuario: string;
	corpusOverride?: string[];
	skipRag?: boolean;
};

export type runLanglabAgentResult = {
	answer: string;
	ragContext: string;
	corpus: string[];
	chunksCount: number;
	ragUsed: boolean;
	ragSkipReason?: string;
	provider?: string;
	keyLabel?: string;
	leaseId?: string;
	model?: string;
};

export type RagRetrieveResult = {
	ragContext: string;
	corpus: string[];
	chunksCount: number;
	used: boolean;
	skipReason?: string;
};

export async function retrieveAgentRag(
	prompt: string,
	tipo: ConsultaTipo,
	corpusOverride?: string[],
	skipRag = false,
): Promise<RagRetrieveResult> {
	let corpus = corpusOverride?.length ? corpusOverride : await getCorpusForTipo(tipo);
	if (!corpus.length) corpus = corpusForAgent(tipo);
	if (skipRag) {
		return { ragContext: "", corpus, chunksCount: 0, used: false, skipReason: "skip_flag" };
	}
	if (corpus.length === 0) {
		return { ragContext: "", corpus: [], chunksCount: 0, used: false, skipReason: "empty_corpus" };
	}
	if (!getRagDatabaseUrlOptional()) {
		console.warn("RAG omitido: RAG_DATABASE_URL no configurada (chat sin vectores)");
		return {
			ragContext: "",
			corpus,
			chunksCount: 0,
			used: false,
			skipReason: "no_rag_database",
		};
	}
	const normalized = normalizeCorpusList(corpus) ?? [];
	const { chunks } = await ask(prompt, 6, normalized.length ? { corpus: normalized } : undefined);
	const ragContext = formatContext(chunks);
	return {
		ragContext,
		corpus: normalized.length ? normalized : corpus,
		chunksCount: chunks.length,
		used: chunks.length > 0,
		skipReason: chunks.length ? undefined : "no_chunks",
	};
}

export async function runLanglabAgent(input: runLanglabAgentInput): Promise<runLanglabAgentResult> {
	const { tipo, userPrompt, nombreUsuario, corpusOverride, skipRag } = input;
	const { systemPrompt } = await getAgentDefinition(tipo, nombreUsuario);
	const rag = await retrieveAgentRag(userPrompt, tipo, corpusOverride, skipRag);

	const human = rag.ragContext
		? `Contexto documentado recuperado (RAG):\n${rag.ragContext}\n\nConsulta del usuario:\n${userPrompt}`
		: userPrompt;

	const chat = await invokeOrchestratedLanglabChat({
		systemPrompt,
		human,
		temperature: temperatureForAgent(tipo),
	});
	return {
		answer: chat.answer,
		ragContext: rag.ragContext,
		corpus: rag.corpus,
		chunksCount: rag.chunksCount,
		ragUsed: rag.used,
		ragSkipReason: rag.skipReason,
		provider: chat.provider,
		keyLabel: chat.keyLabel,
		leaseId: chat.leaseId,
		model: chat.model,
	};
}
