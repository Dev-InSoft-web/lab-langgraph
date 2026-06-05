import {
	COL_ER,
	PG_SCHEMA_CLIENTESIS,
	PG_SCHEMA_LAB,
	T_CLIENTESIS_ENTITYROW,
	T_ENTITY_ENTITYROW,
} from "../db/pg-identifiers.js";
import { pgQ, qualifiedQ } from "../db/pg-quote.js";
import { getEntityStoreSchema } from "../db/entity-store-table.js";

const C = COL_ER;

function entityStoreDdl(schema: string, table: string): string {
	const q = qualifiedQ(schema, table);
	return `
CREATE SCHEMA IF NOT EXISTS ${pgQ(schema)};
CREATE TABLE IF NOT EXISTS ${q} (
	${C.PROJECT} text NOT NULL,
	${C.PAGE} text NOT NULL,
	${C.ENTITY} text NOT NULL,
	${C.IENTITYID} text NOT NULL,
	${C.BODY} jsonb NOT NULL DEFAULT '{}',
	${C.PARENTPROJECT} text,
	${C.PARENTPAGE} text,
	${C.PARENTENTITY} text,
	${C.IPARENTENTITYID} text,
	${C.SORTKEY} int NOT NULL DEFAULT 0,
	${C.TAGS} text[] NOT NULL DEFAULT '{}',
	${C.FHCRE} timestamptz NOT NULL DEFAULT now(),
	${C.FHULTACT} timestamptz NOT NULL DEFAULT now(),
	PRIMARY KEY (${C.PROJECT}, ${C.PAGE}, ${C.ENTITY}, ${C.IENTITYID})
);
CREATE INDEX IF NOT EXISTS ix_entity_row_segment ON ${q} (${C.PROJECT}, ${C.PAGE}, ${C.ENTITY});
CREATE INDEX IF NOT EXISTS ix_entity_row_parent ON ${q} (${C.PARENTPROJECT}, ${C.PARENTPAGE}, ${C.PARENTENTITY}, ${C.IPARENTENTITYID}) WHERE ${C.IPARENTENTITYID} IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_entity_row_tags ON ${q} USING gin (${C.TAGS});
`;
}

export const LAB_ENTITY_STORE_DDL = entityStoreDdl(PG_SCHEMA_LAB, T_ENTITY_ENTITYROW);
export const CLIENTESIS_ENTITY_STORE_DDL = entityStoreDdl(PG_SCHEMA_CLIENTESIS, T_CLIENTESIS_ENTITYROW);

export function ddlForEntityStoreProject(project: string): string {
	return entityStoreDdl(
		getEntityStoreSchema(project),
		getEntityStoreSchema(project) === PG_SCHEMA_CLIENTESIS ? T_CLIENTESIS_ENTITYROW : T_ENTITY_ENTITYROW,
	);
}
