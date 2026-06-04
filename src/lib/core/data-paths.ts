import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

/** Raíz del repo ISA-DOC (hermano de lab-langgraph por defecto). */
export function resolveIsaDocRoot(): string {
	const fromEnv = process.env.ISA_DOC_ROOT?.trim();
	if (fromEnv && existsSync(join(fromEnv, "package.json"))) return fromEnv;
	const sibling = resolve(resolveLabRepoRoot(), "..", "ISA-DOC");
	if (existsSync(join(sibling, "package.json"))) return sibling;
	throw new Error("ISA-DOC no encontrado (defina ISA_DOC_ROOT).");
}

/** Raíz del repo lab-langgraph. */
export function resolveLabRepoRoot(): string {
	const fromEnv = process.env.LAB_LANGGRAPH_ROOT?.trim();
	if (fromEnv && existsSync(join(fromEnv, "package.json"))) return fromEnv;
	const cwd = process.cwd();
	if (existsSync(join(cwd, "package.json"))) return cwd;
	const nested = resolve(cwd, "lab-langgraph");
	if (existsSync(join(nested, "package.json"))) return nested;
	// Azure Functions: `dist/src/lib` → tres niveles arriba
	return resolve(__dirname, "../../..");
}

/** Corpus y artefactos de vectorización (YouTube, web/gov, …). */
export function vectorizeDataPath(...segments: string[]): string {
	return join(resolveLabRepoRoot(), "data", "vectorize", ...segments);
}

export const YOUTUBE_CORPUS_BASE = vectorizeDataPath("youtube/contapyme-software-contable");

export const GOVERNMENT_PAGES_DIR = vectorizeDataPath("web/government/pages");
