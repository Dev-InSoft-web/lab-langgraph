/**
 * Genera lab-langgraph/data/api-catalog.json desde Postman (ISA-DOC o data/postman local).
 *
 *   npm run catalog:build
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { buildApiCatalogManifest } from "../src/lib/integrations/postman/build-manifest.js";
import { getPostmanImportRoot } from "../src/lib/integrations/postman/paths.js";
import { resolveLabDataRoot } from "../src/lib/core/lab-data-paths.js";

const postmanRoot = getPostmanImportRoot();
const manifest = buildApiCatalogManifest(postmanRoot, `lab-data:${resolveLabDataRoot()}`);

const outPath = resolve(process.cwd(), "data", "api-catalog.json");
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(manifest, null, 2), "utf8");

const counts = Object.entries(manifest.projects).map(
	([k, p]) => `${k}: ${p.endpoints.length} endpoints, ${p.environments.length} envs`,
);
console.log(`[ok] ${outPath}`);
console.log(`     ${counts.join(" · ")}`);
