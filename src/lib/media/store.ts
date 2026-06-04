import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

export type MediaEntry = {
	id: string;
	source: string;
	page: number;
	index: number;
	width: number;
	height: number;
};

type Manifest = { items: MediaEntry[] };

const MEDIA_ROOT = process.env.MEDIA_STORAGE_PATH?.trim() || join(process.cwd(), "storage", "media");
const MANIFEST_PATH = join(MEDIA_ROOT, "manifest.json");

let manifestCache: Manifest | null = null;

async function ensureDir(): Promise<void> {
	await mkdir(MEDIA_ROOT, { recursive: true });
}

async function readManifest(): Promise<Manifest> {
	if (manifestCache) return manifestCache;
	try {
		const raw = await readFile(MANIFEST_PATH, "utf8");
		manifestCache = JSON.parse(raw) as Manifest;
		return manifestCache;
	} catch {
		manifestCache = { items: [] };
		return manifestCache;
	}
}

async function writeManifest(manifest: Manifest): Promise<void> {
	manifestCache = manifest;
	await ensureDir();
	await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf8");
}

export function mediaFilePath(id: string): string {
	return join(MEDIA_ROOT, `${id}.png`);
}

export function buildMediaUrl(apiBase: string, id: string): string {
	const base = apiBase.replace(/\/$/, "");
	return `${base}/media/${id}`;
}

export async function clearAllMedia(): Promise<void> {
	manifestCache = { items: [] };
	try {
		await rm(MEDIA_ROOT, { recursive: true, force: true });
	} catch {
		/* ignore */
	}
	await ensureDir();
	await writeManifest({ items: [] });
}

export async function saveEmbeddedImage(
	source: string,
	page: number,
	index: number,
	pngBuffer: Buffer,
	width: number,
	height: number,
): Promise<MediaEntry> {
	const id = createHash("sha256")
		.update(`${source}|${page}|${index}|${pngBuffer.length}`)
		.digest("hex")
		.slice(0, 20);

	const entry: MediaEntry = { id, source, page, index, width, height };
	await ensureDir();
	await writeFile(mediaFilePath(id), pngBuffer);

	const manifest = await readManifest();
	manifest.items = manifest.items.filter((m) => m.id !== id);
	manifest.items.push(entry);
	await writeManifest(manifest);
	return entry;
}

export async function readMediaPng(id: string): Promise<Buffer | null> {
	const safe = id.replace(/[^a-f0-9]/gi, "");
	if (!safe) return null;
	try {
		return await readFile(mediaFilePath(safe));
	} catch {
		return null;
	}
}

/** Páginas del chunk (ej. "5" o "3-7") vs imagen en página N. */
export function pageMatches(chunkPage: string, imagePage: number): boolean {
	const p = chunkPage.trim();
	if (p === String(imagePage)) return true;
	const range = p.match(/^(\d+)\s*-\s*(\d+)$/);
	if (range) {
		const a = parseInt(range[1], 10);
		const b = parseInt(range[2], 10);
		return imagePage >= a && imagePage <= b;
	}
	return false;
}

export async function getImagesForSourcePage(source: string, page: string): Promise<MediaEntry[]> {
	const manifest = await readManifest();
	return manifest.items
		.filter((m) => m.source === source && pageMatches(page, m.page))
		.sort((a, b) => a.index - b.index);
}

export async function countMedia(): Promise<number> {
	const manifest = await readManifest();
	return manifest.items.length;
}
