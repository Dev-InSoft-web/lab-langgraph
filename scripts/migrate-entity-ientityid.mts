/**
 * Renombra PK→IENTITYID, PARENTPK→IPARENTENTITYID y claves JSON en BODY (code→ITICKET, etc.).
 *   npm run db:migrate-ientityid
 */
import { preloadLabSecrets } from "../src/lib/core/secrets.js";
import { getLanglabDatabaseUrl } from "../src/lib/core/config.js";
import { getPatyPgPool, pingPatyDb } from "../src/lib/db/pg.js";
import { pgQ } from "../src/lib/db/pg-quote.js";
import { migrateBodyKeys } from "../src/lib/ispgen/entity-id-fields.js";

preloadLabSecrets();
try {
	getLanglabDatabaseUrl();
} catch (e) {
	console.error(e);
	process.exit(1);
}
if (!(await pingPatyDb())) process.exit(1);

const pool = getPatyPgPool();

const ENTITY_STORES = [
	["BD_LAB", "ENTITY_ROW"],
	["BD_CLIENTESIS", "CIS_ENTITYROW"],
] as const;

async function tableExists(schema: string, table: string): Promise<boolean> {
	const r = await pool.query(
		`SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2`,
		[schema, table],
	);
	return (r.rowCount ?? 0) > 0;
}

async function columnExists(schema: string, table: string, col: string): Promise<boolean> {
	const r = await pool.query(
		`SELECT 1 FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2 AND column_name = $3`,
		[schema, table, col],
	);
	return (r.rowCount ?? 0) > 0;
}

async function renameEntityRowTable(schema: string, table: string): Promise<void> {
	const q = `${pgQ(schema)}.${pgQ(table)}`;
	if (await columnExists(schema, table, "PK")) {
		await pool.query(`ALTER TABLE ${q} RENAME COLUMN ${pgQ("PK")} TO ${pgQ("IENTITYID")}`);
		console.log(`  ${schema}.${table}: PK → IENTITYID`);
	}
	if (await columnExists(schema, table, "PARENTPK")) {
		await pool.query(`ALTER TABLE ${q} RENAME COLUMN ${pgQ("PARENTPK")} TO ${pgQ("IPARENTENTITYID")}`);
		console.log(`  ${schema}.${table}: PARENTPK → IPARENTENTITYID`);
	}
}

for (const [schema, table] of ENTITY_STORES) {
	if (!(await tableExists(schema, table))) {
		console.log(`Omitido ${schema}.${table} (no existe)`);
		continue;
	}
	console.log(`Columnas ${schema}.${table}…`);
	await renameEntityRowTable(schema, table);
}

console.log("\nMigrando claves en BODY…");
const selects: string[] = [];
for (const [schema, table] of ENTITY_STORES) {
	if (!(await tableExists(schema, table))) continue;
	selects.push(
		`SELECT '${schema}' AS store_schema, '${table}' AS store_table, "PROJECT" AS project, "PAGE" AS page, "ENTITY" AS entity, "BODY" AS body FROM ${pgQ(schema)}.${pgQ(table)}`,
	);
}
if (selects.length === 0) {
	console.log("  sin tablas entity row");
	process.exit(0);
}

const rows = await pool.query<{
	store_schema: string;
	store_table: string;
	project: string;
	page: string;
	entity: string;
	body: Record<string, unknown>;
}>(selects.join(" UNION ALL "));

let n = 0;
for (const row of rows.rows) {
	const migrated = migrateBodyKeys(row.entity, row.body ?? {});
	if (JSON.stringify(migrated) === JSON.stringify(row.body)) continue;
	const q = `${pgQ(row.store_schema)}.${pgQ(row.store_table)}`;
	await pool.query(
		`UPDATE ${q} SET "BODY" = $1::jsonb
		 WHERE "PROJECT" = $2 AND "PAGE" = $3 AND "ENTITY" = $4 AND "BODY" = $5::jsonb`,
		[JSON.stringify(migrated), row.project, row.page, row.entity, JSON.stringify(row.body)],
	);
	n++;
}
console.log(`  filas BODY actualizadas: ${n}`);
console.log("\n[ok] IENTITYID migración terminada.");
