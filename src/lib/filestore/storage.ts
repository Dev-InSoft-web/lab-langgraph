/**
 * Filestore: abstracción de almacenamiento de archivos con proveedor intercambiable.
 * Las rutas API (/api/files) y los nombres de env (FILESTORE_*) no mencionan al
 * proveedor; hoy la implementación es Cloudflare R2 vía REST, mañana puede ser otra.
 */
import { preloadIsaDocSecrets } from "../core/secrets.js";

export type FilestoreConfig = {
	provider: string;
	accountId: string;
	apiToken: string;
	bucket: string;
};

function env(...keys: string[]): string {
	for (const k of keys) {
		const v = process.env[k]?.trim();
		if (v) return v;
	}
	return "";
}

export function getFilestoreConfig(): FilestoreConfig {
	preloadIsaDocSecrets();
	const accountId = env("FILESTORE_ACCOUNT_ID");
	const apiToken = env("FILESTORE_API_TOKEN");
	if (!accountId || !apiToken) {
		throw new Error(
			"FILESTORE_ACCOUNT_ID / FILESTORE_API_TOKEN no configurados (lab-langgraph/local.settings.json)",
		);
	}
	return {
		provider: env("FILESTORE_PROVIDER") || "cloudflare-r2",
		accountId,
		apiToken,
		bucket: env("FILESTORE_BUCKET") || "lablang-files",
	};
}

export type StoredObject = {
	body: Buffer;
	contentType: string;
};

export interface FileStorage {
	/** Crea el contenedor remoto si no existe (idempotente). */
	ensureBucket(): Promise<void>;
	putObject(key: string, body: Buffer, contentType?: string): Promise<void>;
	getObject(key: string): Promise<StoredObject | null>;
	deleteObject(key: string): Promise<void>;
}

/** Cloudflare R2 vía API REST (sin SDK ni claves S3). */
class CloudflareR2Storage implements FileStorage {
	constructor(private readonly cfg: FilestoreConfig) {}

	private bucketsUrl(): string {
		return `https://api.cloudflare.com/client/v4/accounts/${this.cfg.accountId}/r2/buckets`;
	}

	private objectUrl(key: string): string {
		return `${this.bucketsUrl()}/${this.cfg.bucket}/objects/${encodeURIComponent(key)}`;
	}

	private headers(extra?: Record<string, string>): Record<string, string> {
		return { Authorization: `Bearer ${this.cfg.apiToken}`, ...extra };
	}

	async ensureBucket(): Promise<void> {
		const res = await fetch(this.bucketsUrl(), {
			method: "POST",
			headers: this.headers({ "Content-Type": "application/json" }),
			body: JSON.stringify({ name: this.cfg.bucket }),
		});
		// 200 creado; 400/409 ya existe; cualquier otro es error real (p. ej. 403 sin permisos R2)
		if (!res.ok && res.status !== 400 && res.status !== 409) {
			throw new Error(`filestore ensureBucket: HTTP ${res.status} ${await res.text()}`);
		}
	}

	async putObject(key: string, body: Buffer, contentType?: string): Promise<void> {
		const res = await fetch(this.objectUrl(key), {
			method: "PUT",
			headers: this.headers({ "Content-Type": contentType || "application/octet-stream" }),
			body: new Uint8Array(body),
		});
		if (!res.ok) {
			throw new Error(`filestore putObject: HTTP ${res.status} ${await res.text()}`);
		}
	}

	async getObject(key: string): Promise<StoredObject | null> {
		const res = await fetch(this.objectUrl(key), { headers: this.headers() });
		if (res.status === 404) return null;
		if (!res.ok) {
			throw new Error(`filestore getObject: HTTP ${res.status} ${await res.text()}`);
		}
		return {
			body: Buffer.from(await res.arrayBuffer()),
			contentType: res.headers.get("content-type") || "application/octet-stream",
		};
	}

	async deleteObject(key: string): Promise<void> {
		const res = await fetch(this.objectUrl(key), { method: "DELETE", headers: this.headers() });
		if (!res.ok && res.status !== 404) {
			throw new Error(`filestore deleteObject: HTTP ${res.status} ${await res.text()}`);
		}
	}
}

let storage: FileStorage | null = null;

export function getFileStorage(): FileStorage {
	if (storage) return storage;
	const cfg = getFilestoreConfig();
	switch (cfg.provider) {
		case "cloudflare-r2":
			storage = new CloudflareR2Storage(cfg);
			return storage;
		default:
			throw new Error(`FILESTORE_PROVIDER no soportado: ${cfg.provider}`);
	}
}
