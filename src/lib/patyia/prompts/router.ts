import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createChatLlm } from "../../llm/chat-llm.js";
import { type PatyPromptTipo, isPatyPromptTipo, PATY_PROMPT_TIPOS } from "./types.js";

const CLASSIFIER_SYSTEM = `Clasifica intención ContaPyme®. Solo JSON: {"tipo_consulta":"CODIGO"}.

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

function groqClassifier() {
	return createChatLlm({ temperature: 0 });
}

export async function routePromptTipo(
	prompt: string,
	override?: PatyPromptTipo,
): Promise<PatyPromptTipo> {
	if (override) return override;

	const chain = ChatPromptTemplate.fromMessages([
		["system", CLASSIFIER_SYSTEM],
		["human", "{prompt}"],
	]).pipe(groqClassifier()).pipe(new StringOutputParser());

	const raw = await chain.invoke({ prompt });
	try {
		const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim()) as {
			tipo_consulta?: string;
		};
		const code = String(parsed.tipo_consulta ?? "REQUIERE_CONTEXTO").trim().toUpperCase();
		if (isPatyPromptTipo(code)) return code;
	} catch {
		/* fallback */
	}
	return "REQUIERE_CONTEXTO";
}

export function listPromptTipos(): readonly PatyPromptTipo[] {
	return PATY_PROMPT_TIPOS;
}
