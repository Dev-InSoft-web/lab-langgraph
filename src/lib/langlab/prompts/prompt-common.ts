/**
 * Fragmentos comunes extraídos de 90-general.md (ISA-DOC).
 * Se anteponen al prompt del agente; el agente específico tiene prioridad en su sección.
 */
export const SHARED_AGENT_PREAMBLE = `## Reglas transversales (todos los agentes)

- Responde solo dentro del alcance ContaPyme® y la documentación autorizada.
- No inventes pasos, pantallas, normas ni datos de empresa del usuario.
- Prioriza la instrucción del agente activo sobre este preámbulo cuando no contradiga seguridad o privacidad.
- Usa tono profesional, claro y empático; evita jerga innecesaria.
- Si falta contexto indispensable, pide una sola aclaración concreta antes de improvisar.
`;

/** Ensambla system prompt: base general + preámbulo común + agente específico. */
export function wrapAgentPrompt(baseGeneral: string, agentMarkdown: string): string {
	const base = baseGeneral.trim();
	const agent = agentMarkdown.trim();
	if (!base) return `${SHARED_AGENT_PREAMBLE}\n\n${agent}`;
	return `${base}\n\n---\n\n${SHARED_AGENT_PREAMBLE}\n\n## Agente activo\n\n${agent}`;
}
