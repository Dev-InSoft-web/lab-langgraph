import { preloadIsaDocSecrets } from "../../core/secrets.js";
import { keySuffix } from "../groq/groq-api-keys.js";

export type CohereKeyEntry = { label: string; key: string };

export function loadCohereApiKeysFromEnv(): CohereKeyEntry[] {
	preloadIsaDocSecrets();
	const entries: CohereKeyEntry[] = [];
	const add = (raw: string | undefined, label: string) => {
		const k = raw?.trim();
		if (k && !entries.some((e) => e.key === k)) entries.push({ label, key: k });
	};
	add(process.env.COHERE_API_KEY, "COHERE_API_KEY");
	add(process.env.COHERE_API_KEY_2, "COHERE_API_KEY_2");
	return entries;
}

export function cohereKeyDisplay(entry: CohereKeyEntry, index: number, total: number): string {
	return `${index + 1}/${total} · ${entry.label} · ${keySuffix(entry.key)}`;
}
