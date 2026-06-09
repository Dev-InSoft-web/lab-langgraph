/**
 * Migra bitácora PatyIA (md + sql + layout) desde data/bitacora/patyia → BD_ISADOC ENTITY_ROW.
 *
 *   npm run bitacora:migrate-patyia
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { preloadLabSecrets } from "../src/lib/core/secrets.js";
import { resolveLabRepoRoot } from "../src/lib/core/data-paths.js";
import { ensureAllStoreSchemas } from "../src/lib/db/ensure-schemas.js";
import {
	saveBitacoraLayout,
	saveBitacoraMdSegment,
	saveBitacoraSqlSegment,
} from "../src/lib/bitacora/repository.js";
import {
	PATYIA_BITACORA_DATA,
	PATYIA_LAYOUT_NODES,
	PATYIA_MD_SEGMENTS,
	PATYIA_SQL_SEGMENTS,
} from "./bitacora/patyia-manifest.js";

preloadLabSecrets();

const BITACORA_ROOT = join(resolveLabRepoRoot(), PATYIA_BITACORA_DATA);
const PROJECT = "patyia";

function readUtf8(rel: string): string {
	const abs = join(BITACORA_ROOT, rel);
	if (!existsSync(abs)) throw new Error(`No existe: ${abs}`);
	return readFileSync(abs, "utf8");
}

console.log("1/3 Esquema BD_ISADOC…");
await ensureAllStoreSchemas();

console.log("2/3 Segmentos md + sql…");
let mdN = 0;
for (const m of PATYIA_MD_SEGMENTS) {
	await saveBitacoraMdSegment(
		PROJECT,
		m.id,
		{ markdown: readUtf8(m.path), sourcePath: m.path, dayId: m.dayId },
		mdN++,
	);
}
let sqlN = 0;
for (const s of PATYIA_SQL_SEGMENTS) {
	await saveBitacoraSqlSegment(
		PROJECT,
		s.id,
		{
			title: s.title,
			sql: readUtf8(s.sqlPath),
			desc: s.desc,
			checkKey: s.checkKey,
			confirmKind: s.confirmKind,
			confirmMessage: s.confirmMessage,
			height: s.height,
			dbTarget: "paty",
			sourcePath: s.sqlPath,
		},
		sqlN++,
	);
}

console.log("3/3 Layout…");
await saveBitacoraLayout(PROJECT, {
	version: 1,
	project: PROJECT,
	nodes: PATYIA_LAYOUT_NODES,
});

console.log(`[ok] patyia/bitacora: ${mdN} md, ${sqlN} sql, layout default`);
process.exit(0);
