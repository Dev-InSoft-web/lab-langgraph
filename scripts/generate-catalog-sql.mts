/**
 * Genera db/schema/ops/009_seed_entity_definitions.sql desde catalog-definitions.ts
 *
 *   npx tsx scripts/generate-catalog-sql.mts
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { ENTITY_DEFINITIONS } from "../src/lib/ispgen/catalog-definitions.js";

const out = join(process.cwd(), "db", "schema", "ops", "009_seed_entity_definitions.sql");
const lines: string[] = [
	"-- Definiciones de entidad (generado; no editar a mano)",
	"-- Regenerar: npx tsx scripts/generate-catalog-sql.mts",
	"",
];

for (const e of ENTITY_DEFINITIONS) {
	const pk = JSON.stringify(e.primary_keys).replace(/'/g, "''");
	const cols = JSON.stringify(e.columns).replace(/'/g, "''");
	const det = JSON.stringify(e.details ?? []).replace(/'/g, "''");
	const sf = JSON.stringify(e.search_fields ?? []).replace(/'/g, "''");
	const desc = e.description ? `'${e.description.replace(/'/g, "''")}'` : "NULL";
	lines.push(
		`INSERT INTO bd_lab.lab_entity_definition (projectslug, sectionslug, entityslug, name, description, primarykeys, columns, details, searchfields, sortkey)`,
		`VALUES ('${e.project_slug}', '${e.section_slug}', '${e.entity_slug}', '${e.name.replace(/'/g, "''")}', ${desc},`,
		`  '${pk}'::jsonb, '${cols}'::jsonb, '${det}'::jsonb, '${sf}'::jsonb, ${e.sort_key})`,
		`ON CONFLICT (projectslug, sectionslug, entityslug) DO UPDATE SET`,
		`  name = EXCLUDED.name, description = EXCLUDED.description,`,
		`  primarykeys = EXCLUDED.primarykeys, columns = EXCLUDED.columns,`,
		`  details = EXCLUDED.details, searchfields = EXCLUDED.searchfields,`,
		`  sortkey = EXCLUDED.sortkey, fhultact = now();`,
		"",
	);
}

writeFileSync(out, lines.join("\n"), "utf8");
console.log(`[ok] ${ENTITY_DEFINITIONS.length} entidades → ${out}`);
