import { preloadIsaDocSecrets } from "../../core/secrets.js";
import { keySuffix } from "../groq/groq-api-keys.js";

export type GeminiKeyEntry = { label: string; key: string };

export { keySuffix };

export function loadGeminiApiKeysFromEnv(): GeminiKeyEntry[] {
	preloadIsaDocSecrets();
	const entries: GeminiKeyEntry[] = [];
	const add = (raw: string | undefined, label: string) => {
		const k = raw?.trim();
		if (k && !entries.some((e) => e.key === k)) entries.push({ label, key: k });
	};
	add(process.env.GEMINI_API_KEY, "GEMINI_API_KEY");
	add(process.env.GEMINI_API_KEY_2, "GEMINI_API_KEY_2");
	add(process.env.GOOGLE_API_KEY, "GOOGLE_API_KEY");
	add(process.env.GOOGLE_API_KEY_2, "GOOGLE_API_KEY_2");
	const multi = process.env.GEMINI_API_KEYS?.trim();
	if (multi) {
		let i = 0;
		for (const part of multi.split(/[,;\n]+/)) {
			i += 1;
			const k = part.trim();
			if (k && !entries.some((e) => e.key === k)) {
				entries.push({ label: `GEMINI_API_KEYS[${i}]`, key: k });
			}
		}
	}
	return entries;
}

export function geminiKeyDisplay(entry: GeminiKeyEntry, index: number, total: number): string {
	return `${index + 1}/${total} · ${entry.label} · ${keySuffix(entry.key)}`;
}
