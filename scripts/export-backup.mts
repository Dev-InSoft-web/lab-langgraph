/**
 * Exporta backup JSON minificado (CLI, equivalente a POST /api/backup).
 *
 *   npm run backup:export -- langlab clientesis patyia
 *   npm run backup:export -- --projects '["langlab"]'
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { preloadLabSecrets } from "../src/lib/core/secrets.js";
import {
	buildBackup,
	minifyBackup,
	normalizeBackupProjects,
	type BackupProject,
} from "../src/lib/backup/export.js";

preloadLabSecrets();

let raw: unknown = process.argv.slice(2);
if (raw.length === 1 && raw[0]?.startsWith("--projects")) {
	const eq = raw[0].indexOf("=");
	raw = eq >= 0 ? JSON.parse(raw[0].slice(eq + 1)) : JSON.parse(process.argv[3] ?? "[]");
} else if (raw.length && typeof raw[0] === "string" && !raw[0].startsWith("-")) {
	raw = raw;
}

const projects = normalizeBackupProjects(raw);
if (!projects.length) {
	console.error('Uso: npm run backup:export -- langlab [clientesis] [patyia]');
	console.error('  o: npm run backup:export -- --projects \'["langlab","patyia"]\'');
	process.exit(1);
}

console.log("Exportando:", projects.join(", "));
const payload = await buildBackup(projects);
const out = `data/backup/lab-backup-${payload.generatedAt.replace(/[:.]/g, "-")}.json`;
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, minifyBackup(payload), "utf8");
console.log(`[ok] ${out}`);
if (payload.errors) console.warn("Errores parciales:", payload.errors);
