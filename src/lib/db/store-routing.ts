import type { Pool } from "pg";
import { getClientesisPgPool, getPatyPgPool } from "./pg.js";

/** Proyectos cuyas filas viven en la BD ClientesIS (PostgreSQL dedicada). */
export const CLIENTESIS_STORE_PROJECTS = new Set(["clientesis"]);

export function isClientesisStoreProject(project: string): boolean {
	return CLIENTESIS_STORE_PROJECTS.has(project.trim().toLowerCase());
}

/** Pool PG para `entity_row` (`lab.*` o `clientesis.*`) según proyecto lógico. */
export function getStorePgPool(project: string): Pool {
	return isClientesisStoreProject(project) ? getClientesisPgPool() : getPatyPgPool();
}

/** Pool del catálogo (metadatos: proyectos, secciones, definiciones, manifiesto API). */
export function getCatalogPgPool(): Pool {
	return getPatyPgPool();
}
