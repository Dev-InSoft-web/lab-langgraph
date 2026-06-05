import { getPatyPgPool } from "../db/pg.js";

let applied = false;

/** DDL embebido (el zip de Azure no incluye `db/schema/`). */
const LAB_AUTHUSER_DDL = `
CREATE SCHEMA IF NOT EXISTS "BD_LAB";
CREATE TABLE IF NOT EXISTS "BD_LAB"."LAB_AUTHUSER" (
	"USERNAME" TEXT PRIMARY KEY,
	"PASSWORDHASH" TEXT NOT NULL,
	"DISPLAYNAME" TEXT,
	"ACTIVE" BOOLEAN NOT NULL DEFAULT true,
	"FHCRE" TIMESTAMPTZ NOT NULL DEFAULT now(),
	"FHULTACT" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "IX_LAB_AUTHUSER_ACTIVE" ON "BD_LAB"."LAB_AUTHUSER" ("USERNAME") WHERE "ACTIVE" = true;
`;

/** Solo tabla LAB_AUTHUSER — idempotente; no lee archivos del repo (compatible con Azure zip). */
export async function ensureLabAuthSchema(): Promise<void> {
	if (applied) return;
	await getPatyPgPool().query(LAB_AUTHUSER_DDL);
	applied = true;
}
