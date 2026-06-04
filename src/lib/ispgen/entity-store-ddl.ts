import {
	COL_ER,
	PG_SCHEMA_CLIENTESIS,
	PG_SCHEMA_LAB,
	Q_CIS_ENTITY_ROW,
	Q_LAB_ENTITY_ROW,
	T_CIS_ENTITY_ROW,
	T_LAB_ENTITY_ROW,
} from "../db/pg-identifiers.js";
import { getEntityStoreSchema } from "../db/entity-store-table.js";

const C = COL_ER;

function entityStoreDdl(schema: string, table: string): string {
	return `
CREATE SCHEMA IF NOT EXISTS ${schema};
CREATE TABLE IF NOT EXISTS ${schema}.${table} (
	${C.PROJECT} text NOT NULL,
	${C.PAGE} text NOT NULL,
	${C.ENTITY} text NOT NULL,
	${C.PK} text NOT NULL,
	${C.BODY} jsonb NOT NULL DEFAULT '{}',
	${C.PARENTPROJECT} text,
	${C.PARENTPAGE} text,
	${C.PARENTENTITY} text,
	${C.PARENTPK} text,
	${C.SORTKEY} int NOT NULL DEFAULT 0,
	${C.TAGS} text[] NOT NULL DEFAULT '{}',
	${C.FHCRE} timestamptz NOT NULL DEFAULT now(),
	${C.FHULTACT} timestamptz NOT NULL DEFAULT now(),
	PRIMARY KEY (${C.PROJECT}, ${C.PAGE}, ${C.ENTITY}, ${C.PK})
);
CREATE INDEX IF NOT EXISTS ix_entity_row_segment ON ${schema}.${table} (${C.PROJECT}, ${C.PAGE}, ${C.ENTITY});
CREATE INDEX IF NOT EXISTS ix_entity_row_parent ON ${schema}.${table} (${C.PARENTPROJECT}, ${C.PARENTPAGE}, ${C.PARENTENTITY}, ${C.PARENTPK}) WHERE ${C.PARENTPK} IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_entity_row_tags ON ${schema}.${table} USING gin (${C.TAGS});
`;
}

export const LAB_ENTITY_STORE_DDL = entityStoreDdl(PG_SCHEMA_LAB, T_LAB_ENTITY_ROW);
export const CLIENTESIS_ENTITY_STORE_DDL = entityStoreDdl(PG_SCHEMA_CLIENTESIS, T_CIS_ENTITY_ROW);

export function ddlForEntityStoreProject(project: string): string {
	return entityStoreDdl(getEntityStoreSchema(project), getEntityStoreSchema(project) === PG_SCHEMA_CLIENTESIS ? T_CIS_ENTITY_ROW : T_LAB_ENTITY_ROW);
}
