import { PG_SCHEMA_ISADOC, Q_ENTITY_ROW } from "./pg-identifiers.js";

/** Esquema PG del entity store ISA-DOC (único: BD_ISADOC). */
export function getEntityStoreSchema(_project: string): string {
	return PG_SCHEMA_ISADOC;
}

/** Tabla calificada `BD_ISADOC.ENTITY_ROW`. */
export function getEntityRowTable(_project: string): string {
	return Q_ENTITY_ROW;
}
