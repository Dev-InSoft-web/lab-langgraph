import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { resolvePersistenceRelPath } from "../core/lab-data-paths.js";

export async function readPersistenceJson<T = unknown>(relPath: string): Promise<T | null> {
	const abs = resolvePersistenceRelPath(relPath);
	if (!abs) throw new Error(`Ruta no permitida: ${relPath}`);
	try {
		const raw = await readFile(abs, "utf8");
		return JSON.parse(raw) as T;
	} catch (e) {
		if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
		throw e;
	}
}

export async function writePersistenceJson(relPath: string, data: unknown): Promise<void> {
	const abs = resolvePersistenceRelPath(relPath);
	if (!abs) throw new Error(`Ruta no permitida: ${relPath}`);
	await mkdir(dirname(abs), { recursive: true });
	await writeFile(abs, JSON.stringify(data, null, 2), "utf8");
}
