import {
	PG_SCHEMA_CLIENTESIS,
	PG_SCHEMA_LAB,
	Q_CIS_ENTITY_ROW,
	Q_LAB_ENTITY_ROW,
} from "./pg-identifiers.js";
import { isClientesisStoreProject } from "./store-routing.js";

/** Esquema PG donde vive entity row para el proyecto lógico. */
export function getEntityStoreSchema(project: string): string {
	return isClientesisStoreProject(project) ? PG_SCHEMA_CLIENTESIS : PG_SCHEMA_LAB;
}

/** Tabla calificada (`bd_lab.lab_entity_row` | `bd_clientesis.cis_entity_row`). */
export function getEntityRowTable(project: string): string {
	return isClientesisStoreProject(project) ? Q_CIS_ENTITY_ROW : Q_LAB_ENTITY_ROW;
}
