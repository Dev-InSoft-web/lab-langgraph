/**

 * Migra bitácora ClientesIS (md + sql + layout) → BD_ISADOC ENTITY_ROW.

 *

 *   npm run bitacora:migrate-clientesis

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

	CLIENTESIS_BITACORA_DATA,

	CLIENTESIS_LAYOUT_NODES,

	CLIENTESIS_SQL_SEGMENTS,

	listClientesisMdSegments,

} from "./bitacora/clientesis-manifest.js";



preloadLabSecrets();



const BITACORA_ROOT = join(resolveLabRepoRoot(), CLIENTESIS_BITACORA_DATA);

const PROJECT = "clientesis";



function readMd(rel: string): string {
	const abs = join(BITACORA_ROOT, "md", rel);
	if (!existsSync(abs)) throw new Error(`No existe: ${abs}`);
	return readFileSync(abs, "utf8");
}

function readSql(rel: string): string {
	const abs = join(BITACORA_ROOT, "sql", rel);
	if (!existsSync(abs)) throw new Error(`No existe: ${abs}`);
	return readFileSync(abs, "utf8");
}



console.log("1/3 Esquema BD_ISADOC…");

await ensureAllStoreSchemas();



console.log("2/3 Segmentos md + sql…");

const mdSegments = listClientesisMdSegments(BITACORA_ROOT);

let mdN = 0;

for (const m of mdSegments) {

	await saveBitacoraMdSegment(

		PROJECT,

		m.id,

		{ markdown: readMd(m.path), sourcePath: m.path, dayId: m.dayId },

		mdN++,

	);

}

let sqlN = 0;

for (const s of CLIENTESIS_SQL_SEGMENTS) {

	await saveBitacoraSqlSegment(

		PROJECT,

		s.id,

		{

			title: s.title,

			sql: readSql(s.sqlPath),

			desc: s.desc,

			checkKey: s.checkKey,

			confirmKind: s.confirmKind,

			confirmMessage: s.confirmMessage,

			height: s.height,

			dbTarget: s.dbTarget ?? "clientesis",

			sourcePath: s.sqlPath,

		},

		sqlN++,

	);

}



console.log("3/3 Layout…");

await saveBitacoraLayout(PROJECT, {

	version: 1,

	project: PROJECT,

	nodes: CLIENTESIS_LAYOUT_NODES,

});



console.log(`[ok] clientesis/bitacora: ${mdN} md, ${sqlN} sql, layout default`);

process.exit(0);

