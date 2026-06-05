import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createChatLlm } from "../../llm/chat-llm.js";
import { PATYIA_PROMPTS_CATALOG } from "../../core/lab-data-paths.js";
import { type PatyPromptTipo, isPatyPromptTipo, PATY_PROMPT_TIPOS } from "./types.js";

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
	const path = join(
		PATYIA_PROMPTS_CATALOG(),
		"operativo",
		"clasificador-tipo-consulta-pmpt.md",
	);
	try {
		const md = await readFile(path, "utf8");
		const block = md.match(/```\s*([\s\S]*?)```/);
		if (block?.[1]?.includes("tipo_consulta")) {
			classifierSystemCache = block[1].trim();
			return classifierSystemCache;
		}
	} catch {
		/* bundled default */
	}
	classifierSystemCache = CLASSIFIER_SYSTEM_DEFAULT;
	return classifierSystemCache;
}

function groqClassifier() {
	return createChatLlm({ temperature: 0 });
}

export type ClassifyResult = {
	promptTipo: PatyPromptTipo;
	raw: string;
	latencyMs: number;
	model: string;
	override: boolean;
};

export async function classifyPromptTipo(
	prompt: string,
	override?: PatyPromptTipo,
): Promise<ClassifyResult> {
	if (override) {
		return {
			promptTipo: override,
			raw: JSON.stringify({ tipo_consulta: override }),
			latencyMs: 0,
			model: "override",
			override: true,
		};
	}

	const t0 = Date.now();
	const system = await loadClassifierSystem();
	const llm = groqClassifier().pipe(new StringOutputParser());
	const raw = await llm.invoke([new SystemMessage(system), new HumanMessage(prompt)]);
	const latencyMs = Date.now() - t0;
	let promptTipo: PatyPromptTipo = "REQUIERE_CONTEXTO";
	try {
		const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim()) as {
			tipo_consulta?: string;
		};
		const code = String(parsed.tipo_consulta ?? "REQUIERE_CONTEXTO").trim().toUpperCase();
		if (isPatyPromptTipo(code)) promptTipo = code;
	} catch {
		/* fallback */
	}
	return { promptTipo, raw, latencyMs, model: "llama-3.3-70b-versatile", override: false };
}

export async function routePromptTipo(
	prompt: string,
	override?: PatyPromptTipo,
): Promise<PatyPromptTipo> {
	return (await classifyPromptTipo(prompt, override)).promptTipo;
}

export function listPromptTipos(): readonly PatyPromptTipo[] {
	return PATY_PROMPT_TIPOS;
}
