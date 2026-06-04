/**
 * Migra metadatos de TICKETS[] (ISA-DOC) → bd_lab.lab_entity_row (isa-doc/tickets/ticket).
 * El HTML del cuerpo sigue en records/**/TK-*.ts; en PG solo bodyModule + JSON.
 *
 *   ISA_DOC_ROOT=../ISA-DOC npx tsx scripts/migrate-tickets-from-isa-doc.mts
 */
import { existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { upsertEntityRow } from "../src/lib/ispgen/repository.js";
import { ensurePatySchema } from "../src/lib/db/ensure-schemas.js";

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, "..");
const isaRoot =
	process.env.ISA_DOC_ROOT?.trim() || join(repoRoot, "..", "ISA-DOC");
const ticketsRoot = join(isaRoot, "src", "lib", "features", "tickets");
const recordsRoot = join(ticketsRoot, "records");

function discoverBodyModule(code: string): string | undefined {
	if (!existsSync(recordsRoot)) return undefined;
	function walk(dir: string, rel = ""): string | undefined {
		for (const name of readdirSync(dir, { withFileTypes: true })) {
			const full = join(dir, name.name);
			const relPath = rel ? `${rel}/${name.name}` : name.name;
			if (name.isDirectory()) {
				const found = walk(full, relPath);
				if (found) return found;
				continue;
			}
			if (name.name === `${code}.ts`) return relPath.replace(/\.ts$/, "");
		}
		return undefined;
	}
	for (const proyecto of ["clientesis", "patyia"]) {
		const base = join(recordsRoot, proyecto);
		if (!existsSync(base)) continue;
		for (const mm of readdirSync(base, { withFileTypes: true })) {
			if (!mm.isDirectory() || mm.name.startsWith("_")) continue;
			const found = walk(join(base, mm.name), `${proyecto}/${mm.name}`);
			if (found) return found;
		}
	}
	return walk(recordsRoot);
}

function discoverSqlModule(code: string, bodyModule?: string): string | undefined {
	if (!bodyModule) return undefined;
	const sqlPath = join(recordsRoot, `${bodyModule}-sql.ts`);
	if (existsSync(sqlPath)) return `${bodyModule}-sql`;
	return undefined;
}

async function main(): Promise<void> {
	const indexUrl = pathToFileURL(join(ticketsRoot, "staticRegistry.ts")).href;
	const mod = await import(indexUrl);
	const tickets = mod.TICKETS as Array<Record<string, unknown>>;
	if (!Array.isArray(tickets)) {
		throw new Error("No se encontró TICKETS en staticRegistry.ts");
	}

	await ensurePatySchema();
	let n = 0;
	for (const t of tickets) {
		const code = String(t.id);
		const bodyModule = discoverBodyModule(code);
		const sqlModule = discoverSqlModule(code, bodyModule);
		const stored = {
			code,
			titulo: t.titulo,
			solicitante: t.solicitante,
			fechaSolicitud: t.fechaSolicitud,
			fechaEntrega: t.fechaEntrega,
			enlace: t.enlace,
			resumen: t.resumen,
			estimacionMinutos: t.estimacionMinutos,
			diligenciaMinutos: t.diligenciaMinutos,
			cambiosExtraMinutos: t.cambiosExtraMinutos,
			extraMinutos: t.extraMinutos,
			extraDescripcion: t.extraDescripcion,
			commits: t.commits,
			cambiosBd: t.cambiosBd,
			normativa: t.normativa,
			festivos: t.festivos,
			noMaquillarFechas: t.noMaquillarFechas,
			proyecto: t.proyecto ?? "ClientesIS",
			estado: "activo",
			bodyModule,
			sqlModule,
		};
		await upsertEntityRow(
			{ project: "isa-doc", page: "tickets", entity: "ticket" },
			code,
			stored,
			{ tags: [stored.proyecto, code] },
		);
		n++;
		console.log(`✓ ${code}${bodyModule ? ` · ${bodyModule}` : " · sin bodyModule"}`);
	}
	console.log(`\n${n} tickets en isa-doc/tickets/ticket`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
