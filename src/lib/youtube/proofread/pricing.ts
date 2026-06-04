export type ProofreadApi = "groq" | "cerebras" | "minimax" | "hf" | "openai";

export type TokenUsage = {
	input: number;
	output: number;
	total: number;
};

export type CostUsd = {
	input: number;
	output: number;
	total: number;
};

/** USD por 1M tokens (aprox., actualizar si cambian tarifas). */
const RATES_PER_M: Record<string, { in: number; out: number }> = {
	"groq:llama-3.3-70b-versatile": { in: 0.59, out: 0.79 },
	"groq:llama-3.1-8b-instant": { in: 0.05, out: 0.08 },
	"openai:gpt-4o-mini": { in: 0.15, out: 0.6 },
	"hf:meta-llama/Meta-Llama-3-8B-Instruct": { in: 0, out: 0 },
	"minimax:MiniMax-M2.5": { in: 0.3, out: 1.2 },
	"cerebras:gpt-oss-120b": { in: 0, out: 0 },
	"cerebras:zai-glm-4.7": { in: 0, out: 0 },
};

export function estimateCostUsd(api: ProofreadApi, model: string, usage: TokenUsage): CostUsd {
	const key = `${api}:${model}`;
	const rates = RATES_PER_M[key] ?? { in: 0, out: 0 };
	const input = (usage.input / 1_000_000) * rates.in;
	const output = (usage.output / 1_000_000) * rates.out;
	return { input, output, total: input + output };
}

export function addUsage(a: TokenUsage, b: TokenUsage): TokenUsage {
	return {
		input: a.input + b.input,
		output: a.output + b.output,
		total: a.total + b.total,
	};
}

export function addCost(a: CostUsd, b: CostUsd): CostUsd {
	return { input: a.input + b.input, output: a.output + b.output, total: a.total + b.total };
}
