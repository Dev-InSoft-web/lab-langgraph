import { readPersistenceJson, writePersistenceJson } from "./json-store.js";

export type ConvCacheItem = {
	iconversacion: number;
	hilo: string;
	fhcre: string | null;
};

type ConvCacheEntry = { items: ConvCacheItem[]; updatedAt: string };
type ConvCacheFile = Record<string, ConvCacheEntry>;

const CONV_REL = "patyia/caches/conversaciones-cache.json";
const ID_REL = "patyia/caches/identidades-cache.json";

function convKey(db: string, itercero: string, icontacto: string): string {
	return `${db}|${itercero}|${icontacto}`;
}

export async function leerConvsCache(
	db: string,
	itercero: string,
	icontacto: string,
): Promise<ConvCacheEntry | null> {
	const data = (await readPersistenceJson<ConvCacheFile>(CONV_REL)) ?? {};
	return data[convKey(db, itercero, icontacto)] ?? null;
}

export async function guardarConvsCache(
	db: string,
	itercero: string,
	icontacto: string,
	items: ConvCacheItem[],
): Promise<void> {
	const data = (await readPersistenceJson<ConvCacheFile>(CONV_REL)) ?? {};
	data[convKey(db, itercero, icontacto)] = { items, updatedAt: new Date().toISOString() };
	await writePersistenceJson(CONV_REL, data);
}

export type IdentidadesCache = {
	terceros: Record<string, { nombre: string }>;
	contactos: Record<string, { nombre: string }>;
	updatedAt?: string;
};

export async function loadIdentidadesCache(): Promise<IdentidadesCache> {
	const j = await readPersistenceJson<IdentidadesCache>(ID_REL);
	return {
		terceros: j?.terceros ?? {},
		contactos: j?.contactos ?? {},
		updatedAt: j?.updatedAt,
	};
}

export async function saveIdentidadesCache(cache: IdentidadesCache): Promise<void> {
	cache.updatedAt = new Date().toISOString();
	await writePersistenceJson(ID_REL, cache);
}
