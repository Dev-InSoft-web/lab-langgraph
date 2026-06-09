import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { ensureLanglabSchema } from "../db/ensure-schemas.js";
import { readPersistenceJson, writePersistenceJson } from "./json-store.js";
import { countRevisadoPg, readRevisadoAllPg, writeRevisadoManyPg } from "./revisado-pg.js";
import { loadMergedRevisadoJson } from "./revisado-merge.js";

const REL = "bitacora/revisado.json";
export type RevisadoMap = Record<string, boolean>;

let pgReady: Promise<void> | null = null;

async function ensurePgRevisado(): Promise<void> {
	if (!pgReady) {
		pgReady = (async () => {
			await ensureLanglabSchema();
			if ((await countRevisadoPg()) > 0) return;
			const merged = await loadMergedRevisadoJson();
			if (Object.keys(merged).length) await writeRevisadoManyPg(merged);
		})();
	}
	await pgReady;
}

async function mirrorJson(map: RevisadoMap): Promise<void> {
	try {
		await writePersistenceJson(REL, map);
	} catch {
		/* backup opcional */
	}
}

export async function readRevisadoAll(): Promise<RevisadoMap> {
	try {
		await ensurePgRevisado();
		const map = await readRevisadoAllPg();
		await mirrorJson(map);
		return map;
	} catch {
		const json = await readPersistenceJson<RevisadoMap>(REL);
		if (json && Object.keys(json).length) return { ...json };
		const merged = await loadMergedRevisadoJson();
		return { ...merged };
	}
}

export async function writeRevisadoMany(updates: RevisadoMap): Promise<RevisadoMap> {
	try {
		await ensurePgRevisado();
		const next = await writeRevisadoManyPg(updates);
		await mirrorJson(next);
		return next;
	} catch {
		const cur = (await readPersistenceJson<RevisadoMap>(REL)) ?? {};
		for (const [k, v] of Object.entries(updates)) cur[k] = !!v;
		await writePersistenceJson(REL, cur);
		return { ...cur };
	}
}

/** Exporta JSON unificado a ISA-DOC (recuperación / gh-pages). */
export async function exportRevisadoSnapshots(): Promise<RevisadoMap> {
	const map = await readRevisadoAll();
	const { resolveIsaDocRoot } = await import("../core/data-paths.js");
	const root = resolveIsaDocRoot();
	const body = JSON.stringify(map, null, 2) + "\n";
	for (const rel of ["data/revisado.json", "public/static-api/revisado.json"] as const) {
		const abs = join(root, ...rel.split("/"));
		await mkdir(dirname(abs), { recursive: true });
		await writeFile(abs, body, "utf8");
	}
	await writePersistenceJson(REL, map);
	return map;
}
