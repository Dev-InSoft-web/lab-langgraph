import { preloadIsaDocSecrets } from "../../core/secrets.js";
import { keySuffix } from "../groq/groq-api-keys.js";

export type DeepSeekKeyEntry = { label: string; key: string };

export function loadDeepSeekApiKeysFromEnv(): DeepSeekKeyEntry[] {
	preloadIsaDocSecrets();
	const entries: DeepSeekKeyEntry[] = [];
	const add = (raw: string | undefined, label: string) => {
		const k = raw?.trim();
		if (k && !entries.some((e) => e.key === k)) entries.push({ label, key: k });
	};
	add(process.env.DEEPSEEK_API_KEY, "DEEPSEEK_API_KEY");
	add(process.env.DEEPSEEK_API_KEY_2, "DEEPSEEK_API_KEY_2");
	return entries;
}

export function deepSeekKeyDisplay(entry: DeepSeekKeyEntry, index: number, total: number): string {
	return `${index + 1}/${total} · ${entry.label} · ${keySuffix(entry.key)}`;
}
