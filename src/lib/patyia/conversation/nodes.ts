import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createChatLlm } from "../../llm/chat-llm.js";
import { CHAT_MODEL } from "../../core/config.js";
import { runPatyAgent } from "../agents/run.js";
import { routePromptTipo } from "../prompts/router.js";
import { isPatyPromptTipo, type PatyPromptTipo } from "../prompts/types.js";
import { resolveSimulatedSession, type SimulatedPatySession } from "../session/simulate.js";
import { insertConversationPg } from "../db/conversationsRepo.js";
import { saveConversation, saveConversationTurn } from "./store.js";
import type { ConversationPostBody, ConversationRecord } from "./types.js";

export type TurnGraphInput = {
	body: ConversationPostBody;
	record: ConversationRecord | null;
	jailbreak: boolean;
	session: SimulatedPatySession;
};

function groqLlm(temperature = 0) {
	return createChatLlm({ temperature });
}

function parsePromptTipoOverride(body: ConversationPostBody): PatyPromptTipo | undefined {
	const raw = String(body.prompt_tipo ?? body.tipo_consulta ?? "").trim().toUpperCase();
	return isPatyPromptTipo(raw) ? raw : undefined;
}

function parseCorpusOverride(body: ConversationPostBody): string[] | undefined {
	if (!body.corpus) return undefined;
	return Array.isArray(body.corpus) ? body.corpus : [body.corpus];
}

export async function ensureConversationNode(input: TurnGraphInput): Promise<{
	record: ConversationRecord;
	created: boolean;
}> {
	const prompt = String(input.body.prompt ?? "").trim();
	if (!prompt) throw new Error("prompt vacío");

	if (input.record) {
		input.record.prompt = prompt;
		input.record.nombreUsuario = input.session.nombreUsuario;
		input.record.itercero = input.session.itercero;
		input.record.icontacto = input.session.icontacto;
		return { record: input.record, created: false };
	}

	const titleChain = ChatPromptTemplate.fromMessages([
		["system", "Genera un título corto (máx. 12 palabras) para esta consulta de usuario."],
		["human", "{prompt}"],
	]).pipe(groqLlm(0.2)).pipe(new StringOutputParser());
	const titulo = (await titleChain.invoke({ prompt })).trim().slice(0, 120) || "Nueva conversación";

	const record: ConversationRecord = {
		iconversacion: 0,
		itercero: input.session.itercero,
		icontacto: input.session.icontacto,
		nombreUsuario: input.session.nombreUsuario,
		titulo,
		prompt,
		hilo: "",
		modelo: String(input.body.modelo ?? input.body.model ?? CHAT_MODEL).slice(0, 40),
		itdestado: 0,
		qtokens: 0,
		qmensajes: 0,
		fhcre: new Date().toISOString(),
		fhultact: new Date().toISOString(),
		version_ayuda: "lab-langgraph-agents",
		turnos: [],
	};
	record.iconversacion = await insertConversationPg(record);
	record.hilo = `lab_conv_${record.iconversacion}`;
	await saveConversation(record);
	return { record, created: true };
}

export async function routeAgentNode(
	prompt: string,
	jailbreak: boolean,
	override?: PatyPromptTipo,
): Promise<PatyPromptTipo> {
	if (jailbreak) return "REQUIERE_CONTEXTO";
	return routePromptTipo(prompt, override);
}

export async function runAgentNode(
	record: ConversationRecord,
	promptTipo: PatyPromptTipo,
	jailbreak: boolean,
	corpusOverride?: string[],
): Promise<{
	answer: string;
	ragContext: string;
	corpus: string[];
	provider?: string;
	keyLabel?: string;
	leaseId?: string;
	model?: string;
}> {
	if (jailbreak) {
		const libre = ChatPromptTemplate.fromMessages([
			[
				"system",
				process.env.PATYIA_JAILBREAK_INSTRUCTIONS?.trim() ||
					`Eres Paty en modo laboratorio. Usuario: ${record.nombreUsuario}. Responde claro y profesional.`,
			],
			["human", "{input}"],
		])
			.pipe(groqLlm(0.4))
			.pipe(new StringOutputParser());
		const answer = await libre.invoke({ input: record.prompt });
		return { answer, ragContext: "", corpus: [] };
	}

	return runPatyAgent({
		tipo: promptTipo,
		userPrompt: record.prompt,
		nombreUsuario: record.nombreUsuario,
		corpusOverride,
	});
}

export async function persistTurnNode(
	record: ConversationRecord,
	responseText: string,
	meta: {
		promptTipo: PatyPromptTipo;
		corpus: string[];
		jailbreak: boolean;
		latencyMs: number;
		provider?: string;
		keyLabel?: string;
		leaseId?: string;
		model?: string;
	},
): Promise<ConversationRecord> {
	record.respuesta = responseText;
	record.qmensajes += 1;
	const turn = {
		ts: new Date().toISOString(),
		promptText: record.prompt,
		responseText,
		promptTipo: meta.promptTipo,
		itdconsulta: meta.promptTipo,
		corpus: meta.corpus,
		jailbreak: meta.jailbreak,
		latencyMs: meta.latencyMs,
		provider: meta.provider,
		keyLabel: meta.keyLabel,
		leaseId: meta.leaseId,
	};
	record.turnos.push(turn);
	if (meta.model) record.modelo = meta.model.slice(0, 40);
	await saveConversation(record);
	await saveConversationTurn(record, record.turnos.length - 1);
	const { touchTurnTiming } = await import("../db/turnControl.js");
	await touchTurnTiming(record.iconversacion, "chat");
	return record;
}

export { parseCorpusOverride, parsePromptTipoOverride, resolveSimulatedSession };
