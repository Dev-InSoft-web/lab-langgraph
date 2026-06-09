import type { Pool } from "pg";
import { getLanglabPgPool } from "./pg.js";

/** Proyectos con filas en BD_ISADOC (distinción lógica por columna PROJECT). */
export const CLIENTESIS_STORE_PROJECTS = new Set(["clientesis"]);

export function isClientesisStoreProject(project: string): boolean {
	return CLIENTESIS_STORE_PROJECTS.has(project.trim().toLowerCase());
}

/** Pool PG del entity store (todo en LANGLAB_DATABASE_URL / BD_ISADOC). */
export function getStorePgPool(_project: string): Pool {
	return getLanglabPgPool();
}

/** Pool del catálogo store (BD_ISADOC). */
export function getCatalogPgPool(): Pool {
	return getLanglabPgPool();
}
