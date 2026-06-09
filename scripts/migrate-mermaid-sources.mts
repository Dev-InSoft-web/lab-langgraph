/**
 * Migra .mmd de ISA-DOC → PG (publish idempotente por mermaidInkUrl).
 *
 *   npm run tickets:migrate-mermaid
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { preloadLabSecrets } from "../src/lib/core/secrets.js";
import { ensureAllStoreSchemas } from "../src/lib/db/ensure-schemas.js";
import { publishMermaidAsset } from "../src/lib/tickets/mermaid-asset.js";

preloadLabSecrets();

const isaRoot = process.env.ISA_DOC_ROOT?.trim() || join(process.cwd(), "..", "ISA-DOC");
const assetsRoot = join(isaRoot, "src", "lib", "features", "tickets", "assets");

function walkMmd(dir: string, out: string[] = []): string[] {
	for (const name of readdirSync(dir)) {
		const full = join(dir, name);
		if (statSync(full).isDirectory()) {
			if (name === "_meta" || name === "node_modules") continue;
			walkMmd(full, out);
			continue;
		}
		if (name.endsWith(".mmd")) out.push(full);
	}
	return out;
}

function ticketIdFromPath(filePath: string): string | undefined {
	const m = filePath.match(/(TK-\d+)/i);
	return m ? m[1].toUpperCase() : undefined;
}

await ensureAllStoreSchemas();
const files = walkMmd(assetsRoot);
let n = 0;
for (const abs of files) {
	const base = abs.replace(/\.mmd$/i, "");
	const pngName = `${base.split(/[/\\]/).pop()}.png`;
	const source = readFileSync(abs, "utf8");
	const ticketId = ticketIdFromPath(abs);
	const { record, reused } = await publishMermaidAsset({
		filename: pngName,
		source,
		ticketId,
	});
	console.log(`${reused ? "↺" : "✓"} ${pngName}${ticketId ? ` · ${ticketId}` : ""} → ${record.url}`);
	n++;
}
console.log(`\n[ok] ${n} diagramas mermaid en imgbb-asset`);
