/**
 * Sincroniza roles/allow/usuario→rol desde lab-permissions.json hacia PostgreSQL.
 * El runtime lee permisos solo de BD (AUTH_ROLE, AUTH_ROLEALLOW, AUTH_USER.ROLECODE).
 *
 *   npm run auth:seed-permissions
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import { preloadIsaDocSecrets } from "../src/lib/core/secrets.js";
import { syncPermissionsFromDoc, type PermissionDoc } from "../src/lib/auth/permissions.js";

preloadIsaDocSecrets();

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const jsonPath = join(root, "src/lib/auth/lab-permissions.json");
const doc = JSON.parse(readFileSync(jsonPath, "utf8")) as PermissionDoc;

await syncPermissionsFromDoc(doc);
console.log("Permisos sincronizados en BD_LANGLAB (AUTH_ROLE, AUTH_ROLEALLOW, AUTH_USER.ROLECODE)");
for (const [u, def] of Object.entries(doc.users)) {
	console.log(`  ${u.toUpperCase()} → ${def.role}`);
}
for (const [u, exceptions] of Object.entries(doc.user_exceptions ?? {})) {
	for (const ex of exceptions) {
		console.log(`  excepción ${u.toUpperCase()}: ${ex.allow}${ex.sql_scope ? ` [${ex.sql_scope}]` : ""}`);
	}
}
