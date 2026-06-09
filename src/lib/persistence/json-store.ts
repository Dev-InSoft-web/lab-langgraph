import { readPersistenceData, writePersistenceData } from "./persistence-store.js";

/** @deprecated Usar readPersistenceData — mantiene nombre para imports existentes. */
export async function readPersistenceJson<T = unknown>(relPath: string): Promise<T | null> {
	return readPersistenceData<T>(relPath);
}

/** @deprecated Usar writePersistenceData — mantiene nombre para imports existentes. */
export async function writePersistenceJson(relPath: string, data: unknown): Promise<void> {
	return writePersistenceData(relPath, data);
}
