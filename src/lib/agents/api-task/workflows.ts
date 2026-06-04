import type { ApiProject } from "../../integrations/postman/types.js";

/** Flujos documentados (verify-api / verify-api-patyia) para guía paso a paso. */
export interface WorkflowStep {
	order: number;
	catalogId: string;
	label: string;
	note?: string;
	mutating?: boolean;
}

export interface Workflow {
	id: string;
	project: ApiProject;
	title: string;
	description: string;
	envHint: string;
	steps: WorkflowStep[];
}

const PATYIA_STAGING_FLOW: WorkflowStep[] = [
	{ order: 1, catalogId: "patyia/jwt/post-jwt", label: "Obtener JWT", note: "POST /api/JWT con CONTROLKEY", mutating: true },
	{
		order: 2,
		catalogId: "patyia/conversacion/post-conversacion-crear-continuar",
		label: "Crear conversación",
		mutating: true,
	},
	{ order: 3, catalogId: "patyia/conversacion/get-conversaciones-listar", label: "Listar conversaciones" },
	{ order: 4, catalogId: "patyia/conversacion/get-conversacion-detalle", label: "Detalle conversación" },
	{ order: 5, catalogId: "patyia/conversacion/get-resumen-conversacion", label: "Resumen conversación" },
	{ order: 6, catalogId: "patyia/mensaje/post-mensaje-calificado", label: "Enviar mensaje", mutating: true },
	{ order: 7, catalogId: "patyia/tiquete/post-tiquete", label: "Crear tiquete", mutating: true },
];

export const WORKFLOWS: Workflow[] = [
	{
		id: "patyia-smoke-staging",
		project: "patyia",
		title: "PatyIA · smoke staging",
		description: "Cadena verify-api-patyia contra HOST staging (conversación de prueba).",
		envHint: "staging",
		steps: PATYIA_STAGING_FLOW,
	},
	{
		id: "clientesis-capacitacion-read",
		project: "clientesis",
		title: "ClientesIS · lectura capacitación",
		description: "Listar y obtener cursos/planes sin mutaciones (Azure staging).",
		envHint: "staging",
		steps: [
			{ order: 1, catalogId: "clientesis/cursos/100-listar-cursos", label: "Listar cursos" },
			{ order: 2, catalogId: "clientesis/cursos/110-obtener-curso", label: "Obtener curso (requiere icurso en vars)" },
		],
	},
];

export function findWorkflow(id: string): Workflow | undefined {
	return WORKFLOWS.find((w) => w.id === id);
}

export function matchWorkflowByTask(task: string, project?: ApiProject): Workflow | undefined {
	const t = task.toLowerCase();
	if (project === "patyia" || (!project && (t.includes("paty") || t.includes("conversacion") || t.includes("ayudas")))) {
		if (t.includes("smoke") || t.includes("prueba") || t.includes("verify") || t.includes("staging")) {
			return WORKFLOWS.find((w) => w.id === "patyia-smoke-staging");
		}
	}
	if (project === "clientesis" || t.includes("curso") || t.includes("capacit") || t.includes("contapyme")) {
		return WORKFLOWS.find((w) => w.id === "clientesis-capacitacion-read");
	}
	return undefined;
}
