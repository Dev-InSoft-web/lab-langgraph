import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { resolvePersistenceRelPath } from "../core/lab-data-paths.js";
import { getEntityRow, upsertEntityRow } from "../ispgen/repository.js";
import { persistenceRelToSegment, unwrapPersistenceBody } from "./persistence-entity-map.js";

const PK = "default";

function fileMirrorEnabled(): boolean {
	return process.env.LAB_DATA_MIRROR?.trim().toLowerCase() === "true";
}

async function writeFileMirror(relPath: string, data: unknown): Promise<void> {
	if (!fileMirrorEnabled()) return;
	const abs = resolvePersistenceRelPath(relPath);
	if (!abs) return;
	await mkdir(dirname(abs), { recursive: true });
	await writeFile(abs, JSON.stringify(data, null, 2), "utf8");
}

/** Lectura runtime: solo PostgreSQL (ENTITY_ROW). Seed vía npm run entity:seed / db:migrate-full. */
export async function readPersistenceData<T = unknown>(relPath: string): Promise<T | null> {
	const seg = persistenceRelToSegment(relPath);
	if (!seg) return null;

	const row = await getEntityRow(seg, PK);
	return unwrapPersistenceBody<T>(row?.body ?? null);
}

/** Escritura runtime: PostgreSQL; espejo JSON solo si LAB_DATA_MIRROR=true. */
export async function writePersistenceData(relPath: string, data: unknown): Promise<void> {
	const seg = persistenceRelToSegment(relPath);
	if (!seg) throw new Error(`Persistencia sin segmento BD: ${relPath}`);

	await upsertEntityRow(seg, PK, { id: PK, body: data });
	await writeFileMirror(relPath, data);
}
