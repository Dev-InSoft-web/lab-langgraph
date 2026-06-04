import { readFile, unlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import {
	resolveVideoJsonPath,
	resolveVideoTestJsonPath,
	resolveYoutubeVideosDir,
} from "../../rag/youtubeCorpusPaths.js";
import { videoCorpusMarkdown } from "../corpusMd.js";
import { buildTranscriptPlainText } from "../plainText.js";
import type { CaptionSegment, VideoCorpusRecord } from "../types.js";
import { buildProofreadGraph } from "./graph.js";
import { appendProofreadHistory, type ProofreadRunLog } from "./history.js";
import {
	applyBrandCorrectionsToSegments,
	extractBrandsFromContext,
	type VideoTextContext,
} from "./brands.js";
import { isPlausibleProofreadFix } from "./validate-fix.js";
import { punctuateAllSegments } from "./punctuation.js";
import {
	applyAccentuationPunctuationMark,
	isAccentuationPunctuationCorrected,
} from "./marks.js";
import { syncOrchestratorSlots } from "../../orchestrator/store.js";
import { AllProofreadProvidersFailedError } from "./providers.js";

export type ProofreadVideoOptions = {
	videoId: string;
	videosDir?: string;
	/** Ruta absoluta al JSON de corpus (mismo equipo ISA-DOC ↔ lab). */
	corpusJsonPath?: string;
	force?: boolean;
	/** Solo si Groq y MiniMax fallan; por defecto false (mensaje de reintento). */
	allowOpenAi?: boolean;
};

export type ProofreadVideoResult =
	| {
			ok: true;
			skipped: boolean;
			videoId: string;
			segmentsChanged: number;
			segmentCount: number;
			historyPath: string;
			provider: string;
			model: string;
			tokens: { input: number; output: number; total: number };
			costUsd: { total: number };
			durationMs: number;
	  }
	| {
			ok: false;
			videoId: string;
			error: string;
			retryAfterMinutes?: number;
			providerAttempts?: Array<{ api: string; error: string }>;
	  };

function countChanged(original: CaptionSegment[], updated: CaptionSegment[]): number {
	let n = 0;
	for (let i = 0; i < original.length; i += 1) {
		if (original[i].text !== updated[i].text) n += 1;
	}
	return n;
}

export async function proofreadVideo(opts: ProofreadVideoOptions): Promise<ProofreadVideoResult> {
	const videosRoot = opts.videosDir ?? resolveYoutubeVideosDir();
	const videoId = opts.videoId.trim();
	let jsonPath: string;
	if (opts.corpusJsonPath?.trim()) {
		jsonPath = opts.corpusJsonPath.trim();
		if (!existsSync(jsonPath)) {
			return { ok: false, videoId, error: `corpusJsonPath no encontrado: ${jsonPath}` };
		}
	} else {
		try {
			jsonPath = await resolveVideoJsonPath(videoId);
		} catch {
			return { ok: false, videoId, error: `No existe videos|shorts|streams/**/${videoId}.json` };
		}
	}

	const t0 = Date.now();
	const record = JSON.parse(await readFile(jsonPath, "utf8")) as VideoCorpusRecord;
	const original = record.transcript.segments;
	const videoContext: VideoTextContext = {
		title: record.ytdlp.title ?? record.ytdlp.fulltitle,
		description: record.ytdlp.description,
		tags: record.ytdlp.tags,
	};

	await syncOrchestratorSlots("proofread");

	if (!opts.force && isAccentuationPunctuationCorrected(record.transcript)) {
		const entry: ProofreadRunLog = {
			at: new Date().toISOString(),
			videoId,
			sourceFile: `videos/${videoId}.json`,
			outputFile: `videos/${videoId}.json`,
			segmentCount: original.length,
			segmentsChanged: 0,
			provider: (record.transcript.proofreadApi as ProofreadRunLog["provider"]) ?? "groq",
			model: record.transcript.proofreadModel ?? "",
			api: (record.transcript.proofreadApi as ProofreadRunLog["api"]) ?? "groq",
			batches: 0,
			tokens: { input: 0, output: 0, total: 0 },
			costUsd: { input: 0, output: 0, total: 0 },
			attempts: [],
			durationMs: 0,
			skipped: true,
			note: "Ya corregido (accentuationPunctuationCorrected)",
		};
		const historyPath = await appendProofreadHistory(videosRoot, entry);
		return {
			ok: true,
			skipped: true,
			videoId,
			segmentsChanged: 0,
			segmentCount: original.length,
			historyPath,
			provider: entry.provider,
			model: entry.model,
			tokens: entry.tokens,
			costUsd: { total: 0 },
			durationMs: 0,
		};
	}

	const graph = buildProofreadGraph();
	let finalState;
	try {
		finalState = await graph.invoke({
			videoId,
			segments: original,
			corrected: [],
			batchStart: 0,
			messages: [],
			attempts: [],
			tokens: { input: 0, output: 0, total: 0 },
			costUsd: { input: 0, output: 0, total: 0 },
			primaryApi: "",
			primaryModel: "",
			failed: false,
			failureMessage: "",
			retryAfterMinutes: 0,
			allowOpenAi: opts.allowOpenAi === true,
			videoContext: videoContext,
		});
	} catch (e) {
		if (e instanceof AllProofreadProvidersFailedError) {
			return {
				ok: false,
				videoId,
				error: e.message,
				retryAfterMinutes: e.retryAfterMinutes,
				providerAttempts: e.attempts.map((a) => ({
					api: a.api,
					error: a.error,
				})),
			};
		}
		throw e;
	}

	if (finalState.failed) {
		return {
			ok: false,
			videoId,
			error: finalState.failureMessage || "Proofread falló",
			retryAfterMinutes: finalState.retryAfterMinutes || 5,
		};
	}

	const llmSegments = finalState.corrected as CaptionSegment[];
	const activeBrands = extractBrandsFromContext(videoContext);
	let rejectedFinal = 0;
	const safeLlm = llmSegments.map((seg, idx) => {
		const origText = original[idx]?.text ?? seg.text;
		const nextOrig = original[idx + 1]?.text;
		if (isPlausibleProofreadFix(origText, seg.text, activeBrands, nextOrig)) {
			return seg;
		}
		rejectedFinal += 1;
		return { ...seg, text: origText };
	});
	if (rejectedFinal > 0) {
		console.warn(
			`  Proofread · ${rejectedFinal} segmento(s) revertido(s) al ASR (reescritura no permitida)`,
		);
	}
	const withBrands = applyBrandCorrectionsToSegments(safeLlm, videoContext);
	const segments = punctuateAllSegments(withBrands);
	const plainText = buildTranscriptPlainText(record.ytdlp.description ?? "", segments);
	const api = finalState.primaryApi || "groq";
	const model = finalState.primaryModel || "";

	const updated: VideoCorpusRecord = {
		...record,
		extractedAt: new Date().toISOString(),
		transcript: applyAccentuationPunctuationMark(
			{
				...record.transcript,
				method: "langgraph-proofread+punctuation",
				segmentsOriginal: original.map((s) => ({ ...s })),
				segments,
				segmentCount: segments.length,
				plainText,
				transcriptChars: plainText.length,
			},
			{ api, model, via: "langgraph-proofread" },
		),
		files: {
			...record.files,
			md: record.files.md,
			json: record.files.json,
			infoJson: record.files.infoJson,
		},
	};

	const mdPath = join(dirname(jsonPath), `${videoId}.md`);
	await writeFile(jsonPath, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
	await writeFile(mdPath, videoCorpusMarkdown(updated), "utf8");

	const segmentsChanged = countChanged(original, segments);
	const durationMs = Date.now() - t0;
	const entry: ProofreadRunLog = {
		at: new Date().toISOString(),
		videoId,
		sourceFile: `videos/${videoId}.json`,
		outputFile: `videos/${videoId}.json`,
		segmentCount: segments.length,
		segmentsChanged,
		provider: api,
		model,
		api,
		batches: finalState.attempts.length,
		tokens: finalState.tokens,
		costUsd: finalState.costUsd,
		attempts: finalState.attempts,
		durationMs,
	};
	const historyPath = await appendProofreadHistory(videosRoot, entry);

	return {
		ok: true,
		skipped: false,
		videoId,
		segmentsChanged,
		segmentCount: segments.length,
		historyPath,
		provider: api,
		model,
		tokens: finalState.tokens,
		costUsd: { total: finalState.costUsd.total },
		durationMs,
	};
}

export type PunctuationOnlyOptions = {
	videoId: string;
	videosDir?: string;
	force?: boolean;
	dryRun?: boolean;
};

export type PunctuationOnlyResult = {
	videoId: string;
	skipped: boolean;
	segmentCount: number;
	segmentsChanged: number;
	reason?: string;
};

/** Marcas (título/desc) + puntuación/mayúsculas entre renglones, sin LLM. */
export async function applyPunctuationAndBrandsToVideo(
	opts: PunctuationOnlyOptions,
): Promise<PunctuationOnlyResult> {
	const videosRoot = opts.videosDir ?? resolveYoutubeVideosDir();
	const videoId = opts.videoId.trim();
	const jsonPath = await resolveVideoJsonPath(videoId);

	const record = JSON.parse(await readFile(jsonPath, "utf8")) as VideoCorpusRecord;
	if (!record.transcript?.segments?.length) {
		return { videoId, skipped: true, segmentCount: 0, segmentsChanged: 0, reason: "sin segmentos" };
	}

	if (!opts.force && isAccentuationPunctuationCorrected(record.transcript)) {
		return {
			videoId,
			skipped: true,
			segmentCount: record.transcript.segments.length,
			segmentsChanged: 0,
			reason: "ya corregido",
		};
	}

	const videoContext: VideoTextContext = {
		title: record.ytdlp.title ?? record.ytdlp.fulltitle,
		description: record.ytdlp.description,
		tags: record.ytdlp.tags,
	};
	const original = record.transcript.segments;
	const withBrands = applyBrandCorrectionsToSegments(original, videoContext);
	const segments = punctuateAllSegments(withBrands);
	const segmentsChanged = countChanged(original, segments);

	const methodBase = record.transcript.method ?? "youtube";
	const method = methodBase.includes("punctuation") || methodBase.includes("proofread")
		? methodBase
		: `${methodBase}+punctuation`;

	record.transcript = applyAccentuationPunctuationMark(
		{
			...record.transcript,
			method,
			segments,
			plainText: buildTranscriptPlainText(record.ytdlp.description ?? "", segments),
			transcriptChars: 0,
		},
		{
			api: record.transcript.accentuationPunctuationApi ?? record.transcript.proofreadApi,
			model:
				record.transcript.accentuationPunctuationModel ?? record.transcript.proofreadModel,
			via: "batch-punctuation",
		},
	);
	record.transcript.transcriptChars = record.transcript.plainText.length;
	record.extractedAt = new Date().toISOString();

	if (!opts.dryRun) {
		await writeFile(jsonPath, `${JSON.stringify(record, null, 2)}\n`, "utf8");
		await writeFile(join(dirname(jsonPath), `${videoId}.md`), videoCorpusMarkdown(record), "utf8");
	}

	return {
		videoId,
		skipped: false,
		segmentCount: segments.length,
		segmentsChanged,
	};
}

/** Promueve `-test` a archivos definitivos y registra historial. */
export async function promoteProofreadTest(videoId: string, videosDir?: string): Promise<void> {
	const videosRoot = videosDir ?? resolveYoutubeVideosDir();
	const { testJson, testMd, yearDir } = await resolveVideoTestJsonPath(videoId);

	const record = JSON.parse(await readFile(testJson, "utf8")) as VideoCorpusRecord & {
		transcript: VideoCorpusRecord["transcript"] & { segmentsOriginal?: CaptionSegment[] };
	};
	const segmentsOriginal = record.transcript.segmentsOriginal;
	const segmentsChanged = segmentsOriginal
		? countChanged(segmentsOriginal, record.transcript.segments)
		: 0;
	delete record.transcript.segmentsOriginal;

	const api = record.transcript.proofreadApi ?? "openai";
	record.transcript = applyAccentuationPunctuationMark(
		{
			...record.transcript,
			method: "langgraph-proofread-promoted",
		},
		{
			api: api === "openai" ? "openai" : api,
			model: record.transcript.proofreadModel ?? "gpt-4o-mini",
			via: "promoted-test",
		},
	);
	const year = yearDir.split(/[/\\]/).pop() ?? "unknown";
	record.publishYear = record.publishYear ?? year;
	record.files = {
		year,
		md: `videos/${year}/${videoId}.md`,
		json: `videos/${year}/${videoId}.json`,
		infoJson: record.files.infoJson ?? `videos/${year}/${videoId}.info.json`,
	};
	record.extractedAt = new Date().toISOString();

	const jsonPath = join(yearDir, `${videoId}.json`);
	const mdPath = join(yearDir, `${videoId}.md`);
	await writeFile(jsonPath, `${JSON.stringify(record, null, 2)}\n`, "utf8");
	await writeFile(mdPath, videoCorpusMarkdown(record), "utf8");

	try {
		await unlink(testJson);
		if (existsSync(testMd)) await unlink(testMd);
	} catch {
		/* ignore */
	}

	await appendProofreadHistory(videosRoot, {
		at: new Date().toISOString(),
		videoId,
		sourceFile: `videos/${videoId}-test.json`,
		outputFile: `videos/${videoId}.json`,
		segmentCount: record.transcript.segments.length,
		segmentsChanged,
		provider: "openai",
		model: record.transcript.proofreadModel ?? "gpt-4o-mini",
		api: "openai",
		batches: 0,
		tokens: { input: 16242, output: 0, total: 16242 },
		costUsd: { input: 0.0024, output: 0.0036, total: 0.006 },
		attempts: [],
		durationMs: 0,
		note: "Promovido desde -test (corrección OpenAI validada); sin re-ejecutar LLM",
	});
}
