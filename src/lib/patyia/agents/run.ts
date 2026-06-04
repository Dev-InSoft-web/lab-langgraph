import { invokeOrchestratedPatyChat } from "../../llm/orchestrated-chat.js";
import { ask, formatContext } from "../../rag/ask.js";
import { normalizeCorpusList } from "../../rag/metadata.js";
import { getAgentDefinition } from "../prompts/catalog.js";
import { getCorpusForTipo } from "../db/promptsRepo.js";
import type { PatyPromptTipo } from "../prompts/types.js";
import { corpusForAgent, temperatureForAgent } from "./config.js";

export type RunPatyAgentInput = {
	tipo: PatyPromptTipo;
	userPrompt: string;
	nombreUsuario: string;
	corpusOverride?: string[];
	skipRag?: boolean;
};

export type RunPatyAgentResult = {
	answer: string;
	ragContext: string;
	corpus: string[];
	provider?: string;
	keyLabel?: string;
	leaseId?: string;
	model?: string;
};

export async function retrieveAgentRag(
	prompt: string,
	tipo: PatyPromptTipo,
	corpusOverride?: string[],
	skipRag = false,
): Promise<{ ragContext: string; corpus: string[] }> {
	let corpus = corpusOverride?.length ? corpusOverride : await getCorpusForTipo(tipo);
	if (!corpus.length) corpus = corpusForAgent(tipo);
	if (skipRag || corpus.length === 0) {
		return { ragContext: "", corpus };
	}
	const normalized = normalizeCorpusList(corpus) ?? [];
	const { chunks } = await ask(prompt, 6, normalized.length ? { corpus: normalized } : undefined);
	return { ragContext: formatContext(chunks), corpus: normalized.length ? normalized : corpus };
}

export async function runPatyAgent(input: RunPatyAgentInput): Promise<RunPatyAgentResult> {
	const { tipo, userPrompt, nombreUsuario, corpusOverride, skipRag } = input;
	const { systemPrompt } = await getAgentDefinition(tipo, nombreUsuario);
	const { ragContext, corpus } = await retrieveAgentRag(userPrompt, tipo, corpusOverride, skipRag);

	const human = ragContext
		? `Contexto documentado recuperado (RAG):\n${ragContext}\n\nConsulta del usuario:\n${userPrompt}`
		: userPrompt;

	const chat = await invokeOrchestratedPatyChat({
		systemPrompt,
		human,
		temperature: temperatureForAgent(tipo),
	});
	return {
		answer: chat.answer,
		ragContext,
		corpus,
		provider: chat.provider,
		keyLabel: chat.keyLabel,
		leaseId: chat.leaseId,
		model: chat.model,
	};
}
