import { Annotation, END, StateGraph } from "@langchain/langgraph";
import type { ApiProject } from "../../integrations/postman/types.js";
import type { TaskMode, TaskPlan } from "./planner.js";
import { planTask } from "./planner.js";
import { executePlan, type StepResult } from "./runner.js";

export const ApiTaskGraphState = Annotation.Root({
	task: Annotation<string>(),
	project: Annotation<ApiProject | undefined>(),
	envId: Annotation<string>(),
	mode: Annotation<TaskMode>(),
	allowMutations: Annotation<boolean>({
		reducer: (_l, r) => r,
		default: () => false,
	}),
	workflowId: Annotation<string | undefined>({
		reducer: (_l, r) => r,
		default: () => undefined,
	}),
	useLlm: Annotation<boolean>({
		reducer: (_l, r) => r,
		default: () => true,
	}),
	plan: Annotation<TaskPlan | null>({ reducer: (_l, r) => r, default: () => null }),
	results: Annotation<StepResult[]>({
		reducer: (_l, r) => r,
		default: () => [],
	}),
});

async function planNode(state: typeof ApiTaskGraphState.State) {
	const plan = await planTask({
		task: state.task,
		project: state.project,
		envId: state.envId || undefined,
		mode: state.mode,
		useLlm: state.useLlm,
		workflowId: state.workflowId,
	});
	return { plan };
}

async function executeNode(state: typeof ApiTaskGraphState.State) {
	if (state.mode === "guide" || !state.plan) return { results: [] as StepResult[] };
	const results = await executePlan(state.plan, state.allowMutations);
	return { results };
}

function routeAfterPlan(state: typeof ApiTaskGraphState.State): "execute" | typeof END {
	return state.mode === "execute" ? "execute" : END;
}

export function buildApiTaskGraph() {
	const g = new StateGraph(ApiTaskGraphState)
		.addNode("plan", planNode)
		.addNode("execute", executeNode)
		.addEdge("__start__", "plan")
		.addConditionalEdges("plan", routeAfterPlan)
		.addEdge("execute", END);
	return g.compile();
}

export const apiTaskGraph = buildApiTaskGraph();

export async function invokeApiTask(input: {
	task: string;
	project?: ApiProject;
	envId?: string;
	mode?: TaskMode;
	allowMutations?: boolean;
	workflowId?: string;
	useLlm?: boolean;
}) {
	return apiTaskGraph.invoke({
		task: input.task,
		project: input.project,
		envId: input.envId ?? process.env.LAB_API_ENV ?? "staging",
		mode: input.mode ?? "guide",
		allowMutations: Boolean(input.allowMutations),
		workflowId: input.workflowId,
		useLlm: input.useLlm !== false,
	});
}

export { WORKFLOWS } from "./workflows.js";
