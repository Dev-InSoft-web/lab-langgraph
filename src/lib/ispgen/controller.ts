import { BasePojo } from "./pojo.js";
import { detailChild, wantsDetail, type JSDetailNode } from "./jsdetail.js";
import {
	deleteChildrenCascade,
	deleteEntityRow,
	getEntityRow,
	listChildrenByFk,
	listEntityRows,
	upsertEntityRow,
} from "./repository.js";
import { rspErr, rspList, rspOk, type IspgenResponse } from "./response.js";
import type { DetailRelation, EntityListQuery, EntityRow, EntitySchema } from "./types.js";

function projectBody(
	body: Record<string, unknown>,
	fields: string[] | undefined,
	schema: EntitySchema,
): Record<string, unknown> {
	const normalized = BasePojo.fromSchema(schema, body);
	if (!fields?.length) return normalized;
	const out: Record<string, unknown> = {};
	for (const pk of schema.primaryKeys) {
		if (normalized[pk] !== undefined) out[pk] = normalized[pk];
	}
	for (const f of fields) {
		if (normalized[f] !== undefined) out[f] = normalized[f];
	}
	return out;
}

/**
 * Controlador con propagación por detalles (InsertQryDetalle / sqlDetalle / JSDetail).
 * Pensado para extraer luego a @jeff-aporta/general.
 */
export class DetailEntityController {
	constructor(public readonly schema: EntitySchema) {}

	get segment() {
		return {
			project: this.schema.project,
			page: this.schema.page,
			entity: this.schema.entity,
		};
	}

	resolvePk(body: Record<string, unknown>): string {
		return BasePojo.pkFromBody(this.schema, body);
	}

	async getOne(pk: string, jsDetail: JSDetailNode | null, fields?: string[]): Promise<IspgenResponse> {
		const row = await getEntityRow(this.segment, pk);
		if (!row) return rspErr("No encontrado", 404);
		const datos = await this.expandDetail(row.body, jsDetail);
		return rspOk(projectBody(datos, fields, this.schema), {
			detalle: jsDetail ? { jsDetail } : undefined,
		});
	}

	async list(query: EntityListQuery): Promise<IspgenResponse> {
		const { rows, total } = await listEntityRows(this.segment, query);
		const lista = rows.map((r) => projectBody(r.body, query.fields, this.schema));
		return rspList(lista, total);
	}

	async create(
		body: Record<string, unknown>,
		opts?: { parent?: { project: string; page: string; entity: string; pk: string }; tags?: string[] },
	): Promise<IspgenResponse> {
		const normalized = BasePojo.fromSchema(this.schema, body);
		const pk = this.resolvePk(normalized);
		await this.propagateDetails(normalized, "insert");
		const row = await upsertEntityRow(this.segment, pk, normalized, {
			parent: opts?.parent,
			tags: opts?.tags,
		});
		return rspOk(projectBody(row.body, undefined, this.schema));
	}

	async update(pk: string, body: Record<string, unknown>, replace = false): Promise<IspgenResponse> {
		const existing = await getEntityRow(this.segment, pk);
		if (!existing) return rspErr("No encontrado", 404);
		const merged = replace
			? BasePojo.fromSchema(this.schema, body)
			: { ...existing.body, ...BasePojo.fromSchema(this.schema, body) };
		for (const k of this.schema.primaryKeys) {
			merged[k] = existing.body[k] ?? merged[k];
		}
		await this.propagateDetails(merged, "upsert");
		const row = await upsertEntityRow(this.segment, pk, merged);
		return rspOk(projectBody(row.body, undefined, this.schema));
	}

	async remove(pk: string): Promise<IspgenResponse> {
		const existing = await getEntityRow(this.segment, pk);
		if (!existing) return rspErr("No encontrado", 404);
		for (const rel of this.schema.details ?? []) {
			if (rel.cascadeDelete) {
				await deleteChildrenCascade(this.segment, pk, rel.child);
			}
		}
		await deleteEntityRow(this.segment, pk);
		return rspOk({ pk, deleted: true });
	}

	/** Expande hijos según JSDetail (GET ?detail= o /detail). */
	async expandDetail(
		body: Record<string, unknown>,
		jsDetail: JSDetailNode | null,
		pk?: string,
	): Promise<Record<string, unknown>> {
		const out = { ...body };
		if (!jsDetail || !this.schema.details?.length) return out;
		const rowPk = pk ?? this.resolvePk(body);
		for (const rel of this.schema.details) {
			if (!wantsDetail(jsDetail, rel.key)) continue;
			const childDetail = detailChild(jsDetail, rel.key);
			const children = await listChildrenByFk(this.segment, rowPk, body, rel.child, rel.fk);
			const mapped: Record<string, unknown>[] = [];
			for (const ch of children) {
				const childCtrl = getController(rel.child.project, rel.child.page, rel.child.entity);
				const childBody = childCtrl
					? await childCtrl.expandDetail(ch.body, childDetail, ch.pk)
					: ch.body;
				mapped.push(childBody);
			}
			out[rel.key] = mapped;
		}
		return out;
	}

	/** Inserta/actualiza arrays en propiedades de detalle (propagación al guardar). */
	async propagateDetails(
		parentBody: Record<string, unknown>,
		_mode: "insert" | "upsert",
	): Promise<void> {
		for (const rel of this.schema.details ?? []) {
			const raw = parentBody[rel.key];
			if (!Array.isArray(raw)) continue;
			const parentPk = this.resolvePk(parentBody);
			for (let i = 0; i < raw.length; i++) {
				const item = raw[i] as Record<string, unknown>;
				for (const [childFk, parentFk] of Object.entries(rel.fk)) {
					if (item[childFk] === undefined && parentBody[parentFk] !== undefined) {
						item[childFk] = parentBody[parentFk];
					}
				}
				const childCtrl = getController(rel.child.project, rel.child.page, rel.child.entity);
				if (!childCtrl) continue;
				const childBody = BasePojo.fromSchema(childCtrl.schema, item);
				const childPk = childCtrl.resolvePk(childBody);
				await upsertEntityRow(rel.child, childPk, childBody, {
					parent: { ...this.segment, pk: parentPk },
					sort_key: i,
				});
				await childCtrl.propagateDetails(childBody, "upsert");
			}
		}
	}
}

const controllers = new Map<string, DetailEntityController>();

function key(seg: { project: string; page: string; entity: string }): string {
	return `${seg.project}/${seg.page}/${seg.entity}`;
}

export function registerController(ctrl: DetailEntityController): void {
	controllers.set(key(ctrl.segment), ctrl);
}

export function clearRegisteredControllers(): void {
	controllers.clear();
}

export function getController(
	project: string,
	page: string,
	entity: string,
): DetailEntityController | undefined {
	return controllers.get(`${project}/${page}/${entity}`);
}

export function listRegisteredControllers(): EntitySchema[] {
	return [...controllers.values()].map((c) => c.schema);
}

export function parseListQuery(url: URL): EntityListQuery {
	const q: EntityListQuery = {};
	const limit = url.searchParams.get("limit");
	const offset = url.searchParams.get("offset");
	if (limit) q.limit = Number(limit);
	if (offset) q.offset = Number(offset);
	const search = url.searchParams.get("q");
	if (search) q.q = search;
	const fields = url.searchParams.get("fields");
	if (fields) q.fields = fields.split(",").map((s) => s.trim()).filter(Boolean);
	const parentPk = url.searchParams.get("parentPk") ?? url.searchParams.get("ticketId");
	if (parentPk) q.parentPk = parentPk;
	const tags = url.searchParams.get("tags");
	if (tags) q.tags = tags.split(",").map((s) => s.trim()).filter(Boolean);
	const filter: Record<string, string> = {};
	for (const [k, v] of url.searchParams.entries()) {
		if (k.startsWith("filter.")) filter[k.slice(7)] = v;
	}
	if (Object.keys(filter).length) q.filter = filter;
	return q;
}

export function rowToPublic(row: EntityRow, fields?: string[]): Record<string, unknown> {
	const ctrl = getController(row.project, row.page, row.entity);
	if (!ctrl) return row.body;
	return projectBody(row.body, fields, ctrl.schema);
}
