import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createChatLlm } from "../../llm/chat-llm.js";
import { searchCatalog, loadCatalog, getCatalogEntry } from "../../integrations/postman/catalog.js";
import type { ApiProject, CatalogEntry } from "../../integrations/postman/types.js";
import { findWorkflow, matchWorkflowByTask, type Workflow, type WorkflowStep } from "./workflows.js";

export type TaskMode = "guide" | "execute";

export interface PlannedStep {
	order: number;
	catalogId: string;
	label: string;
	method: string;
	pathTemplate: string;
	mutating: boolean;
	note?: string;
}

export interface TaskPlan {
	project: ApiProject;
	envId: string;
	mode: TaskMode;
	task: string;
	workflowId?: string;
	summary: string;
	steps: PlannedStep[];
	candidates?: CatalogEntry[];
}

function workflowToPlan(w: Workflow, mode: TaskMode, task: string, envId: string): TaskPlan {
	const steps: PlannedStep[] = [];
	for (const s of w.steps) {
		const entry = getCatalogEntry(w.project, s.catalogId);
		steps.push({
			order: s.order,
			catalogId: s.catalogId,
			label: s.label,
			method: entry?.method ?? "?",
			pathTemplate: entry?.pathTemplate ?? "?",
			mutating: Boolean(s.mutating ?? (entry && ["POST", "PUT", "PATCH", "DELETE"].includes(entry.method))),
			note: s.note,
		});
	}
	return {
		project: w.project,
		envId,
		mode,
		task,
		workflowId: w.id,
		summary: w.description,
		steps,
	};
}

function searchToPlan(
	project: ApiProject,
	task: string,
	mode: TaskMode,
	envId: string,
	limit = 8,
): TaskPlan {
	const hits = searchCatalog(project, task, limit);
	const steps: PlannedStep[] = hits.map((e, i) => ({
		order: i + 1,
		catalogId: e.id,
		label: e.name,
		method: e.method,
		pathTemplate: e.pathTemplate,
		mutating: ["POST", "PUT", "PATCH", "DELETE"].includes(e.method),
	}));
	return {
		project,
		envId,
		mode,
		task,
		summary:
			steps.length > 0
				? `Se encontraron ${steps.length} endpoints relacionados en el catálogo Postman.`
				: "Sin coincidencias en el catálogo; revise el texto o importe la colección.",
		steps,
		candidates: hits,
	};
}

async function llmRefinePlan(
	project: ApiProject,
	task: string,
	candidates: CatalogEntry[],
	envId: string,
	mode: TaskMode,
): Promise<TaskPlan | null> {
	if (!candidates.length) return null;
	try {
		const llm = createChatLlm({ temperature: 0, jsonMode: true });
		const list = candidates
			.map((c) => `- ${c.id}: ${c.method} ${c.pathTemplate} — ${c.name}`)
			.join("\n");
		const sys = `Eres un planificador de APIs ${project}. Devuelve JSON: {"summary":"...","stepIds":["id1","id2"]} ordenando pasos lógicos para la tarea. Solo usa ids de la lista. Máximo 12 pasos.`;
		const res = await llm.invoke([
			new SystemMessage(sys),
			new HumanMessage(`Tarea: ${task}\n\nEndpoints:\n${list}`),
		]);
		const text = typeof res.content === "string" ? res.content : "";
		const parsed = JSON.parse(text) as { summary?: string; stepIds?: string[] };
		const steps: PlannedStep[] = [];
		let order = 1;
		for (const id of parsed.stepIds ?? []) {
			const e = getCatalogEntry(project, id);
			if (!e) continue;
			steps.push({
				order: order++,
				catalogId: e.id,
				label: e.name,
				method: e.method,
				pathTemplate: e.pathTemplate,
				mutating: ["POST", "PUT", "PATCH", "DELETE"].includes(e.method),
			});
		}
		if (!steps.length) return null;
		return {
			project,
			envId,
			mode,
			task,
			summary: parsed.summary ?? "Plan sugerido por LLM",
			steps,
			candidates,
		};
	} catch {
		return null;
	}
}

export async function planTask(opts: {
	task: string;
	project?: ApiProject;
	envId?: string;
	mode?: TaskMode;
	useLlm?: boolean;
	workflowId?: string;
}): Promise<TaskPlan> {
	const mode = opts.mode ?? "guide";
	const envId = opts.envId?.trim() || process.env.LAB_API_ENV?.trim() || "staging";
	let project = opts.project;
	if (!project) {
		const t = opts.task.toLowerCase();
		project = t.includes("paty") || t.includes("conversacion") || t.includes("ayudas") ? "patyia" : "clientesis";
	}

	const workflow = opts.workflowId
		? findWorkflow(opts.workflowId)
		: matchWorkflowByTask(opts.task, project);
	if (workflow) return workflowToPlan(workflow, mode, opts.task, envId);

	const base = searchToPlan(project, opts.task, mode, envId);
	if (opts.useLlm !== false && base.candidates?.length) {
		const refined = await llmRefinePlan(project, opts.task, base.candidates, envId, mode);
		if (refined) return refined;
	}
	if (!base.steps.length) {
		return {
			...base,
			summary: `Catálogo ${project} tiene ${loadCatalog(project).length} endpoints. Refine la consulta.`,
		};
	}
	return base;
}
