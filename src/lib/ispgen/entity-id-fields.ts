/**
 * Nomenclatura INSOFT: claves primarias y FK con prefijo I (sin guion bajo).
 * Valor compuesto de ruta sigue en columna PG IENTITYID.
 */

/** Campo(s) PK por entidad (slug en LAB_ENTITYROW.ENTITY). */
export const ENTITY_PRIMARY_KEY_FIELDS: Record<string, string[]> = {
	ticket: ["ITICKET"],
	"imgbb-asset": ["IIMGBB"],
	endpoint: ["IAPIPROJECT", "IENDPOINT"],
	revisado: ["IREVISADOKEY"],
	prompt: ["IPROMPTPATH"],
	"file-meta": ["IOAIFILEID"],
	table: ["ITABLEID"],
	state: ["ICODEGENSTATE"],
	"catalog-endpoint": ["ICATALOGENDPOINT"],
	"prompt-file": ["IPROMPTFILE"],
	conversaciones: ["ICONVCACHEID"],
	identidades: ["IIDENTCACHEID"],
	cursos: ["ICATALOGSLUG"],
	"planes-de-estudio": ["ICATALOGSLUG"],
	drivers: ["ICATALOGSLUG"],
	permisos: ["ICATALOGSLUG"],
	conversacion: ["ICATALOGSLUG"],
	jwt: ["ICATALOGSLUG"],
	mensaje: ["ICATALOGSLUG"],
	tiquete: ["ICATALOGSLUG"],
};

/** Alias legacy en JSON body → campo I (lectura compatible). */
export const LEGACY_BODY_ALIASES: Record<string, Record<string, string>> = {
	ticket: { code: "ITICKET" },
	"imgbb-asset": { filename: "IIMGBB", ticketId: "ITICKET" },
	endpoint: { apiProject: "IAPIPROJECT", id: "IENDPOINT" },
	revisado: { key: "IREVISADOKEY" },
	prompt: { path: "IPROMPTPATH" },
	"file-meta": { id: "IOAIFILEID" },
	table: { tableid: "ITABLEID" },
	state: { id: "ICODEGENSTATE" },
	"catalog-endpoint": { id: "ICATALOGENDPOINT" },
	"prompt-file": { relPath: "IPROMPTFILE" },
	conversaciones: { id: "ICONVCACHEID" },
	identidades: { id: "IIDENTCACHEID" },
	cursos: { slug: "ICATALOGSLUG" },
	"planes-de-estudio": { slug: "ICATALOGSLUG" },
	drivers: { slug: "ICATALOGSLUG" },
	permisos: { slug: "ICATALOGSLUG" },
	conversacion: { slug: "ICATALOGSLUG" },
	jwt: { slug: "ICATALOGSLUG" },
	mensaje: { slug: "ICATALOGSLUG" },
	tiquete: { slug: "ICATALOGSLUG" },
};

/** Inferencia por slug si no hay entrada explícita. */
export function inferPrimaryKeyFields(entitySlug: string): string[] {
	if (ENTITY_PRIMARY_KEY_FIELDS[entitySlug]) return ENTITY_PRIMARY_KEY_FIELDS[entitySlug];
	const base = entitySlug.replace(/-/g, "").toUpperCase();
	if (entitySlug.includes("-")) return [`I${base}`];
	return [`I${base}`];
}

export function normalizeBodyIdFields(
	entitySlug: string,
	data: Record<string, unknown>,
): Record<string, unknown> {
	const out = { ...data };
	const aliases = LEGACY_BODY_ALIASES[entitySlug];
	if (aliases) {
		for (const [oldKey, newKey] of Object.entries(aliases)) {
			if (out[newKey] === undefined && out[oldKey] !== undefined) {
				out[newKey] = out[oldKey];
			}
		}
	}
	return out;
}

/** Renombra claves en body (migración PG). */
export function migrateBodyKeys(entitySlug: string, body: Record<string, unknown>): Record<string, unknown> {
	const aliases = LEGACY_BODY_ALIASES[entitySlug];
	if (!aliases) return body;
	const out = { ...body };
	for (const [oldKey, newKey] of Object.entries(aliases)) {
		if (out[oldKey] !== undefined) {
			if (out[newKey] === undefined) out[newKey] = out[oldKey];
			delete out[oldKey];
		}
	}
	return out;
}
