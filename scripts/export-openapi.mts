/**
 * Escribe docs/openapi.json desde el spec TypeScript (misma fuente que /api/openapi.json).
 * npm run openapi:export
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildOpenApiDocument } from "../dist/src/lib/openapi/spec.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "docs", "openapi.json");
mkdirSync(dirname(out), { recursive: true });
const doc = buildOpenApiDocument("https://func-lab-langgraph.azurewebsites.net/api");
writeFileSync(out, JSON.stringify(doc, null, 2), "utf8");
console.log("Wrote", out);
