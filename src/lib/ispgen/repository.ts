import type { Pool } from "pg";
import { COL_ER } from "../db/pg-identifiers.js";
import { getEntityRowTable } from "../db/entity-store-table.js";
import { getStorePgPool } from "../db/store-routing.js";
import { ddlForEntityStoreProject } from "./entity-store-ddl.js";
import type { EntityListQuery, EntityRow, EntitySchema, EntitySegment } from "./types.js";

const storeSchemaReady = new WeakSet<Pool>();

export async function ensureEntityStoreSchema(project = "isa-doc"): Promise<void> {
	const pool = getStorePgPool(project);
	if (storeSchemaReady.has(pool)) return;
	await pool.query(ddlForEntityStoreProject(project));
	storeSchemaReady.add(pool);
}

function segmentWhere(seg: EntitySegment, alias = ""): string {
	const p = alias ? `${alias}.` : "";
	const c = COL_ER;
	return `${p}${c.PROJECT} = $1 AND ${p}${c.PAGE} = $2 AND ${p}${c.ENTITY} = $3`;
}

function mapRow(r: Record<string, unknown>): EntityRow {
	const c = COL_ER;
	return {
		project: String(r[c.PROJECT] ?? r.project),
		page: String(r[c.PAGE] ?? r.page),
		entity: String(r[c.ENTITY] ?? r.entity),
		pk: String(r[c.PK] ?? r.pk),
		body: (typeof r[c.BODY] === "string" ? JSON.parse(r[c.BODY] as string) : r[c.BODY] ?? r.body) as Record<
			string,
			unknown
		>,
		parent_project: (r[c.PARENTPROJECT] ?? r.parent_project) as string | null,
		parent_page: (r[c.PARENTPAGE] ?? r.parent_page) as string | null,
		parent_entity: (r[c.PARENTENTITY] ?? r.parent_entity) as string | null,
		parent_pk: (r[c.PARENTPK] ?? r.parent_pk) as string | null,
		sort_key: Number(r[c.SORTKEY] ?? r.sort_key ?? 0),
		tags: (r[c.TAGS] ?? r.tags) as string[],
		created_at: String(r[c.FHCRE] ?? r.created_at),
		updated_at: String(r[c.FHULTACT] ?? r.updated_at),
	};
}

export async function getEntityRow(
	seg: EntitySegment,
	pk: string,
): Promise<EntityRow | null> {
	await ensureEntityStoreSchema(seg.project);
	const pool = getStorePgPool(seg.project);
	const table = getEntityRowTable(seg.project);
	const res = await pool.query(
		`SELECT * FROM ${table} WHERE ${segmentWhere(seg)} AND pk = $4`,
		[seg.project, seg.page, seg.entity, pk],
	);
	const row = res.rows[0];
	return row ? mapRow(row) : null;
}

export async function listEntityRows(
	seg: EntitySegment,
	query: EntityListQuery,
): Promise<{ rows: EntityRow[]; total: number }> {
	await ensureEntityStoreSchema(seg.project);
	const pool = getStorePgPool(seg.project);
	const table = getEntityRowTable(seg.project);
	const params: unknown[] = [seg.project, seg.page, seg.entity];
	const clauses = [segmentWhere(seg)];
	let idx = 4;

	if (query.parentPk) {
		clauses.push(`${COL_ER.PARENTPK} = $${idx++}`);
		params.push(query.parentPk);
	}
	if (query.tags?.length) {
		clauses.push(`${COL_ER.TAGS} @> $${idx++}::text[]`);
		params.push(query.tags);
	}
	if (query.filter) {
		for (const [k, v] of Object.entries(query.filter)) {
			clauses.push(`${COL_ER.BODY}->>$${idx++} = $${idx++}`);
			params.push(k, v);
		}
	}
	if (query.q?.trim()) {
		clauses.push(`${COL_ER.BODY}::text ILIKE $${idx++}`);
		params.push(`%${query.q.trim()}%`);
	}

	const where = clauses.join(" AND ");
	const countRes = await pool.query<{ c: string }>(
		`SELECT COUNT(*)::text AS c FROM ${table} WHERE ${where}`,
		params,
	);
	const total = Number(countRes.rows[0]?.c ?? 0);

	const limit = Math.min(Math.max(query.limit ?? 50, 1), 500);
	const offset = Math.max(query.offset ?? 0, 0);
	const listRes = await pool.query(
		`SELECT * FROM ${table} WHERE ${where}
		 ORDER BY ${COL_ER.SORTKEY}, ${COL_ER.PK} LIMIT $${idx++} OFFSET $${idx++}`,
		[...params, limit, offset],
	);

	return { rows: listRes.rows.map(mapRow), total };
}

export async function upsertEntityRow(
	seg: EntitySegment,
	pk: string,
	body: Record<string, unknown>,
	opts?: {
		parent?: EntitySegment & { pk: string };
		tags?: string[];
		sort_key?: number;
	},
): Promise<EntityRow> {
	await ensureEntityStoreSchema(seg.project);
	const pool = getStorePgPool(seg.project);
	const table = getEntityRowTable(seg.project);
	const parent = opts?.parent;
	await pool.query(
		`INSERT INTO ${table} (
			${COL_ER.PROJECT}, ${COL_ER.PAGE}, ${COL_ER.ENTITY}, ${COL_ER.PK}, ${COL_ER.BODY},
			${COL_ER.PARENTPROJECT}, ${COL_ER.PARENTPAGE}, ${COL_ER.PARENTENTITY}, ${COL_ER.PARENTPK},
			${COL_ER.SORTKEY}, ${COL_ER.TAGS}, ${COL_ER.FHULTACT}
		) VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9,$10,$11::text[],now())
		ON CONFLICT (${COL_ER.PROJECT}, ${COL_ER.PAGE}, ${COL_ER.ENTITY}, ${COL_ER.PK}) DO UPDATE SET
			${COL_ER.BODY} = EXCLUDED.${COL_ER.BODY},
			${COL_ER.PARENTPROJECT} = EXCLUDED.${COL_ER.PARENTPROJECT},
			${COL_ER.PARENTPAGE} = EXCLUDED.${COL_ER.PARENTPAGE},
			${COL_ER.PARENTENTITY} = EXCLUDED.${COL_ER.PARENTENTITY},
			${COL_ER.PARENTPK} = EXCLUDED.${COL_ER.PARENTPK},
			${COL_ER.SORTKEY} = EXCLUDED.${COL_ER.SORTKEY},
			${COL_ER.TAGS} = EXCLUDED.${COL_ER.TAGS},
			${COL_ER.FHULTACT} = now()`,
		[
			seg.project,
			seg.page,
			seg.entity,
			pk,
			JSON.stringify(body),
			parent?.project ?? null,
			parent?.page ?? null,
			parent?.entity ?? null,
			parent?.pk ?? null,
			opts?.sort_key ?? 0,
			opts?.tags ?? [],
		],
	);
	const row = await getEntityRow(seg, pk);
	if (!row) throw new Error("No se pudo leer fila tras upsert");
	return row;
}

export async function deleteEntityRow(seg: EntitySegment, pk: string): Promise<boolean> {
	await ensureEntityStoreSchema(seg.project);
	const pool = getStorePgPool(seg.project);
	const table = getEntityRowTable(seg.project);
	const res = await pool.query(
		`DELETE FROM ${table} WHERE ${segmentWhere(seg)} AND ${COL_ER.PK} = $4`,
		[seg.project, seg.page, seg.entity, pk],
	);
	return (res.rowCount ?? 0) > 0;
}

export async function listChildrenByFk(
	parentSeg: EntitySegment,
	parentPk: string,
	parentBody: Record<string, unknown>,
	childSeg: EntitySegment,
	fk: Record<string, string>,
): Promise<EntityRow[]> {
	await ensureEntityStoreSchema(childSeg.project);
	const pool = getStorePgPool(childSeg.project);
	const table = getEntityRowTable(childSeg.project);
	const res = await pool.query(
		`SELECT * FROM ${table}
		 WHERE ${COL_ER.PROJECT} = $1 AND ${COL_ER.PAGE} = $2 AND ${COL_ER.ENTITY} = $3
		   AND ${COL_ER.PARENTPROJECT} = $4 AND ${COL_ER.PARENTPAGE} = $5 AND ${COL_ER.PARENTENTITY} = $6 AND ${COL_ER.PARENTPK} = $7
		 ORDER BY ${COL_ER.SORTKEY}, ${COL_ER.PK}`,
		[
			childSeg.project,
			childSeg.page,
			childSeg.entity,
			parentSeg.project,
			parentSeg.page,
			parentSeg.entity,
			parentPk,
		],
	);
	let rows = res.rows.map(mapRow);
	if (!rows.length && Object.keys(fk).length) {
		const clauses: string[] = [segmentWhere(childSeg)];
		const params: unknown[] = [childSeg.project, childSeg.page, childSeg.entity];
		let i = 4;
		for (const [childKey, parentKey] of Object.entries(fk)) {
			const val = parentBody[parentKey];
			if (val === undefined) continue;
			clauses.push(`body->>$${i++} = $${i++}`);
			params.push(childKey, String(val));
		}
		const alt = await pool.query(
			`SELECT * FROM ${table} WHERE ${clauses.join(" AND ")} ORDER BY sort_key, pk`,
			params,
		);
		rows = alt.rows.map(mapRow);
	}
	return rows;
}

export async function deleteChildrenCascade(
	parentSeg: EntitySegment,
	parentPk: string,
	childSeg: EntitySegment,
): Promise<number> {
	await ensureEntityStoreSchema(childSeg.project);
	const pool = getStorePgPool(childSeg.project);
	const table = getEntityRowTable(childSeg.project);
	const res = await pool.query(
		`DELETE FROM ${table}
		 WHERE project = $1 AND page = $2 AND entity = $3
		   AND parent_project = $4 AND parent_page = $5 AND parent_entity = $6 AND parent_pk = $7`,
		[
			childSeg.project,
			childSeg.page,
			childSeg.entity,
			parentSeg.project,
			parentSeg.page,
			parentSeg.entity,
			parentPk,
		],
	);
	return res.rowCount ?? 0;
}
