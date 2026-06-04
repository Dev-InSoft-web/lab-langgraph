import {
	appendRatingPg,
	appendTurnPg,
	insertConversationPg,
	loadConversationPg,
	updateConversationPg,
} from "../db/conversationsRepo.js";
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
