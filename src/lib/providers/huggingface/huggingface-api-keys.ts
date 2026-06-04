import { preloadIsaDocSecrets } from "../../core/secrets.js";
import { keySuffix } from "../groq/groq-api-keys.js";

export type HuggingFaceKeyEntry = { label: string; key: string };

export function loadHuggingFaceApiKeysFromEnv(): HuggingFaceKeyEntry[] {
	preloadIsaDocSecrets();
	const entries: HuggingFaceKeyEntry[] = [];
	const add = (raw: string | undefined, label: string) => {
		const k = raw?.trim();
		if (k && !entries.some((e) => e.key === k)) entries.push({ label, key: k });
	};
	add(process.env.HUGGINGFACE_API_KEY, "HUGGINGFACE_API_KEY");
	add(process.env.HUGGINGFACE_API_KEY_2, "HUGGINGFACE_API_KEY_2");
	add(process.env.paty_huggingface_api_key, "paty_huggingface_api_key");
	return entries;
}

export function huggingFaceKeyDisplay(entry: HuggingFaceKeyEntry, index: number, total: number): string {
	return `${index + 1}/${total} · ${entry.label} · ${keySuffix(entry.key)}`;
}
