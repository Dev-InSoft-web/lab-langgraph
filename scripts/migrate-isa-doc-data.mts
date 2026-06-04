/**
 * Copia toda la persistencia migrable ISA-DOC → lab-langgraph/data.
 *
 *   npm run data:migrate-from-isa
 *   npm run data:migrate-from-isa -- --openai   # openai-storage (puede ser muy grande)
 */
import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";

const ISA = process.env.ISA_DOC_ROOT?.trim() || resolve(process.cwd(), "..", "ISA-DOC");
const LAB = resolve(process.cwd(), "data");
const withOpenAi = process.argv.includes("--openai");

function copyFile(src: string, dest: string): void {
	if (!existsSync(src)) return;
	mkdirSync(dirname(dest), { recursive: true });
	copyFileSync(src, dest);
	console.log(`  ${dest}`);
}

function copyDir(src: string, dest: string): void {
	if (!existsSync(src)) {
		console.warn(`[skip] no existe ${src}`);
		return;
	}
	mkdirSync(dest, { recursive: true });
	for (const name of readdirSync(src)) {
		const s = join(src, name);
		const d = join(dest, name);
		if (statSync(s).isDirectory()) copyDir(s, d);
		else copyFile(s, d);
	}
}

function moveJson(src: string, dest: string): void {
	if (!existsSync(src)) return;
	copyFile(src, dest);
}

console.log(`ISA-DOC: ${ISA}`);
console.log(`LAB:     ${LAB}\n`);

console.log("[postman]");
copyDir(join(ISA, "data", "postman"), join(LAB, "postman"));

console.log("\n[patyia prompts]");
copyDir(
	join(ISA, "src", "lib", "features", "patyia", "050-prompts", "catalog"),
	join(LAB, "patyia", "prompts", "catalog"),
);

console.log("\n[patyia caches]");
mkdirSync(join(LAB, "patyia", "caches"), { recursive: true });
moveJson(
	join(ISA, "data", "patyia", "conversaciones-cache.json"),
	join(LAB, "patyia", "caches", "conversaciones-cache.json"),
);
moveJson(
	join(ISA, "data", "patyia", "identidades-cache.json"),
	join(LAB, "patyia", "caches", "identidades-cache.json"),
);

console.log("\n[bitacora]");
mkdirSync(join(LAB, "bitacora"), { recursive: true });
moveJson(join(ISA, "data", "revisado.json"), join(LAB, "bitacora", "revisado.json"));

console.log("\n[tickets assets]");
copyDir(
	join(ISA, "src", "lib", "features", "tickets", "assets"),
	join(LAB, "tickets", "assets"),
);

console.log("\n[clientesis schema]");
copyDir(join(ISA, "public", "data", "clientesis"), join(LAB, "clientesis-schema"));

console.log("\n[codegen]");
copyDir(join(ISA, "public", "data", "codegen"), join(LAB, "codegen"));

console.log("\n[sql]");
copyDir(join(ISA, "public", "data", "sql"), join(LAB, "sql"));

if (withOpenAi) {
	console.log("\n[openai-storage — puede tardar]");
	copyDir(join(ISA, "data", "openai-storage"), join(LAB, "openai-storage"));
} else {
	console.log("\n[openai-storage] omitido (use --openai para copiar)");
}

console.log("\n[done] npm run catalog:build");
