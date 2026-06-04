import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { resolveLabRepoRoot } from "../core/data-paths.js";
import { resolveIsaDocRoot } from "../core/data-paths.js";
import { readPersistenceJson } from "./json-store.js";
import type { RevisadoMap } from "./revisado.js";

/** Unión de todas las fuentes JSON conocidas (true gana sobre ausente; false explícito se conserva). */
export async function loadMergedRevisadoJson(): Promise<RevisadoMap> {
	const out: RevisadoMap = {};

	const apply = (map: RevisadoMap | null | undefined, priority: number) => {
		if (!map || typeof map !== "object") return;
		for (const [k, v] of Object.entries(map)) {
			if (!k) continue;
			const prev = out[k];
			if (priority >= 2) {
				out[k] = !!v;
				continue;
			}
			if (v === true) out[k] = true;
			else if (prev === undefined) out[k] = !!v;
		}
	};

	apply(await readPersistenceJson<RevisadoMap>("bitacora/revisado.json"), 1);
	apply(await readJsonFile(join(resolveIsaDocRoot(), "data", "revisado.json")), 1);
	apply(await readJsonFile(join(resolveIsaDocRoot(), "public", "static-api", "revisado.json")), 0);
	apply(await readJsonFile(join(resolveIsaDocRoot(), "src", "data", "revisado.json")), 2);

	return out;
}

async function readJsonFile(abs: string): Promise<RevisadoMap | null> {
	try {
		const raw = await readFile(abs, "utf8");
		const parsed = JSON.parse(raw) as RevisadoMap;
		return parsed && typeof parsed === "object" ? parsed : null;
	} catch {
		return null;
	}
}

export function mergeRevisadoMaps(...maps: RevisadoMap[]): RevisadoMap {
	const out: RevisadoMap = {};
	for (const map of maps) {
		for (const [k, v] of Object.entries(map)) {
			if (!k) continue;
			if (v === true) out[k] = true;
			else if (out[k] === undefined) out[k] = !!v;
		}
	}
	return out;
}
