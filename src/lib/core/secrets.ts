import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadDotenv } from "dotenv";
import { resolveLabRepoRoot } from "./data-paths.js";

let loaded = false;

/** Carga `Values` de Azure Functions local.settings.json (misma fuente que `func start`). */
function loadLocalSettingsJson(root: string): void {
	const path = resolve(root, "local.settings.json");
	if (!existsSync(path)) return;
	try {
		const raw = JSON.parse(readFileSync(path, "utf8")) as {
			Values?: Record<string, string>;
		};
		const values = raw.Values;
		if (!values || typeof values !== "object") return;
		for (const [key, value] of Object.entries(values)) {
			if (typeof value === "string" && value.trim()) {
				process.env[key] = value;
			}
		}
	} catch {
		/* ignore parse errors */
	}
}

/** @deprecated Use resolveLabRepoRoot — ISA-DOC ya no es dependencia de runtime. */
export function resolveIsaDocRoot(): string {
	return resolveLabRepoRoot();
}

/** Secretos y conexiones solo en lab-langgraph (local.settings.json + secrets/). */
export function preloadLabSecrets(): void {
	if (loaded) return;
	loaded = true;
	const root = resolveLabRepoRoot();
	const files = [
		resolve(root, ".env"),
		resolve(root, "secrets", "api-keys.env"),
		resolve(root, "secrets", "patyia", "lab-langgraph.env"),
		resolve(root, "secrets", "patyia", "lab-connections.env"),
		resolve(root, "secrets", "patyia", "lab-databases.env"),
		resolve(root, "secrets", "tokens", "token.patyia.json"),
		resolve(root, "secrets", "tokens", "token.clientesis.json"),
	];
	for (const path of files) {
		if (existsSync(path)) loadDotenv({ path, override: false });
	}
	// Prioridad explícita: local.settings.json (Render langlab / keys del host local)
	loadLocalSettingsJson(root);
}

/** Alias histórico. */
export const preloadIsaDocSecrets = preloadLabSecrets;
