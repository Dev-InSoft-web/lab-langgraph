import type { ConsultaTipo } from "../prompts/types.js";
import type { ConversationTurnMeta } from "./turnLog.js";

/** Contrato alineado con PatyIA (TConversacion + turno SSE). */
export type ConversationState = 0 | 1 | 2; // activa | cerrada inactividad | eliminada

export interface ConversationTurn {
	ts: string;
	promptText: string;
	responseText: string;
	turnIndex?: number;
	leaseId?: string;
	provider?: string;
	keyLabel?: string;
	/** Código agente Ultra (13 tipos). */
	promptTipo?: ConsultaTipo;
	itdconsulta?: string;
	corpus?: string[];
	jailbreak?: boolean;
	latencyMs?: number;
	/** Auditoría LangGraph: clasificación, tokens, coste, RAG. */
	meta?: ConversationTurnMeta;
}

export interface RatedMessage {
	iconversacion: number;
	imensaje?: number;
	calificacion?: number;
	comentario?: string;
	createdAt: string;
}

export interface ConversationRecord {
	iconversacion: number;
	itercero: string;
	icontacto: string;
	/** Nombre simulado para {{nombre_usuario}} en prompts. */
	nombreUsuario: string;
	titulo: string;
	prompt: string;
	respuesta?: string;
	hilo: string;
	modelo: string;
	itdestado: ConversationState;
	qtokens: number;
	qmensajes: number;
	fhcre: string;
	fhultact: string;
	version_ayuda: string;
	turnos: ConversationTurn[];
}

export interface ConversationPostBody {
	iconversacion?: number;
	itercero?: string;
	icontacto?: string;
	/** Simulación de nombre (sin auth Paty). */
	nombre_usuario?: string;
	nombres?: string;
	nombre?: string;
	empresa?: string;
	prompt?: string;
	modelo?: string;
	model?: string;
	jailbreak?: boolean;
	corpus?: string | string[];
	/** Forzar agente Ultra sin clasificador. */
	prompt_tipo?: string;
	tipo_consulta?: string;
}

export interface MensajePostBody {
	iconversacion: number;
	/** Texto del usuario → LangGraph (lab). */
	mensaje?: string;
	prompt?: string;
	calificacion?: number;
	comentario?: string;
}

export interface CreateConversationBody {
	titulo?: string;
	itercero?: string;
	icontacto?: string;
	nombre_usuario?: string;
}

export interface PatchConversationBody {
	titulo?: string;
	/** 0 activa, 1 cerrada, 2 eliminada */
	itdestado?: ConversationState;
}
