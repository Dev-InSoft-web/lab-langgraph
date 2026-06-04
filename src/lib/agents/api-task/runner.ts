import { executeCatalogEntry } from "../../integrations/postman/execute.js";
import { getRuntimeVars } from "../../integrations/connections.js";
import type { ApiProject } from "../../integrations/postman/types.js";
import type { PlannedStep, TaskPlan, TaskMode } from "./planner.js";
import { planTask } from "./planner.js";

export interface StepResult {
	step: PlannedStep;
	ok: boolean;
	status: number;
	durationMs: number;
	url?: string;
	error?: string;
	skipped?: boolean;
	skipReason?: string;
}

export interface TaskRunResult {
	plan: TaskPlan;
	results: StepResult[];
}

export async function executePlan(
	plan: TaskPlan,
	allowMutations = false,
): Promise<StepResult[]> {
	const results: StepResult[] = [];
	let vars = getRuntimeVars(plan.project, plan.envId);
	for (const step of plan.steps) {
		if (step.mutating && !allowMutations) {
			results.push({
				step,
				ok: true,
				status: 0,
				durationMs: 0,
				skipped: true,
				skipReason: "Mutación omitida (allowMutations=false)",
			});
			continue;
		}
		try {
			const out = await executeCatalogEntry({
				project: plan.project,
				catalogId: step.catalogId,
				envId: plan.envId,
				vars,
				allowMutations,
			});
			vars = out.varsAfter;
			const ok = out.result.status >= 200 && out.result.status < 300;
			results.push({
				step,
				ok,
				status: out.result.status,
				durationMs: out.result.durationMs,
				url: out.request.url,
				error: out.result.error,
			});
			if (!ok && step.order <= 2) break;
		} catch (err) {
			results.push({
				step,
				ok: false,
				status: 0,
				durationMs: 0,
				error: err instanceof Error ? err.message : String(err),
			});
			break;
		}
	}
	return results;
}

export async function runTaskPlan(opts: {
	task: string;
	project?: ApiProject;
	envId?: string;
	mode: TaskMode;
	allowMutations?: boolean;
	workflowId?: string;
	useLlm?: boolean;
}): Promise<TaskRunResult> {
	const plan = await planTask({
		task: opts.task,
		project: opts.project,
		envId: opts.envId,
		mode: opts.mode,
		useLlm: opts.useLlm,
		workflowId: opts.workflowId,
	});
	const results =
		opts.mode === "execute" ? await executePlan(plan, opts.allowMutations ?? false) : [];
	return { plan, results };
}
