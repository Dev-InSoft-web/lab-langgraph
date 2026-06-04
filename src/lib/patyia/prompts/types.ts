/** Catálogo Ultra (13 tipos) — alineado con ISA-DOC `050-prompts/prompt-files.ts`. */
export const PATY_PROMPT_TIPOS = [
	"SALUDO_OTRO",
	"FUERA_DE_ALCANCE_TECNICO",
	"SOLICITUD_NO_PERMITIDA",
	"REQUIERE_CONTEXTO",
	"PASO_A_PASO",
	"INTERPRETACION_RESULTADO",
	"CONSULTA_NORMATIVA_NEGOCIO",
	"ASESORIA_PERSONALIZADA",
	"ERROR_TECNICO",
	"ERROR_CONFIGURACION",
	"ERROR_ACCESO",
	"ERROR_DIAN",
	"COMERCIAL",
] as const;

export type PatyPromptTipo = (typeof PATY_PROMPT_TIPOS)[number];

export function isPatyPromptTipo(v: string): v is PatyPromptTipo {
	return (PATY_PROMPT_TIPOS as readonly string[]).includes(v);
}

export interface PromptAgentDefinition {
	tipo: PatyPromptTipo;
	filename: string;
	/** Markdown Ultra completo (fuente ISA-DOC). */
	markdown: string;
	/** Instrucción lista para el LLM (base + agente + variables). */
	systemPrompt: string;
}

export interface PromptCatalogFile {
	schemaVersion: number;
	syncedAt: string;
	isaDocRoot: string;
	baseMarkdown: string;
	agents: Record<PatyPromptTipo, PromptAgentDefinition>;
}
