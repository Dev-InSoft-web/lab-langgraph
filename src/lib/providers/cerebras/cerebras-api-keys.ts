import { preloadIsaDocSecrets } from "../../core/secrets.js";
import { keySuffix } from "../groq/groq-api-keys.js";

export type CerebrasKeyEntry = { label: string; key: string };

let poolSingleton: CerebrasKeyPool | null = null;

export function loadCerebrasApiKeysFromEnv(): CerebrasKeyEntry[] {
	preloadIsaDocSecrets();
	const entries: CerebrasKeyEntry[] = [];
	const add = (raw: string | undefined, label: string) => {
		const k = raw?.trim();
		if (k && !entries.some((e) => e.key === k)) entries.push({ label, key: k });
	};
	add(process.env.CEREBRAS_API_KEY, "CEREBRAS_API_KEY");
	add(process.env.CEREBRAS_API_KEY_2, "CEREBRAS_API_KEY_2");
	const multi = process.env.CEREBRAS_API_KEYS?.trim();
	if (multi) {
		let i = 0;
		for (const part of multi.split(/[,;\n]+/)) {
			i += 1;
			const k = part.trim();
			if (k && !entries.some((e) => e.key === k)) {
				entries.push({ label: `CEREBRAS_API_KEYS[${i}]`, key: k });
			}
		}
	}
	return entries;
}

export function getCerebrasKeyPool(): CerebrasKeyPool {
	if (!poolSingleton) {
		const entries = loadCerebrasApiKeysFromEnv();
		if (!entries.length) {
			throw new Error("Falta CEREBRAS_API_KEY en secrets/patyia/lab-langgraph.env");
		}
		poolSingleton = new CerebrasKeyPool(entries);
	}
	return poolSingleton;
}

export function resetCerebrasKeyPool(): void {
	poolSingleton = null;
}

export class CerebrasKeyPool {
	private index = 0;

	constructor(readonly entries: CerebrasKeyEntry[]) {
		if (!entries.length) throw new Error("CerebrasKeyPool requiere al menos una API key");
	}

	get size(): number {
		return this.entries.length;
	}

	get currentIndex(): number {
		return this.index;
	}

	get currentKey(): string {
		return this.entries[this.index]!.key;
	}

	currentKeyDisplay(): string {
		const e = this.entries[this.index]!;
		return `${this.index + 1}/${this.entries.length} · ${e.label} · ${keySuffix(e.key)}`;
	}

	rotateOn429(): boolean {
		if (this.index >= this.entries.length - 1) return false;
		this.index += 1;
		console.log(`  Cerebras · cambio a API key ${this.currentKeyDisplay()}`);
		return true;
	}

	resetToFirst(): void {
		if (this.index === 0) return;
		this.index = 0;
		console.log(`  Cerebras · reinicio de API keys → ${this.currentKeyDisplay()}`);
	}

	rotateForRetry(): void {
		if (this.entries.length <= 1) return;
		this.index = (this.index + 1) % this.entries.length;
	}
}
