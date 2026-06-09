import {
	appendRatingPg,
	appendTurnPg,
	createConversationPg,
	deleteConversationPg,
	insertConversationPg,
	listConversationsPg,
	loadConversationPg,
	patchConversationPg,
	truncateConversationTurnsPg,
	updateConversationPg,
	type ConversationListItem,
} from "../db/conversationsRepo.js";

export type { ConversationListItem };
import type { ConversationRecord, RatedMessage } from "./types.js";

/** Persistencia única: PostgreSQL (schema `paty`). Sin JSON en disco. */
export function resolvePatyiaLabDataDir(): string {
	return process.env.PATYIA_LAB_DATA_DIR?.trim() || "(postgresql:paty)";
}

export async function nextConversationId(): Promise<number> {
	const record: Omit<ConversationRecord, "iconversacion" | "turnos"> = {
		itercero: "lab",
		icontacto: "lab",
		nombreUsuario: "Usuario",
		titulo: "",
		prompt: "",
		hilo: "",
		modelo: "",
		itdestado: 0,
		qtokens: 0,
		qmensajes: 0,
		fhcre: new Date().toISOString(),
		fhultact: new Date().toISOString(),
		version_ayuda: "lab-langgraph",
	};
	return insertConversationPg(record);
}

export async function loadConversation(id: number): Promise<ConversationRecord | null> {
	return loadConversationPg(id);
}

export async function listConversations(
	itercero: string,
	icontacto?: string,
): Promise<ConversationListItem[]> {
	return listConversationsPg(itercero, icontacto);
}

export async function saveConversation(record: ConversationRecord): Promise<void> {
	record.fhultact = new Date().toISOString();
	if (!record.iconversacion) {
		record.iconversacion = await insertConversationPg(record);
		return;
	}
	await updateConversationPg(record);
}

export async function saveConversationTurn(record: ConversationRecord, turnIndex: number): Promise<void> {
	const turn = record.turnos[turnIndex];
	if (!turn) return;
	await appendTurnPg(record.iconversacion, turn);
}

export async function appendRating(msg: RatedMessage): Promise<void> {
	await appendRatingPg(msg);
}

export async function createConversation(input: {
	itercero: string;
	icontacto: string;
	nombreUsuario: string;
	titulo?: string;
}): Promise<ConversationRecord | null> {
	const id = await createConversationPg(input);
	return loadConversationPg(id);
}

export async function patchConversation(
	id: number,
	patch: { titulo?: string; itdestado?: ConversationRecord["itdestado"] },
): Promise<boolean> {
	return patchConversationPg(id, patch);
}

export async function deleteConversation(id: number): Promise<boolean> {
	return deleteConversationPg(id);
}

export async function truncateConversation(
	id: number,
	throughTurnIndex: number,
): Promise<ConversationRecord | null> {
	return truncateConversationTurnsPg(id, throughTurnIndex);
}
