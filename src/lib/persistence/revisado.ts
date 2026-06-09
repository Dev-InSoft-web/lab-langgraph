import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { ensureLanglabSchema } from "../db/ensure-schemas.js";
import { writePersistenceData } from "./persistence-store.js";
import { readRevisadoAllPg, writeRevisadoManyPg } from "./revisado-pg.js";

const REL = "bitacora/revisado.json";
export type RevisadoMap = Record<string, boolean>;

async function ensurePgRevisado(): Promise<void> {
	await ensureLanglabSchema();
}

async function mirrorJson(map: RevisadoMap): Promise<void> {
	try {
		await writePersistenceData(REL, map);
	} catch {
		/* ENTITY_ROW opcional si aún no hay seed */
	}
}

export async function readRevisadoAll(): Promise<RevisadoMap> {
	await ensurePgRevisado();
	const map = await readRevisadoAllPg();
	await mirrorJson(map);
	return map;
}

export async function writeRevisadoMany(updates: RevisadoMap): Promise<RevisadoMap> {
	await ensurePgRevisado();
	const next = await writeRevisadoManyPg(updates);
	await mirrorJson(next);
	return next;
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
	await mirrorJson(map);
	return map;
}
