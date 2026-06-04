/** Segmento de ruta: /api/entity/{project}/{page}/{entity} */
export type EntitySegment = {
	project: string;
	page: string;
	entity: string;
};

export type ColumnKind = "string" | "number" | "boolean" | "json" | "date";

export type ColumnDef = {
	name: string;
	kind: ColumnKind;
	required?: boolean;
	readOnly?: boolean;
};

/** Metadatos de un POJO persistido en lab.entity_row o clientesis.entity_row */
export type EntitySchema = EntitySegment & {
	/** Claves primarias compuestas (orden importa para pk string) */
	primaryKeys: string[];
	columns: ColumnDef[];
	/** Relaciones hijas propagables (estilo Capacitación / ispgen) */
	details?: DetailRelation[];
	/** Campos indexables en listados (?q=) */
	searchFields?: string[];
};

export type DetailRelation = {
	/** Propiedad en el JSON padre, ej. "atributos" */
	key: string;
	child: EntitySegment;
	/** Mapeo FK hijo → campo padre */
	fk: Record<string, string>;
	cascadeDelete?: boolean;
};

export type EntityListQuery = {
	limit?: number;
	offset?: number;
	/** Búsqueda ILIKE en searchFields del schema */
	q?: string;
	/** Proyección: solo estas claves del body (+ PKs) */
	fields?: string[];
	/** Filtro por padre (valor IENTITYID del padre) */
	parentPk?: string;
	parentEntityId?: string;
	/** Etiquetas (todas deben estar presentes) */
	tags?: string[];
	/** Filtros arbitrarios en body (?filter.key=value) */
	filter?: Record<string, string>;
};

export type EntityRow<T extends Record<string, unknown> = Record<string, unknown>> = {
	project: string;
	page: string;
	entity: string;
	/** Valor compuesto de clave (ruta /ientityid) */
	ientityid: string;
	/** @deprecated usar ientityid */
	pk: string;
	body: T;
	parent_project?: string | null;
	parent_page?: string | null;
	parent_entity?: string | null;
	iparententityid?: string | null;
	/** @deprecated usar iparententityid */
	parent_pk?: string | null;
	sort_key: number;
	tags: string[];
	created_at: string;
	updated_at: string;
};
