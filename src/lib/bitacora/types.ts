/** Nodos del árbol de bitácora (layout en ENTITY_ROW). */
export type BitacoraWidgetId =
	| "PatyPgPromptsSync"
	| "Gpt5AdjuntosDiscovery"
	| "OldRebuildSection"
	| "DailySummary"
	| "JconfigDriverMatrix"
	| "CleanupTestDataMigration"
	| "IplanpadreToAtributoMigration"
	| "ImagenDocumentoDriverMigration"
	| string;

export type BitacoraLayoutNode =
	| {
			type: "day" | "group" | "section";
			title: string;
			titleIcon?: string;
			open?: boolean;
			checkKey?: string;
			checkKeys?: string[];
			children: BitacoraLayoutNode[];
	  }
	| { type: "md"; segmentId: string }
	| {
			type: "sql";
			segmentId: string;
			checkKey?: string;
	  }
	| { type: "widget"; widget: BitacoraWidgetId; props?: Record<string, unknown> };

export type BitacoraLayoutBody = {
	version: number;
	project: string;
	nodes: BitacoraLayoutNode[];
	updatedAt?: string;
};

export type BitacoraMdSegmentBody = {
	markdown: string;
	sourcePath?: string;
	dayId?: string;
};

export type BitacoraSqlSegmentBody = {
	title: string;
	sql: string;
	desc?: string;
	checkKey: string;
	confirmKind?: "warning" | "danger" | "info";
	confirmMessage?: string;
	height?: string;
	dbTarget?: "paty" | "clientesis";
	sourcePath?: string;
};

export type BitacoraBundle = {
	ok: true;
	project: string;
	layout: BitacoraLayoutBody;
	md: Record<string, BitacoraMdSegmentBody>;
	sql: Record<string, BitacoraSqlSegmentBody>;
};

export const BITACORA_PAGE = "bitacora";
export const ENTITY_LAYOUT = "layout";
export const ENTITY_SEGMENT_MD = "segment-md";
export const ENTITY_SEGMENT_SQL = "segment-sql";
