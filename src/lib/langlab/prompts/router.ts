import { invokeOrchestratedClassifier } from "../../llm/orchestrated-chat.js";
import { getClassifierPromptFromDb } from "../db/promptsRepo.js";
import { type ConsultaTipo, isConsultaTipo, CONSULTA_TIPOS } from "./types.js";

const CLASSIFIER_SYSTEM_DEFAULT = `Clasifica intención ContaPyme®. Solo JSON: {{"tipo_consulta":"CODIGO"}}.

Catálogo (literal, uno):
ASESORIA_PERSONALIZADA — caso empresa/datos internos no disponibles
COMERCIAL — precios, licencias, compra, contacto comercial
CONSULTA_NORMATIVA_NEGOCIO — norma legal/tributaria/contable/laboral
ERROR_ACCESO — login, clave, licencia, autenticación
ERROR_CONFIGURACION — error por config/permisos/uso incorrecto
ERROR_DIAN — rechazo/validación DIAN
ERROR_TECNICO — crash, bloqueo, error interno app
FUERA_DE_ALCANCE_TECNICO — dev, API, integración, SQL fuera producto
INTERPRETACION_RESULTADO — por qué salió valor/saldo/asiento
PASO_A_PASO — cómo ejecutar proceso en ContaPyme
REQUIERE_CONTEXTO — vago o no clasificable
SALUDO_OTRO — saludo/gracias/despedida sin consulta
SOLICITUD_NO_PERMITIDA — viola seguridad/privacidad/políticas

Ambiguo → REQUIERE_CONTEXTO.`;

let classifierSystemCache: string | null = null;

async function loadClassifierSystem(): Promise<string> {
	if (classifierSystemCache) return classifierSystemCache;
	try {
		const fromDb = await getClassifierPromptFromDb();
		if (fromDb) {
			classifierSystemCache = fromDb;
			return classifierSystemCache;
		}
	} catch {
		/* PG no disponible */
	}
	classifierSystemCache = CLASSIFIER_SYSTEM_DEFAULT;
	return classifierSystemCache;
}

export type ClassifyResult = {
	promptTipo: ConsultaTipo;
	raw: string;
	latencyMs: number;
	model: string;
	provider: string;
	keyLabel: string;
	leaseId: string;
	override: boolean;
};

export async function classifyPromptTipo(
	prompt: string,
	override?: ConsultaTipo,
): Promise<ClassifyResult> {
	if (override) {
		return {
			promptTipo: override,
			raw: JSON.stringify({ tipo_consulta: override }),
			latencyMs: 0,
			model: "override",
			provider: "override",
			keyLabel: "",
			leaseId: "",
			override: true,
		};
	}

	const t0 = Date.now();
	const system = await loadClassifierSystem();
	const chat = await invokeOrchestratedClassifier({ systemPrompt: system, human: prompt });
	const raw = chat.answer;
	const latencyMs = Date.now() - t0;
	let promptTipo: ConsultaTipo = "REQUIERE_CONTEXTO";
	try {
		const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim()) as {
			tipo_consulta?: string;
		};
		const code = String(parsed.tipo_consulta ?? "REQUIERE_CONTEXTO").trim().toUpperCase();
		if (isConsultaTipo(code)) promptTipo = code;
	} catch {
		/* fallback */
	}
	return {
		promptTipo,
		raw,
		latencyMs,
		model: chat.model,
		provider: chat.provider,
		keyLabel: chat.keyLabel,
		leaseId: chat.leaseId,
		override: false,
	};
}

export async function routePromptTipo(
	prompt: string,
	override?: ConsultaTipo,
): Promise<ConsultaTipo> {
	return (await classifyPromptTipo(prompt, override)).promptTipo;
}

export function listPromptTipos(): readonly ConsultaTipo[] {
	return CONSULTA_TIPOS;
}
