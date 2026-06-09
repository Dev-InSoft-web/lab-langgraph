import type { ConsultaTipo } from "../prompts/types.js";

/** Corpus PGVector por agente (equivalente a vector stores por tipo en PatyIA). */
export const AGENT_RAG_CORPUS: Partial<Record<ConsultaTipo, string[]>> = {
	PASO_A_PASO: ["contapyme"],
	INTERPRETACION_RESULTADO: ["contapyme"],
	CONSULTA_NORMATIVA_NEGOCIO: ["dian", "minhacienda", "legal", "supersociedades"],
	ERROR_DIAN: ["dian", "contapyme"],
	ERROR_CONFIGURACION: ["contapyme"],
	ERROR_TECNICO: ["contapyme"],
	ERROR_ACCESO: ["contapyme"],
	ASESORIA_PERSONALIZADA: ["contapyme"],
	COMERCIAL: [],
	SALUDO_OTRO: [],
	REQUIERE_CONTEXTO: ["contapyme"],
	SOLICITUD_NO_PERMITIDA: [],
	FUERA_DE_ALCANCE_TECNICO: [],
};

export const AGENT_TEMPERATURE: Partial<Record<ConsultaTipo, number>> = {
	SALUDO_OTRO: 0.3,
	COMERCIAL: 0.35,
	REQUIERE_CONTEXTO: 0.2,
	PASO_A_PASO: 0.15,
};

export function corpusForAgent(tipo: ConsultaTipo, override?: string[]): string[] {
	if (override?.length) return override;
	return AGENT_RAG_CORPUS[tipo] ?? ["contapyme"];
}

export function temperatureForAgent(tipo: ConsultaTipo): number {
	return AGENT_TEMPERATURE[tipo] ?? 0.2;
}
