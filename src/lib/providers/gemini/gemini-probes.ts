import {
	GeminiApiError,
	geminiEmbedContent,
	geminiGenerateContent,
	type GeminiGenerateResult,
} from "./gemini-client.js";
import { classifyGeminiModel, type GeminiModality } from "./gemini-config.js";

export type GeminiProbeOutcome = {
	ok: boolean;
	httpStatus?: number;
	reply?: string;
	detail?: string;
	hasImagePart?: boolean;
	skipped?: boolean;
	skipReason?: string;
};

export function probePrompt(modality: GeminiModality): string {
	switch (modality) {
		case "language":
			return "Di solo la palabra OK.";
		case "image":
			return "Generate a minimal test image: one small blue circle on white background.";
		case "tts":
			return "Di solo la palabra OK en español.";
		case "audio":
			return "Short test tone or say OK.";
		case "embed":
			return "hola mundo";
		default:
			return "Responde solo: OK.";
	}
}

export function generationConfigForModality(modality: GeminiModality): Record<string, unknown> | undefined {
	if (modality === "image") {
		return {
			maxOutputTokens: 256,
			temperature: 0,
			responseModalities: ["TEXT", "IMAGE"],
		};
	}
	if (modality === "language" || modality === "tts" || modality === "other") {
		return { maxOutputTokens: 32, temperature: 0 };
	}
	return { maxOutputTokens: 64, temperature: 0 };
}

export function requestBodyForModality(
	modality: GeminiModality,
	prompt: string,
): Record<string, unknown> {
	if (modality === "embed") {
		return { content: { parts: [{ text: prompt }] } };
	}
	const parts: Array<Record<string, unknown>> = [{ text: prompt }];
	const body: Record<string, unknown> = {
		contents: [{ parts }],
	};
	const gen = generationConfigForModality(modality);
	if (gen) body.generationConfig = gen;
	return body;
}

export async function runGeminiProbe(opts: {
	apiKey: string;
	modelId: string;
	modality: GeminiModality;
}): Promise<GeminiProbeOutcome> {
	const prompt = probePrompt(opts.modality);

	if (opts.modality === "embed") {
		try {
			const r = await geminiEmbedContent({
				apiKey: opts.apiKey,
				modelId: opts.modelId,
				text: prompt,
			});
			return {
				ok: r.dimensions > 0,
				httpStatus: r.status,
				reply: `dim=${r.dimensions}`,
				detail: r.dimensions > 0 ? undefined : "embedding vacío",
			};
		} catch (e) {
			return failFromGeminiError(e);
		}
	}

	try {
		const r = await geminiGenerateContent({
			apiKey: opts.apiKey,
			modelId: opts.modelId,
			body: requestBodyForModality(opts.modality, prompt),
		});
		return evaluateGenerateResult(r, opts.modality);
	} catch (e) {
		return failFromGeminiError(e);
	}
}

function failFromGeminiError(e: unknown): GeminiProbeOutcome {
	if (e instanceof GeminiApiError) {
		return {
			ok: false,
			httpStatus: e.status,
			detail: e.body.slice(0, 500),
		};
	}
	return failFromError(e);
}

function evaluateGenerateResult(r: GeminiGenerateResult, modality: GeminiModality): GeminiProbeOutcome {
	const text = r.text;
	const hasImage = r.hasInlineImage;
	if (modality === "image") {
		const ok = hasImage || /ok/i.test(text);
		return {
			ok,
			httpStatus: r.status,
			reply: text.slice(0, 120) || (hasImage ? "(inline image)" : ""),
			hasImagePart: hasImage,
			detail: ok ? undefined : "sin imagen ni OK en texto",
		};
	}
	const ok = /ok/i.test(text) || (modality === "other" && text.length > 0);
	return {
		ok,
		httpStatus: r.status,
		reply: text.slice(0, 120),
		detail: ok ? undefined : "respuesta sin OK",
	};
}

function failFromError(e: unknown): GeminiProbeOutcome {
	const err = e instanceof Error ? e.message : String(e);
	const m = err.match(/Gemini [\w.-]+ (\d+):/);
	const status = m ? Number(m[1]) : undefined;
	return {
		ok: false,
		httpStatus: status,
		detail: err.slice(0, 500),
	};
}

export function modalityForModel(modelId: string, methods: string[] | undefined): GeminiModality {
	if (methods?.includes("embedContent") && !methods.includes("generateContent")) {
		return "embed";
	}
	return classifyGeminiModel(modelId);
}

export function modelSupportsProbe(modelId: string, methods: string[] | undefined): boolean {
	if (!methods?.length) return true;
	if (methods.includes("generateContent") || methods.includes("embedContent")) return true;
	return false;
}
