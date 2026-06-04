import { preloadIsaDocSecrets } from "../../core/secrets.js";
import { keySuffix } from "../groq/groq-api-keys.js";

export type OpenRouterKeyEntry = { label: string; key: string };

export function loadOpenRouterApiKeysFromEnv(): OpenRouterKeyEntry[] {
	preloadIsaDocSecrets();
	const entries: OpenRouterKeyEntry[] = [];
	const add = (raw: string | undefined, label: string) => {
		const k = raw?.trim();
		if (k && !entries.some((e) => e.key === k)) entries.push({ label, key: k });
	};
	add(process.env.OPENROUTER_API_KEY, "OPENROUTER_API_KEY");
	add(process.env.OPENROUTER_API_KEY_2, "OPENROUTER_API_KEY_2");
	const multi = process.env.OPENROUTER_API_KEYS?.trim();
	if (multi) {
		let i = 0;
		for (const part of multi.split(/[,;\n]+/)) {
			i += 1;
			const k = part.trim();
			if (k && !entries.some((e) => e.key === k)) {
				entries.push({ label: `OPENROUTER_API_KEYS[${i}]`, key: k });
			}
		}
	}
	return entries;
}

export function openRouterKeyDisplay(entry: OpenRouterKeyEntry, index: number, total: number): string {
	return `${index + 1}/${total} · ${entry.label} · ${keySuffix(entry.key)}`;
}
