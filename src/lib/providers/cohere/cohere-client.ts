import { cohereApiBase } from "./cohere-config.js";
import type { CohereModality } from "./cohere-config.js";

export type CohereProbeResult = {
	ok: boolean;
	status: number;
	reply: string;
	detail?: string;
};

async function cohereFetch(
	apiKey: string,
	path: string,
	body: Record<string, unknown>,
): Promise<{ status: number; text: string }> {
	const res = await fetch(`${cohereApiBase()}${path}`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});
	return { status: res.status, text: await res.text() };
}

export async function cohereProbeModel(opts: {
	apiKey: string;
	modelId: string;
	modality: CohereModality;
	prompt?: string;
}): Promise<CohereProbeResult> {
	const prompt = opts.prompt ?? "Di solo la palabra OK.";

	if (opts.modality === "chat") {
		const { status, text } = await cohereFetch(opts.apiKey, "/v2/chat", {
			model: opts.modelId,
			messages: [{ role: "user", content: prompt }],
			max_tokens: 32,
			temperature: 0,
		});
		if (status >= 400) {
			return { ok: false, status, reply: "", detail: text.slice(0, 400) };
		}
		try {
			const json = JSON.parse(text) as {
				message?: { content?: Array<{ text?: string }> };
				text?: string;
			};
			const reply =
				json.message?.content?.map((p) => p.text ?? "").join("") ??
				json.text ??
				"";
			const ok = /ok/i.test(reply);
			return { ok, status, reply: reply.slice(0, 120), detail: ok ? undefined : "sin OK" };
		} catch {
			return { ok: false, status, reply: "", detail: text.slice(0, 200) };
		}
	}

	if (opts.modality === "embed") {
		const { status, text } = await cohereFetch(opts.apiKey, "/v1/embed", {
			model: opts.modelId,
			texts: [prompt],
			input_type: "search_document",
		});
		if (status >= 400) {
			return { ok: false, status, reply: "", detail: text.slice(0, 400) };
		}
		try {
			const json = JSON.parse(text) as { embeddings?: number[][] };
			const dim = json.embeddings?.[0]?.length ?? 0;
			return { ok: dim > 0, status, reply: `dim=${dim}`, detail: dim > 0 ? undefined : "embedding vacío" };
		} catch {
			return { ok: false, status, reply: "", detail: text.slice(0, 200) };
		}
	}

	// rerank
	const { status, text } = await cohereFetch(opts.apiKey, "/v2/rerank", {
		model: opts.modelId,
		query: prompt,
		documents: ["documento de prueba hola mundo", "otro texto irrelevante"],
		top_n: 1,
	});
	if (status >= 400) {
		return { ok: false, status, reply: "", detail: text.slice(0, 400) };
	}
	try {
		const json = JSON.parse(text) as { results?: unknown[] };
		const ok = (json.results?.length ?? 0) > 0;
		return { ok, status, reply: ok ? "rerank OK" : "", detail: ok ? undefined : "sin results" };
	} catch {
		return { ok: false, status, reply: "", detail: text.slice(0, 200) };
	}
}
