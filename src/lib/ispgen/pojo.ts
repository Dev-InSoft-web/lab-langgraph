import type { ColumnDef, EntitySchema } from "./types.js";

function coerceValue(kind: ColumnDef["kind"], v: unknown): unknown {
	if (v === undefined || v === null) return v;
	switch (kind) {
		case "number":
			return typeof v === "number" ? v : Number(v);
		case "boolean":
			return typeof v === "boolean" ? v : v === "true" || v === 1;
		case "json":
			return typeof v === "object" ? v : JSON.parse(String(v));
		case "date":
			return typeof v === "string" ? v : String(v);
		default:
			return String(v);
	}
}

/** POJO base: carga/guarda JSON con columnas declaradas (sin dependencia de @ingenieria_insoft/ispgen). */
export class BasePojo {
	protected f: Record<string, unknown> = {};

	constructor(data?: Record<string, unknown>) {
		if (data) this.loadFromJSON(data);
	}

	loadFromJSON(data: Record<string, unknown>): this {
		Object.assign(this.f, data);
		return this;
	}

	toJSON(): Record<string, unknown> {
		return { ...this.f };
	}

	static fromSchema(schema: EntitySchema, data: Record<string, unknown>): Record<string, unknown> {
		const out: Record<string, unknown> = {};
		for (const col of schema.columns) {
			if (data[col.name] !== undefined) {
				out[col.name] = coerceValue(col.kind, data[col.name]);
			}
		}
		for (const pk of schema.primaryKeys) {
			if (data[pk] !== undefined) out[pk] = data[pk];
		}
		return out;
	}

	static pkFromBody(schema: EntitySchema, body: Record<string, unknown>): string {
		const parts = schema.primaryKeys.map((k) => {
			const v = body[k];
			if (v === undefined || v === null || v === "") {
				throw new Error(`Falta clave primaria: ${k}`);
			}
			return encodeURIComponent(String(v));
		});
		return parts.join("/");
	}
}
