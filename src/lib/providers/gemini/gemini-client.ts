import { geminiApiBase } from "./gemini-config.js";

export type GeminiModelMeta = {
	name: string;
	displayName?: string;
	supportedGenerationMethods?: string[];
};

export type GeminiGenerateResult = {
	text: string;
	status: number;
	raw: string;
	hasInlineImage: boolean;
	headers: Headers;
};

export class GeminiApiError extends Error {
	constructor(
		readonly modelId: string,
		readonly status: number,
		readonly body: string,
		readonly headers: Headers,
	) {
		super(`Gemini ${modelId} ${status}: ${body.slice(0, 500)}`);
		this.name = "GeminiApiError";
	}
}

export async function listGeminiModels(apiKey: string): Promise<GeminiModelMeta[]> {
	const out: GeminiModelMeta[] = [];
	let pageToken: string | undefined;
	do {
		const url = new URL(`${geminiApiBase()}/models`);
		url.searchParams.set("key", apiKey);
		url.searchParams.set("pageSize", "100");
		if (pageToken) url.searchParams.set("pageToken", pageToken);
		const res = await fetch(url);
		const text = await res.text();
		if (!res.ok) throw new Error(`GET /models ${res.status}: ${text.slice(0, 300)}`);
		const json = JSON.parse(text) as {
			models?: GeminiModelMeta[];
			nextPageToken?: string;
		};
		out.push(...(json.models ?? []));
		pageToken = json.nextPageToken;
	} while (pageToken);
	return out;
}

export function modelIdFromApiName(name: string): string {
	return name.replace(/^models\//, "");
}

function parseGenerateResponse(raw: string, status: number, headers: Headers): GeminiGenerateResult {
	const json = JSON.parse(raw) as {
		candidates?: Array<{
			content?: { parts?: Array<{ text?: string; inlineData?: { mimeType?: string } }> };
		}>;
	};
	let text = "";
	let hasInlineImage = false;
	for (const part of json.candidates?.[0]?.content?.parts ?? []) {
		if (part.text) text += part.text;
		if (part.inlineData?.mimeType?.startsWith("image/")) hasInlineImage = true;
	}
	return {
		text: text.trim(),
		status,
		raw,
		hasInlineImage,
		headers,
	};
}

export async function geminiGenerateContent(opts: {
	apiKey: string;
	modelId: string;
	body: Record<string, unknown>;
}): Promise<GeminiGenerateResult> {
	const model = opts.modelId.replace(/^models\//, "");
	const url = `${geminiApiBase()}/models/${model}:generateContent?key=${opts.apiKey}`;
	const res = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(opts.body),
	});
	const raw = await res.text();
	if (!res.ok) {
		throw new GeminiApiError(model, res.status, raw, res.headers);
	}
	return parseGenerateResponse(raw, res.status, res.headers);
}

export async function geminiGenerateText(opts: {
	apiKey: string;
	modelId: string;
	prompt: string;
	maxOutputTokens?: number;
}): Promise<{ text: string; status: number; raw: string }> {
	const r = await geminiGenerateContent({
		apiKey: opts.apiKey,
		modelId: opts.modelId,
		body: {
			contents: [{ parts: [{ text: opts.prompt }] }],
			generationConfig: {
				maxOutputTokens: opts.maxOutputTokens ?? 32,
				temperature: 0,
			},
		},
	});
	return { text: r.text, status: r.status, raw: r.raw };
}

export async function geminiEmbedContent(opts: {
	apiKey: string;
	modelId: string;
	text: string;
}): Promise<{ dimensions: number; status: number; raw: string }> {
	const model = opts.modelId.replace(/^models\//, "");
	const url = `${geminiApiBase()}/models/${model}:embedContent?key=${opts.apiKey}`;
	const res = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			content: { parts: [{ text: opts.text }] },
		}),
	});
	const raw = await res.text();
	if (!res.ok) {
		throw new GeminiApiError(model, res.status, raw, res.headers);
	}
	const json = JSON.parse(raw) as { embedding?: { values?: number[] } };
	const values = json.embedding?.values ?? [];
	return { dimensions: values.length, status: res.status, raw };
}
