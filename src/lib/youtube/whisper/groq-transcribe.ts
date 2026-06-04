import { spawnSync } from "node:child_process";
import { mkdir, readFile, readdir, rm, stat } from "node:fs/promises";
import { basename, dirname, isAbsolute, join } from "node:path";
import {
	headersFromFetchResponse,
	recordRateLimitHints,
	type RateLimitHintTracker,
} from "../../core/retry-wait.js";
import { API_BASE, resolveDefaultModel } from "../../core/lab-constants.js";
import type { CaptionSegment } from "../types.js";

const GROQ_TRANSCRIBE_URL = `${API_BASE.groq}/audio/transcriptions`;
const DEFAULT_MODEL = resolveDefaultModel("groq", "whisper") ?? "whisper-large-v3-turbo";
const MAX_CHUNK_BYTES = 24 * 1024 * 1024;
const CHUNK_SECONDS = 600;
const CHUNK_OVERLAP_SEC = 10;

type GroqSegment = { start?: number; end?: number; text?: string };
type GroqVerboseJson = { text?: string; segments?: GroqSegment[] };

export type WhisperTranscribeRequest = {
	audioPath: string;
	videoId: string;
	model?: string;
	language?: string;
	apiKey: string;
};

export type WhisperTranscribeResult = {
	segments: CaptionSegment[];
	model: string;
	chunkCount: number;
	provider: "groq";
};

export function assertAbsoluteLabPath(filePath: string): void {
	if (!isAbsolute(filePath)) {
		throw new Error(`audioPath debe ser ruta absoluta: ${filePath}`);
	}
}

function runFfmpeg(args: string[], timeoutMs = 600_000): void {
	const proc = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", ...args], {
		encoding: "utf8",
		timeout: timeoutMs,
	});
	if (proc.status !== 0) {
		throw new Error(`ffmpeg: ${(proc.stderr ?? proc.stdout ?? "").slice(0, 500)}`);
	}
}

async function splitAudioIfNeeded(
	audioPath: string,
	workDir: string,
	maxBytes: number,
	chunkSec: number,
): Promise<string[]> {
	const st = await stat(audioPath);
	if (st.size <= maxBytes) return [audioPath];

	await mkdir(workDir, { recursive: true });
	const pattern = join(workDir, "chunk_%03d.mp3");
	runFfmpeg([
		"-i",
		audioPath,
		"-f",
		"segment",
		"-segment_time",
		String(chunkSec),
		"-reset_timestamps",
		"1",
		"-ar",
		"16000",
		"-ac",
		"1",
		"-b:a",
		"48k",
		pattern,
	]);

	const names = (await readdir(workDir))
		.filter((n) => n.startsWith("chunk_") && n.endsWith(".mp3"))
		.sort();
	const paths = names.map((n) => join(workDir, n));
	if (!paths.length) throw new Error(`No se generaron chunks en ${workDir}`);
	return paths;
}

async function transcribeOneFile(
	filePath: string,
	apiKey: string,
	model: string,
	language: string,
	tracker?: RateLimitHintTracker,
): Promise<GroqSegment[]> {
	const buf = await readFile(filePath);
	const form = new FormData();
	form.append("file", new Blob([buf], { type: "audio/mpeg" }), basename(filePath));
	form.append("model", model);
	form.append("language", language);
	form.append("response_format", "verbose_json");
	form.append("timestamp_granularities[]", "segment");
	form.append("temperature", "0");

	const res = await fetch(GROQ_TRANSCRIBE_URL, {
		method: "POST",
		headers: { Authorization: `Bearer ${apiKey}` },
		body: form,
	});
	const text = await res.text();
	if (res.ok) {
		const json = JSON.parse(text) as GroqVerboseJson;
		return json.segments ?? [];
	}
	if (tracker && res.status === 429) {
		recordRateLimitHints(tracker, text, headersFromFetchResponse(res));
	}
	throw new Error(`Groq Whisper ${res.status}: ${text.slice(0, 600)}`);
}

function groqSegmentsToCaption(segments: GroqSegment[], offsetMs: number): CaptionSegment[] {
	const out: CaptionSegment[] = [];
	for (const seg of segments) {
		const t = (seg.text ?? "").replace(/\s+/g, " ").trim();
		if (!t) continue;
		const startSec = seg.start ?? 0;
		const endSec = seg.end ?? startSec + 1;
		out.push({
			startMs: Math.round(offsetMs + startSec * 1000),
			durationMs: Math.max(100, Math.round((endSec - startSec) * 1000)),
			text: t,
		});
	}
	return out;
}

function dedupeSegments(segments: CaptionSegment[]): CaptionSegment[] {
	const out: CaptionSegment[] = [];
	let prev = "";
	for (const s of segments) {
		const t = s.text.trim();
		if (!t || t === prev) continue;
		prev = t;
		out.push(s);
	}
	return out;
}

export async function transcribeAudioAbsolutePath(
	req: WhisperTranscribeRequest,
): Promise<WhisperTranscribeResult> {
	assertAbsoluteLabPath(req.audioPath);
	await stat(req.audioPath);

	const model = req.model ?? DEFAULT_MODEL;
	const language = req.language ?? "es";
	const chunkDir = join(dirname(req.audioPath), ".whisper-chunks", req.videoId);
	await rm(chunkDir, { recursive: true, force: true }).catch(() => undefined);

	const parts = await splitAudioIfNeeded(req.audioPath, chunkDir, MAX_CHUNK_BYTES, CHUNK_SECONDS);
	const merged: CaptionSegment[] = [];

	for (let i = 0; i < parts.length; i += 1) {
		const offsetMs = Math.max(0, i * (CHUNK_SECONDS - CHUNK_OVERLAP_SEC) * 1000);
		const raw = await transcribeOneFile(parts[i]!, req.apiKey, model, language);
		merged.push(...groqSegmentsToCaption(raw, offsetMs));
		if (i < parts.length - 1) await new Promise((r) => setTimeout(r, 500));
	}

	await rm(chunkDir, { recursive: true, force: true }).catch(() => undefined);

	return {
		segments: dedupeSegments(merged),
		model,
		chunkCount: parts.length,
		provider: "groq",
	};
}
