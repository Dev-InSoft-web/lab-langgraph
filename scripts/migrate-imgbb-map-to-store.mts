/**
 * Migra imgbb-map.json (ISA-DOC o data/) → entidad PG isa-doc/tickets/imgbb-asset.
 *
 * Uso:
 *   npx tsx scripts/migrate-imgbb-map-to-store.mts
 *   npx tsx scripts/migrate-imgbb-map-to-store.mts --map ../ISA-DOC/src/lib/features/tickets/assets/_meta/imgbb-map.json
 */
import { resolve } from "node:path";
import { seedImgbbFromMap } from "../src/lib/ispgen/sync-from-files.js";

const arg = process.argv.find((a) => a.startsWith("--map="));
const mapPath = arg
	? resolve(arg.slice("--map=".length))
	: undefined;

const n = await seedImgbbFromMap(mapPath);
console.log(`✓ ${n} filas imgbb-asset en PG`);
