/**
 * Sincroniza Values de local.settings.json a Azure Function App.
 *   npx tsx scripts/azure/sync-app-settings.mts
 *   npx tsx scripts/azure/sync-app-settings.mts --dry-run
 */
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(import.meta.url), "..", "..", "..");
const localPath = join(root, "local.settings.json");
const dryRun = process.argv.includes("--dry-run");
const app = process.env.AZURE_FUNCTIONAPP_NAME ?? "rag-lab";
const rg = process.env.AZURE_RESOURCE_GROUP ?? "rg-lab-langgraph";

const skip = new Set([
	"AzureWebJobsStorage",
	"FUNCTIONS_WORKER_RUNTIME",
	"DEPLOYMENT_STORAGE_CONNECTION_STRING",
]);

const raw = JSON.parse(readFileSync(localPath, "utf8")) as { Values?: Record<string, string> };
const values = raw.Values ?? {};
const settings: Record<string, string> = {};
for (const [k, v] of Object.entries(values)) {
	if (skip.has(k)) continue;
	if (typeof v === "string" && v.trim()) settings[k] = v.trim();
}

if (!settings.LAB_JWT_SECRET) {
	console.warn("WARN: LAB_JWT_SECRET no esta en local.settings.json; auth/token fallara hasta configurarlo.");
}

console.log(`Settings para ${app}: ${Object.keys(settings).length} claves`);
for (const k of Object.keys(settings).sort()) console.log(`  ${k}`);

if (dryRun) process.exit(0);

const tmp = join(root, ".azure-settings-sync.json");
writeFileSync(tmp, JSON.stringify(settings));
try {
	const az =
		process.platform === "win32"
			? `"${process.env.ProgramFiles}\\Microsoft SDKs\\Azure\\CLI2\\wbin\\az.cmd"`
			: "az";
	execSync(
		`${az} functionapp config appsettings set --name ${app} --resource-group ${rg} --settings @${tmp} -o none`,
		{ stdio: "inherit", shell: true },
	);
	console.log(`[ok] App settings en ${app}`);
} finally {
	try {
		unlinkSync(tmp);
	} catch {
		/* ignore */
	}
}
