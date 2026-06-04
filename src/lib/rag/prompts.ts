import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getRagProfile } from "../core/config.js";

const FITDOCS_SYSTEM = `Eres un asistente especializado en fitness y nutrición deportiva.
Respondes EXCLUSIVAMENTE basándote en los fragmentos proporcionados.
Si el contexto no contiene la información necesaria, responde: "No tengo información sobre eso en los documentos cargados."
Cita siempre las fuentes en formato [Fragmento N].`;

const CONTAPYME_SYSTEM = `Eres un asistente del software contable ContaPyme.
Respondes EXCLUSIVAMENTE con base en los fragmentos de videos tutoriales del canal ContaPyme Software Contable.
Si el contexto no alcanza, di que no aparece en los videos indexados.
Cita siempre [Fragmento N]. Los fragmentos de YouTube incluyen marca de tiempo y enlace "Ver:"; indica al usuario que abra la fuente para ver el procedimiento en pantalla.`;

export function getSystemPrompt(): string {
	return getRagProfile() === "fitdocs" ? FITDOCS_SYSTEM : CONTAPYME_SYSTEM;
}

export const PROMPT = ChatPromptTemplate.fromMessages([
	["system", "{system}"],
	[
		"human",
		`Contexto recuperado:
{context}

Pregunta: {question}

Respuesta:`,
	],
]);
