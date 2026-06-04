/**
 * Copia colecciones Postman del usuario (Documents) a ISA-DOC/data/postman.
 *
 *   npx tsx scripts/sync-postman-catalog.mts
 *
 * Rutas por defecto (Windows):
 *   AyudaCPIA → patyia/entities (split manual: solo actualiza collection si existe carpeta entities)
 *   ContaPymeU → clientesis/collection.json
 */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const ISA_DOC = process.env.ISA_DOC_ROOT?.trim() || resolve(process.cwd(), "..", "ISA-DOC");
const LAB_DATA = join(process.cwd(), "data", "postman");

const SOURCES = [
	{
		label: "PatyIA",
		src: process.env.POSTMAN_PATYIA_COLLECTION || "C:\\Users\\JAGUDELOE\\Documents\\AyudaCPIA.postman_collection.json",
		dests: [
			join(ISA_DOC, "data", "postman", "patyia", "collection.json"),
			join(LAB_DATA, "patyia", "collection.json"),
		],
	},
	{
		label: "ClientesIS ContaPymeU",
		src:
			process.env.POSTMAN_CLIENTESIS_COLLECTION ||
			"C:\\Users\\JAGUDELOE\\Documents\\500. ContaPymeU.postman_collection.json",
		dests: [
			join(ISA_DOC, "data", "postman", "clientesis", "collection.json"),
			join(LAB_DATA, "clientesis", "collection.json"),
		],
	},
];

for (const { label, src, dests } of SOURCES) {
	if (!existsSync(src)) {
		console.warn(`[skip] ${label}: no existe ${src}`);
		continue;
	}
	for (const dest of dests) {
		mkdirSync(dirname(dest), { recursive: true });
		copyFileSync(src, dest);
		console.log(`[ok] ${label} → ${dest}`);
	}
}

console.log(`ISA-DOC: ${ISA_DOC}`);
console.log(`Tras importar: npm run catalog:build`);
console.log("PatyIA fragmentada: entities en ISA-DOC/data/postman/patyia/entities/");
