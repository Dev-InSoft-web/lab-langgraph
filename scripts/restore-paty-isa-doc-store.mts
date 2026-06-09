/**
 * Restaura esquema BD_ISADOC y repuebla tablas vacías desde JSON ISA-DOC / lab data.
 *
 *   npm run paty:restore-isa-doc-store
 */
import { preloadLabSecrets } from "../src/lib/core/secrets.js";
import { ensureAllStoreSchemas } from "../src/lib/db/ensure-schemas.js";
import { getPatyPgPool } from "../src/lib/db/pg.js";
import { seedImgbbFromMap } from "../src/lib/ispgen/sync-from-files.js";
import {
	countIsadocTables,
	populateEmptyIsadocTables,
} from "../src/lib/ispgen/seed-isadoc-store.js";

preloadLabSecrets();

console.log("1/5 Verificando BD_ISADOC…");
await ensureAllStoreSchemas();

const pool = getPatyPgPool();
const er = await pool.query<{ n: number }>(
	`SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema='BD_ISADOC' AND table_name='ENTITY_ROW'`,
);
if (!(er.rows[0]?.n ?? 0)) {
	console.error("FALLO: no existe BD_ISADOC.ENTITY_ROW tras migración");
	process.exit(1);
}

console.log("\n2/5 Estado inicial:");
console.log("  ", await countIsadocTables());

console.log("\n3/5 Migrando tickets desde ISA-DOC…");
const { spawnSync } = await import("node:child_process");
const tickets = spawnSync("npx", ["tsx", "scripts/migrate-tickets-from-isa-doc.mts"], {
	cwd: process.cwd(),
	stdio: "inherit",
	shell: true,
});
if (tickets.status !== 0) process.exit(tickets.status ?? 1);

console.log("\n4/5 Migrando imgbb-map…");
const imgbb = await seedImgbbFromMap();
console.log(`   ${imgbb} filas imgbb-asset`);

console.log("\n5/5 Repoblando catálogo, entity rows, manifest y revisado…");
const populated = await populateEmptyIsadocTables();
console.log("  acciones:", populated.actions);
console.log("  después:", populated.after);

const counts = await pool.query<{ PROJECT: string; PAGE: string; ENTITY: string; n: number }>(
	`SELECT "PROJECT", "PAGE", "ENTITY", count(*)::int AS n
	 FROM "BD_ISADOC"."ENTITY_ROW" GROUP BY 1,2,3 ORDER BY n DESC`,
);
console.log("\nBD_ISADOC.ENTITY_ROW:");
for (const r of counts.rows) console.log(`  ${r.PROJECT}/${r.PAGE}/${r.ENTITY}: ${r.n}`);

await pool.end();
console.log("\n[ok] BD_ISADOC restaurado y repoblado desde ISA-DOC.");
