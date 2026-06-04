import { preloadIsaDocSecrets } from "../../core/secrets.js";

/** Espera tras agotar todas las keys Groq (429) antes de reintentar. */
export const GROQ_RATE_LIMIT_WAIT_MS = Number(process.env.GROQ_RATE_LIMIT_WAIT_MS?.trim()) || 60_000;

export type GroqKeyEntry = { label: string; key: string };

let poolSingleton: GroqKeyPool | null = null;

export function keySuffix(key: string): string {
	return key.length >= 4 ? `···${key.slice(-4)}` : "···";
}

export function loadGroqApiKeysFromEnv(): GroqKeyEntry[] {
	preloadIsaDocSecrets();
	const entries: GroqKeyEntry[] = [];
	const add = (raw: string | undefined, label: string) => {
		const k = raw?.trim();
		if (k && !entries.some((e) => e.key === k)) entries.push({ label, key: k });
	};
	add(process.env.GROQ_API_KEY, "GROQ_API_KEY");
	add(process.env.GROQ_API_KEY_2, "GROQ_API_KEY_2");
	add(process.env.paty_groq_api_key, "paty_groq_api_key");
	const multi = process.env.GROQ_API_KEYS?.trim();
	if (multi) {
		let i = 0;
		for (const part of multi.split(/[,;\n]+/)) {
			i += 1;
			const k = part.trim();
			if (k && !entries.some((e) => e.key === k)) {
				entries.push({ label: `GROQ_API_KEYS[${i}]`, key: k });
			}
		}
	}
	return entries;
}

export function getGroqKeyPool(): GroqKeyPool {
	if (!poolSingleton) {
		const entries = loadGroqApiKeysFromEnv();
		if (!entries.length) {
			throw new Error("Falta GROQ_API_KEY en secrets/patyia/lab-langgraph.env");
		}
		poolSingleton = new GroqKeyPool(entries);
	}
	return poolSingleton;
}

export function resetGroqKeyPool(): void {
	poolSingleton = null;
}

export function isGroqRateLimitError(msg: string): boolean {
	return /429|rate_limit|rate limit|quota/i.test(msg);
}

export class GroqKeyPool {
	private index = 0;

	constructor(readonly entries: GroqKeyEntry[]) {
		if (!entries.length) throw new Error("GroqKeyPool requiere al menos una API key");
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

	rotate(): void {
		this.index = (this.index + 1) % this.entries.length;
	}

	rotateOn429(): boolean {
		if (this.index >= this.entries.length - 1) return false;
		this.index += 1;
		console.log(`  Groq · cambio a API key ${this.currentKeyDisplay()}`);
		return true;
	}

	resetToFirst(): void {
		if (this.index === 0) return;
		this.index = 0;
		console.log(`  Groq · reinicio de API keys → ${this.currentKeyDisplay()}`);
	}

	/** Alterna key en reintento (1/2 ↔ 2/2). */
	rotateForRetry(): void {
		if (this.entries.length <= 1) return;
		this.rotate();
		console.log(`  Groq · siguiente key en reintento → ${this.currentKeyDisplay()}`);
	}
}
