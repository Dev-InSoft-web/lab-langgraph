import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { YOUTUBE_CORPUS_BASE } from "../core/data-paths.js";

export const CONTENT_KINDS = ["videos", "shorts", "streams"] as const;
export type ContentKind = (typeof CONTENT_KINDS)[number];

const YEAR_DIR_RE = /^\d{4}$/;
const VIDEO_JSON_RE = /^(.+)\.json$/;

export function resolveYoutubeCorpusBase(): string {
	const fromEnv = process.env.YOUTUBE_CORPUS_BASE_DIR?.trim();
	if (fromEnv && existsSync(fromEnv)) return fromEnv;

	const candidates = [YOUTUBE_CORPUS_BASE, join(process.cwd(), "data/vectorize/youtube/contapyme-software-contable")];
	for (const dir of candidates) {
		if (existsSync(dir)) return dir;
	}
	throw new Error(
		"No se encontró corpus YouTube ContaPyme. Define YOUTUBE_CORPUS_BASE_DIR o genera con lab:yt:transcripts.",
	);
}

export function contentRoot(kind: ContentKind): string {
	return join(resolveYoutubeCorpusBase(), kind);
}

/** Raíz de videos largos (compat). */
export function resolveYoutubeVideosDir(): string {
	const fromEnv = process.env.YOUTUBE_CORPUS_VIDEOS_DIR?.trim();
	if (fromEnv && existsSync(fromEnv)) return fromEnv;
	const root = contentRoot("videos");
	if (existsSync(root)) return root;
	throw new Error(`No existe ${root}`);
}

export type VideoJsonRef = {
	videoId: string;
	year: string;
	kind: ContentKind;
	jsonPath: string;
};

function parseVideoJsonName(name: string): string | null {
	if (!name.endsWith(".json") || name.endsWith(".info.json")) return null;
	const m = name.match(VIDEO_JSON_RE);
	return m ? m[1]! : null;
}

export async function listYearFolders(root: string): Promise<string[]> {
	try {
		const entries = await readdir(root, { withFileTypes: true });
		return entries
			.filter((e) => e.isDirectory() && (YEAR_DIR_RE.test(e.name) || e.name === "unknown"))
			.map((e) => e.name)
			.sort();
	} catch {
		return [];
	}
}

async function collectFromRoot(
	root: string,
	kind: ContentKind,
	byId: Map<string, VideoJsonRef>,
): Promise<void> {
	if (!existsSync(root)) return;
	for (const year of await listYearFolders(root)) {
		const dir = join(root, year);
		for (const name of await readdir(dir)) {
			const videoId = parseVideoJsonName(name);
			if (!videoId) continue;
			byId.set(`${kind}:${videoId}`, { videoId, year, kind, jsonPath: join(dir, name) });
		}
	}
	try {
		for (const name of await readdir(root)) {
			const videoId = parseVideoJsonName(name);
			if (!videoId || byId.has(`${kind}:${videoId}`)) continue;
			byId.set(`${kind}:${videoId}`, {
				videoId,
				year: "legacy",
				kind,
				jsonPath: join(root, name),
			});
		}
	} catch {
		/* */
	}
}

export async function listAllVideoJsonRefs(_legacy?: string): Promise<VideoJsonRef[]> {
	const byId = new Map<string, VideoJsonRef>();
	for (const kind of CONTENT_KINDS) {
		await collectFromRoot(contentRoot(kind), kind, byId);
	}
	return [...byId.values()].sort(
		(a, b) => a.kind.localeCompare(b.kind) || a.videoId.localeCompare(b.videoId),
	);
}

export async function resolveVideoJsonPath(
	videoId: string,
	opts?: { kind?: ContentKind },
): Promise<string> {
	const p = await resolveVideoArtifacts(videoId, opts);
	return p.json;
}

export async function resolveVideoArtifacts(
	videoId: string,
	opts?: { year?: string; kind?: ContentKind },
): Promise<{ json: string; md: string; yearDir: string; kind: ContentKind }> {
	const kinds = opts?.kind ? [opts.kind] : CONTENT_KINDS;
	for (const kind of kinds) {
		const root = contentRoot(kind);
		if (opts?.year) {
			const p = join(root, opts.year, `${videoId}.json`);
			if (existsSync(p)) {
				return {
					json: p,
					md: join(root, opts.year, `${videoId}.md`),
					yearDir: join(root, opts.year),
					kind,
				};
			}
		}
		for (const year of await listYearFolders(root)) {
			const p = join(root, year, `${videoId}.json`);
			if (existsSync(p)) {
				return { json: p, md: join(root, year, `${videoId}.md`), yearDir: join(root, year), kind };
			}
		}
		const legacy = join(root, `${videoId}.json`);
		if (existsSync(legacy)) {
			return { json: legacy, md: join(root, `${videoId}.md`), yearDir: root, kind };
		}
	}
	throw new Error(`No existe */*/${videoId}.json`);
}

export async function resolveVideoTestJsonPath(
	videoId: string,
	opts?: { kind?: ContentKind },
): Promise<{ testJson: string; testMd: string; yearDir: string }> {
	const name = `${videoId}-test.json`;
	const kinds = opts?.kind ? [opts.kind] : CONTENT_KINDS;
	for (const kind of kinds) {
		const root = contentRoot(kind);
		for (const year of await listYearFolders(root)) {
			const testJson = join(root, year, name);
			if (existsSync(testJson)) {
				return {
					testJson,
					testMd: join(root, year, `${videoId}-test.md`),
					yearDir: join(root, year),
				};
			}
		}
		const flat = join(root, name);
		if (existsSync(flat)) {
			return { testJson: flat, testMd: join(root, `${videoId}-test.md`), yearDir: root };
		}
	}
	throw new Error(`No existe ${name}`);
}
