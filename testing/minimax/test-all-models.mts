/**
 * Prueba hola mundo por modelo MiniMax y guarda artefactos + reporte.
 * Relee report.json: modelos con ok:true se omiten (salvo --force).
 * Uso: npm run test:minimax:all [--only speech|image|music|video|language] [--force]
 * Catálogo: https://platform.minimax.io/docs/guides/models-intro → catalog.json + MODELS.md
 */
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { preloadIsaDocSecrets } from "../../src/lib/core/secrets.js";
import { testingDataPath } from "../_shared/paths.ts";
import {
	buildMinimaxFullCatalog,
	IMAGE_MODEL_ID,
	LANGUAGE_MODELS,
	MUSIC_MODELS,
	SPEECH_MODELS,
	VIDEO_MODELS,
} from "../../src/lib/providers/minimax/minimax-models-catalog.js";
import {
	loadMinimaxConfigFromEnv,
	minimaxKeyDisplay,
	type MinimaxConfig,
} from "../../src/lib/providers/minimax/minimax-config.js";

preloadIsaDocSecrets();

const OUT_DIR = testingDataPath("minimax-model-samples");
const PROMPT_CHAT = "Di solo la palabra OK.";
const PROMPT_TTS = "Hola mundo.";
const PROMPT_IMAGE = "A simple blue circle on white background, minimal.";
const PROMPT_VIDEO = "A calm blue sky with one white cloud, static shot.";
const PROMPT_MUSIC = "calm instrumental";
const LYRICS = "[verse]\nla la la";

type SampleResult = {
	modality: string;
	model: string;
	ok: boolean;
	httpStatus?: number;
	baseCode?: number;
	baseMsg?: string;
	artifact?: string;
	detail?: string;
	elapsedMs: number;
};

const cfg = loadMinimaxConfigFromEnv();
if (!cfg) {
	console.error("MINIMAX_API_KEY no cargada");
	process.exit(1);
}

function withGroupId(url: string): string {
	if (!cfg!.groupId) return url;
	const sep = url.includes("?") ? "&" : "?";
	return `${url}${sep}GroupId=${encodeURIComponent(cfg!.groupId)}`;
}

function authHeaders(json = true): Record<string, string> {
	const h: Record<string, string> = { Authorization: `Bearer ${cfg!.apiKey}` };
	if (json) h["Content-Type"] = "application/json";
	return h;
}

function safeName(model: string): string {
	return model.replace(/[^a-zA-Z0-9._-]+/g, "_");
}

async function sleep(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, ms));
}

function parseJson(text: string): Record<string, unknown> {
	try {
		return JSON.parse(text) as Record<string, unknown>;
	} catch {
		return { _raw: text.slice(0, 500) };
	}
}

function baseResp(j: Record<string, unknown>): { code: number; msg: string } {
	const br = j.base_resp as { status_code?: number; status_msg?: string } | undefined;
	return { code: br?.status_code ?? -1, msg: br?.status_msg ?? "" };
}

async function saveAudioPayload(payload: string, path: string): Promise<void> {
	const raw = payload.replace(/\s/g, "");
	let buf: Buffer;
	if (/^[0-9a-fA-F]+$/.test(raw) && raw.length % 2 === 0) {
		buf = Buffer.from(raw, "hex");
	} else {
		buf = Buffer.from(raw, "base64");
	}
	if (!buf.length) throw new Error("audio vacío");
	await writeFile(path, buf);
}

async function fetchWithRetry(url: string, init: RequestInit, tries = 4): Promise<Response> {
	let last: unknown;
	for (let i = 0; i < tries; i += 1) {
		try {
			return await fetch(url, init);
		} catch (e) {
			last = e;
			await sleep(2000 * (i + 1));
		}
	}
	throw last;
}

async function testLlm(model: string): Promise<SampleResult> {
	const t0 = Date.now();
	const dir = join(OUT_DIR, "language");
	await mkdir(dir, { recursive: true });
	const url = withGroupId(`${cfg!.apiBase}/v1/text/chatcompletion_v2`);
	const res = await fetchWithRetry(url, {
		method: "POST",
		headers: authHeaders(),
		body: JSON.stringify({
			model,
			messages: [{ role: "user", name: "user", content: PROMPT_CHAT }],
			temperature: 0,
		}),
	});
	const text = await res.text();
	const j = parseJson(text);
	const { code, msg } = baseResp(j);
	const reply =
		(
			(j.choices as Array<{ message?: { content?: string } }> | undefined)?.[0]?.message
				?.content as string | undefined
		) ?? "";
	const artifact = join(dir, `${safeName(model)}.txt`);
	const ok = res.ok && code === 0;
	await writeFile(
		artifact,
		[
			`model: ${model}`,
			`http: ${res.status}`,
			`base_resp: ${code} ${msg}`,
			`reply: ${reply}`,
		].join("\n"),
		"utf8",
	);
	return {
		modality: "language",
		model,
		ok,
		httpStatus: res.status,
		baseCode: code,
		baseMsg: msg,
		artifact: artifact.replace(OUT_DIR + "\\", "").replace(OUT_DIR + "/", ""),
		detail: reply.slice(0, 80),
		elapsedMs: Date.now() - t0,
	};
}

async function testTts(model: string): Promise<SampleResult> {
	const t0 = Date.now();
	const dir = join(OUT_DIR, "speech");
	await mkdir(dir, { recursive: true });
	const res = await fetchWithRetry(withGroupId(`${cfg!.apiBase}/v1/t2a_v2`), {
		method: "POST",
		headers: authHeaders(),
		body: JSON.stringify({
			model,
			text: PROMPT_TTS,
			stream: false,
			voice_setting: { voice_id: "English_expressive_narrator", speed: 1 },
			audio_setting: { format: "mp3", sample_rate: 32000 },
		}),
	});
	const text = await res.text();
	const j = parseJson(text);
	const { code, msg } = baseResp(j);
	const data = j.data as { audio?: string } | undefined;
	const artifact = join(dir, `${safeName(model)}.mp3`);
	let ok = res.ok && code === 0 && !!data?.audio;
	if (ok && data?.audio) {
		try {
			await saveAudioPayload(data.audio, artifact);
		} catch (e) {
			await writeFile(artifact.replace(".mp3", ".json"), text.slice(0, 4000), "utf8");
			ok = false;
			return {
				modality: "speech",
				model,
				ok: false,
				baseCode: code,
				baseMsg: String(e),
				artifact: `speech/${safeName(model)}.json`,
				elapsedMs: Date.now() - t0,
			};
		}
	} else {
		await writeFile(artifact.replace(".mp3", ".json"), text.slice(0, 4000), "utf8");
		ok = false;
	}
	return {
		modality: "speech",
		model,
		ok,
		httpStatus: res.status,
		baseCode: code,
		baseMsg: msg,
		artifact: `${safeName(model)}.mp3`,
		elapsedMs: Date.now() - t0,
	};
}

async function testImage(): Promise<SampleResult> {
	const model = "image-01";
	const t0 = Date.now();
	const dir = join(OUT_DIR, "image");
	await mkdir(dir, { recursive: true });
	const res = await fetchWithRetry(withGroupId(`${cfg!.apiBase}/v1/image_generation`), {
		method: "POST",
		headers: authHeaders(),
		body: JSON.stringify({
			model,
			prompt: PROMPT_IMAGE,
			aspect_ratio: "1:1",
			n: 1,
		}),
	});
	const text = await res.text();
	const j = parseJson(text);
	const { code, msg } = baseResp(j);
	const data = j.data as { image_urls?: string[] } | undefined;
	const metaPath = join(dir, `${safeName(model)}.json`);
	await writeFile(metaPath, JSON.stringify(j, null, 2), "utf8");
	let ok = res.ok && code === 0;
	const urlFile = join(dir, `${safeName(model)}-url.txt`);
	if (data?.image_urls?.[0]) {
		await writeFile(urlFile, data.image_urls[0], "utf8");
		try {
			const img = await fetchWithRetry(data.image_urls[0], {});
			if (img.ok) {
				const ext = data.image_urls[0].includes(".jpeg") ? ".jpeg" : ".png";
				await writeFile(join(dir, `${safeName(model)}${ext}`), Buffer.from(await img.arrayBuffer()));
			}
		} catch {
			/* URL guardada; descarga opcional */
		}
	}
	ok = ok && !!data?.image_urls?.[0];
	return {
		modality: "image",
		model,
		ok,
		httpStatus: res.status,
		baseCode: code,
		baseMsg: msg,
		artifact: `image/${safeName(model)}.png`,
		elapsedMs: Date.now() - t0,
	};
}

async function testMusic(model: string): Promise<SampleResult> {
	const t0 = Date.now();
	const dir = join(OUT_DIR, "music");
	await mkdir(dir, { recursive: true });
	const res = await fetchWithRetry(withGroupId(`${cfg!.apiBase}/v1/music_generation`), {
		method: "POST",
		headers: authHeaders(),
		body: JSON.stringify({
			model,
			prompt: PROMPT_MUSIC,
			lyrics: LYRICS,
		}),
	});
	const text = await res.text();
	const j = parseJson(text);
	const { code, msg } = baseResp(j);
	const data = j.data as { audio?: string } | undefined;
	const artifact = join(dir, `${safeName(model)}.mp3`);
	let ok = res.ok && code === 0 && !!data?.audio;
	if (ok && data?.audio) {
		try {
			await saveAudioPayload(data.audio, artifact);
		} catch {
			await writeFile(join(dir, `${safeName(model)}.json`), text.slice(0, 4000), "utf8");
			ok = false;
		}
	} else {
		await writeFile(join(dir, `${safeName(model)}.json`), text.slice(0, 4000), "utf8");
		ok = false;
	}
	return {
		modality: "music",
		model,
		ok,
		httpStatus: res.status,
		baseCode: code,
		baseMsg: msg,
		artifact: `music/${safeName(model)}.mp3`,
		elapsedMs: Date.now() - t0,
	};
}

async function pollVideoTask(taskId: string, maxMs = 300_000): Promise<Record<string, unknown>> {
	const start = Date.now();
	while (Date.now() - start < maxMs) {
		const res = await fetchWithRetry(
			withGroupId(`${cfg!.apiBase}/v1/query/video_generation?task_id=${encodeURIComponent(taskId)}`),
			{ headers: authHeaders(false) },
		);
		const j = parseJson(await res.text());
		const status = (j.status as string | undefined) ?? "";
		if (status === "Success" || status === "success") return j;
		if (status === "Fail" || status === "failed") return j;
		await sleep(8000);
	}
	return { status: "timeout", task_id: taskId };
}

function videoPaths(model: string): { dir: string; metaPath: string; mp4Path: string } {
	const dir = join(OUT_DIR, "video");
	const base = safeName(model);
	return {
		dir,
		metaPath: join(dir, `${base}.json`),
		mp4Path: join(dir, `${base}.mp4`),
	};
}

function fileIdFromVideoMeta(meta: Record<string, unknown>): string | undefined {
	const polled = meta.polled as { file_id?: string | number } | undefined;
	if (polled?.file_id != null) return String(polled.file_id);
	const create = meta.create as { file_id?: string | number } | undefined;
	if (create?.file_id != null) return String(create.file_id);
	return undefined;
}

async function retrieveVideoDownloadUrl(fileId: string): Promise<string> {
	const url = withGroupId(
		`${cfg!.apiBase}/v1/files/retrieve?file_id=${encodeURIComponent(fileId)}`,
	);
	const res = await fetchWithRetry(url, { headers: authHeaders(false) });
	const text = await res.text();
	const j = parseJson(text);
	const { code, msg } = baseResp(j);
	if (!res.ok || code !== 0) {
		throw new Error(`files/retrieve ${res.status} base ${code} ${msg}: ${text.slice(0, 200)}`);
	}
	const downloadUrl = (j.file as { download_url?: string } | undefined)?.download_url;
	if (!downloadUrl) throw new Error(`files/retrieve sin download_url: ${text.slice(0, 200)}`);
	return downloadUrl;
}

async function downloadMinimaxVideoMp4(fileId: string, mp4Path: string): Promise<void> {
	const downloadUrl = await retrieveVideoDownloadUrl(fileId);
	const res = await fetchWithRetry(downloadUrl, {});
	if (!res.ok) throw new Error(`descarga MP4 HTTP ${res.status}`);
	const buf = Buffer.from(await res.arrayBuffer());
	if (!buf.length) throw new Error("MP4 vacío");
	await writeFile(mp4Path, buf);
}

async function tryDownloadVideoFromMeta(model: string): Promise<boolean> {
	const { metaPath, mp4Path } = videoPaths(model);
	try {
		await access(mp4Path);
		return true;
	} catch {
		/* sin MP4 local */
	}
	let raw: string;
	try {
		raw = await readFile(metaPath, "utf8");
	} catch {
		return false;
	}
	const meta = JSON.parse(raw) as Record<string, unknown>;
	const fileId = fileIdFromVideoMeta(meta);
	if (!fileId) return false;
	await downloadMinimaxVideoMp4(fileId, mp4Path);
	return true;
}

async function loadFirstFrameDataUrl(): Promise<string | undefined> {
	for (const name of ["image-01.jpeg", "image-01.png"]) {
		const p = join(OUT_DIR, "image", name);
		try {
			const buf = await readFile(p);
			const mime = name.endsWith(".png") ? "image/png" : "image/jpeg";
			return `data:${mime};base64,${buf.toString("base64")}`;
		} catch {
			/* */
		}
	}
	const urlPath = join(OUT_DIR, "image", "image-01-url.txt");
	try {
		const url = (await readFile(urlPath, "utf8")).trim();
		if (url.startsWith("http")) return url;
	} catch {
		/* */
	}
	return undefined;
}

async function testVideo(model: string): Promise<SampleResult> {
	const t0 = Date.now();
	const dir = join(OUT_DIR, "video");
	await mkdir(dir, { recursive: true });
	const needsImage =
		model === "MiniMax-Hailuo-2.3-Fast" || model.includes("I2V");
	const firstFrame = needsImage ? await loadFirstFrameDataUrl() : undefined;
	if (needsImage && !firstFrame) {
		return {
			modality: "video",
			model,
			ok: false,
			detail: "requiere first_frame_image (--only image antes)",
			elapsedMs: Date.now() - t0,
		};
	}
	const body: Record<string, unknown> = {
		model,
		prompt: PROMPT_VIDEO,
		duration: 6,
		resolution: "768P",
		prompt_optimizer: false,
	};
	if (firstFrame) body.first_frame_image = firstFrame;

	const res = await fetchWithRetry(withGroupId(`${cfg!.apiBase}/v1/video_generation`), {
		method: "POST",
		headers: authHeaders(),
		body: JSON.stringify(body),
	});
	const createText = await res.text();
	const created = parseJson(createText);
	const { code, msg } = baseResp(created);
	const taskId = created.task_id as string | undefined;
	const metaPath = join(dir, `${safeName(model)}.json`);
	if (!res.ok || code !== 0 || !taskId) {
		await writeFile(metaPath, createText, "utf8");
		return {
			modality: "video",
			model,
			ok: false,
			httpStatus: res.status,
			baseCode: code,
			baseMsg: msg,
			artifact: `video/${safeName(model)}.json`,
			elapsedMs: Date.now() - t0,
		};
	}
	const polled = await pollVideoTask(taskId);
	await writeFile(metaPath, JSON.stringify({ create: created, polled }, null, 2), "utf8");
	const pCode = baseResp(polled).code;
	const status = String(polled.status ?? "");
	const fileId = polled.file_id as string | undefined;
	const genOk =
		(status.toLowerCase() === "success" || pCode === 0) && !!fileId;
	let artifact = `video/${safeName(model)}.json`;
	let detail = fileId ? `file_id=${fileId}` : status;
	if (genOk && fileId) {
		const { mp4Path } = videoPaths(model);
		try {
			await downloadMinimaxVideoMp4(String(fileId), mp4Path);
			artifact = `video/${safeName(model)}.mp4`;
			detail = `file_id=${fileId} · MP4 local`;
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			detail = `file_id=${fileId} · sin MP4: ${msg.slice(0, 80)}`;
		}
	}
	return {
		modality: "video",
		model,
		ok: genOk,
		baseCode: pCode,
		baseMsg: String(polled.base_resp ? baseResp(polled).msg : status),
		artifact,
		detail,
		elapsedMs: Date.now() - t0,
	};
}

async function fetchListedLlms(): Promise<string[]> {
	try {
		const res = await fetchWithRetry(withGroupId(`${cfg!.apiBase}/v1/models`), {
			headers: authHeaders(false),
		});
		if (!res.ok) return [...LANGUAGE_MODELS];
		const j = parseJson(await res.text());
		const data = j.data as Array<{ id?: string }> | undefined;
		if (!Array.isArray(data) || !data.length) return [...LANGUAGE_MODELS];
		const fromApi = data.map((m) => m.id!).filter(Boolean);
		const merged = [...fromApi];
		for (const m of LANGUAGE_MODELS) {
			if (!merged.includes(m)) merged.push(m);
		}
		return merged;
	} catch {
		return [...LANGUAGE_MODELS];
	}
}

function resultKey(modality: string, model: string): string {
	return `${modality}:${model}`;
}

function mergePriorIntoMap(prior: SampleResult[], byKey: Map<string, SampleResult>): void {
	for (const r of prior) {
		const k = resultKey(r.modality, r.model);
		const existing = byKey.get(k);
		if (!existing || (r.ok && !existing.ok)) byKey.set(k, r);
		else if (!existing.ok && !r.ok) byKey.set(k, r);
	}
}

function buildResultsList(byKey: Map<string, SampleResult>, llms: string[]): SampleResult[] {
	const out: SampleResult[] = [];
	const add = (modality: string, model: string) => {
		const r = byKey.get(resultKey(modality, model));
		if (r) out.push(r);
	};
	for (const model of llms) add("language", model);
	for (const model of SPEECH_MODELS) add("speech", model);
	add("image", IMAGE_MODEL_ID);
	for (const model of MUSIC_MODELS) add("music", model);
	for (const model of VIDEO_MODELS) add("video", model);
	return out;
}

function renderModelsCatalogMd(): string {
	const catalog = buildMinimaxFullCatalog();
	const lines = [
		"# MiniMax — catálogo de modelos y herramientas",
		"",
		"Fuente: [models-intro](https://platform.minimax.io/docs/guides/models-intro) · orden **más nuevo → legacy**.",
		"",
		"| Tier | Modality | Model | Test batch | Descripción |",
		"|------|----------|-------|------------|-------------|",
	];
	for (const e of catalog) {
		lines.push(
			`| ${e.tier} | ${e.modality} | ${e.model} | ${e.testable ? "sí" : "—"} | ${e.description || "—"} |`,
		);
	}
	lines.push("");
	return lines.join("\n");
}

async function persistCatalog(): Promise<void> {
	const catalog = buildMinimaxFullCatalog();
	await writeFile(
		join(OUT_DIR, "catalog.json"),
		`${JSON.stringify({ source: "https://platform.minimax.io/docs/guides/models-intro", catalog }, null, 2)}\n`,
		"utf8",
	);
	await writeFile(join(OUT_DIR, "MODELS.md"), `${renderModelsCatalogMd()}\n`, "utf8");
}

function renderSummary(results: SampleResult[]): string {
	const lines = [
		"# MiniMax model samples",
		"",
		`| Modality | Model | OK | base | Detail |`,
		`|----------|-------|-----|------|--------|`,
	];
	for (const r of results) {
		lines.push(
			`| ${r.modality} | ${r.model} | ${r.ok ? "yes" : "no"} | ${r.baseCode ?? r.httpStatus ?? "—"} | ${(r.detail ?? r.baseMsg ?? "").replace(/\|/g, "/").slice(0, 60)} |`,
		);
	}
	const okN = results.filter((r) => r.ok).length;
	lines.push("", `**${okN}/${results.length} OK**`, "");
	return lines.join("\n");
}

const only = process.argv.includes("--only")
	? process.argv[process.argv.indexOf("--only") + 1]?.trim()
	: null;
const force = process.argv.includes("--force");
const downloadVideosOnly = process.argv.includes("--download-videos");

async function loadPriorResults(): Promise<SampleResult[]> {
	try {
		const { readFile } = await import("node:fs/promises");
		const raw = await readFile(join(OUT_DIR, "report.json"), "utf8");
		const j = JSON.parse(raw) as { results?: SampleResult[] };
		return Array.isArray(j.results) ? j.results : [];
	} catch {
		return [];
	}
}

async function persistReport(results: SampleResult[]): Promise<void> {
	const report = {
		at: new Date().toISOString(),
		key: minimaxKeyDisplay(cfg!),
		outDir: OUT_DIR,
		results,
	};
	await writeFile(join(OUT_DIR, "report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
	await writeFile(join(OUT_DIR, "SUMMARY.md"), `${renderSummary(results)}\n`, "utf8");
}

console.log(`MiniMax all-models test → ${OUT_DIR}`);
console.log(`  ${minimaxKeyDisplay(cfg)}`);
if (only) console.log(`  Modo: solo ${only}`);
if (force) console.log("  --force: re-ejecutar aunque report.json diga OK");
else console.log("  Resume: omitir modelos ya OK en report.json (--force para repetir)");
if (downloadVideosOnly) console.log("  --download-videos: solo descargar MP4 desde JSON/file_id existente");
await mkdir(OUT_DIR, { recursive: true });
await persistCatalog();
console.log(`  Catálogo: ${join(OUT_DIR, "catalog.json")} · MODELS.md (${buildMinimaxFullCatalog().length} entradas)`);

if (downloadVideosOnly) {
	console.log(`\nDescarga MP4 (${VIDEO_MODELS.length})…`);
	for (const model of VIDEO_MODELS) {
		try {
			const ok = await tryDownloadVideoFromMeta(model);
			console.log(ok ? `  OK ${model} · MP4` : `  SKIP ${model} (sin JSON/file_id o ya existe)`);
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			console.log(`  FAIL ${model} ${msg.slice(0, 120)}`);
			console.warn(
				"    (MiniMax: download_url caduca ~9 h; si expiró, --force --only video para regenerar)",
			);
		}
	}
	process.exit(0);
}

const byKey = new Map<string, SampleResult>();
mergePriorIntoMap(await loadPriorResults(), byKey);
const priorOk = [...byKey.values()].filter((r) => r.ok).length;
if (priorOk && !force) console.log(`  Previos OK en report: ${priorOk}`);

const llms = await fetchListedLlms();

let results: SampleResult[] = buildResultsList(byKey, llms);
let skippedRun = 0;

async function saveProgress(): Promise<void> {
	results = buildResultsList(byKey, llms);
	await persistReport(results);
}

function shouldSkip(modality: string, model: string): boolean {
	if (force) return false;
	return byKey.get(resultKey(modality, model))?.ok === true;
}

if (!only || only === "language") {
	console.log(`\nLanguage (${llms.length})…`);
	for (const model of llms) {
		if (shouldSkip("language", model)) {
			skippedRun += 1;
			console.log(`  SKIP ${model} (ya OK)`);
			continue;
		}
		const r = await testLlm(model);
		byKey.set(resultKey("language", model), r);
		console.log(`  ${r.ok ? "OK" : "FAIL"} ${model} ${r.detail ?? r.baseMsg ?? ""}`);
		await saveProgress();
		await sleep(1200);
	}
}

if (!only || only === "speech") {
	console.log(`\nSpeech (${SPEECH_MODELS.length})…`);
	for (const model of SPEECH_MODELS) {
		if (shouldSkip("speech", model)) {
			skippedRun += 1;
			console.log(`  SKIP ${model} (ya OK)`);
			continue;
		}
		const r = await testTts(model);
		byKey.set(resultKey("speech", model), r);
		console.log(`  ${r.ok ? "OK" : "FAIL"} ${model}`);
		await saveProgress();
		await sleep(1200);
	}
}

if (!only || only === "image") {
	console.log("\nImage…");
	if (shouldSkip("image", IMAGE_MODEL_ID)) {
		skippedRun += 1;
		console.log(`  SKIP ${IMAGE_MODEL_ID} (ya OK)`);
	} else {
		const r = await testImage();
		byKey.set(resultKey("image", IMAGE_MODEL_ID), r);
		console.log(`  ${r.ok ? "OK" : "FAIL"} image-01`);
		await saveProgress();
	}
}

if (!only || only === "music") {
	console.log(`\nMusic (${MUSIC_MODELS.length})…`);
	for (const model of MUSIC_MODELS) {
		if (shouldSkip("music", model)) {
			skippedRun += 1;
			console.log(`  SKIP ${model} (ya OK)`);
			continue;
		}
		const r = await testMusic(model);
		byKey.set(resultKey("music", model), r);
		console.log(`  ${r.ok ? "OK" : "FAIL"} ${model}`);
		await saveProgress();
		await sleep(1500);
	}
}

if (!only || only === "video") {
	console.log(`\nVideo (${VIDEO_MODELS.length}) — puede tardar varios min…`);
	for (const model of VIDEO_MODELS) {
		if (shouldSkip("video", model)) {
			try {
				const gotMp4 = await tryDownloadVideoFromMeta(model);
				if (gotMp4) {
					const prev = byKey.get(resultKey("video", model));
					if (prev) {
						byKey.set(resultKey("video", model), {
							...prev,
							artifact: `video/${safeName(model)}.mp4`,
							detail: `${prev.detail ?? ""} · MP4 local`.replace(/^ · /, ""),
						});
						await saveProgress();
					}
					console.log(`  OK ${model} · MP4 descargado (tarea ya OK en report)`);
					continue;
				}
			} catch (e) {
				const msg = e instanceof Error ? e.message : String(e);
				console.warn(`  AVISO ${model}: retrieve/descarga falló (${msg.slice(0, 80)})`);
			}
			skippedRun += 1;
			console.log(`  SKIP ${model} (ya OK en report)`);
			continue;
		}
		try {
			const r = await testVideo(model);
			byKey.set(resultKey("video", model), r);
			console.log(`  ${r.ok ? "OK" : "FAIL"} ${model} ${r.detail ?? r.baseMsg ?? ""}`);
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			byKey.set(resultKey("video", model), {
				modality: "video",
				model,
				ok: false,
				detail: msg,
				elapsedMs: 0,
			});
			console.log(`  FAIL ${model} ${msg}`);
		}
		await saveProgress();
	}
}

results = buildResultsList(byKey, llms);
await persistReport(results);
await persistCatalog();

const failed = results.filter((r) => !r.ok);
console.log(`\nListo: ${results.length - failed.length}/${results.length} OK`);
if (skippedRun) console.log(`Omitidos esta pasada: ${skippedRun} (ya OK; --force para repetir)`);
console.log(`Carpeta: ${OUT_DIR}`);
if (failed.length) {
	console.log("Fallos:", failed.map((f) => `${f.modality}/${f.model}`).join(", "));
	process.exitCode = 1;
}
