/**
 * Exporta TICKETS[] de ISA-DOC/staticRegistry.ts → data/tickets/ticket-registry.snapshot.json
 * (fuente para tickets:migrate-store cuando el registro estático ya está vacío).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dir, "..");
const isaRoot = process.env.ISA_DOC_ROOT?.trim() || join(repoRoot, "..", "ISA-DOC");
const registry = join(isaRoot, "src/lib/features/tickets/staticRegistry.ts");
const out = join(repoRoot, "data/tickets/ticket-registry.snapshot.json");

const mod = await import(pathToFileURL(registry).href);
const tickets = mod.TICKETS as unknown[];
if (!Array.isArray(tickets) || tickets.length === 0) {
	console.error("TICKETS vacío o ausente en staticRegistry.ts");
	process.exit(1);
}
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(tickets, null, 2), "utf8");
console.log(`[ok] ${tickets.length} tickets → ${out}`);
