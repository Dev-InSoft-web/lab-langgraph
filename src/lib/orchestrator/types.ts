/** Capacidad de laboratorio (qué tarea consume la key). */
export type LabCapability = "whisper" | "chat" | "proofread" | "embeddings" | "rerank";

export type LabProvider =
	| "groq"
	| "cerebras"
	| "gemini"
	| "minimax"
	| "huggingface"
	| "openrouter"
	| "cohere"
	| "deepseek";

export type LabApiKeySlotRow = {
	provider: string;
	capability: string;
	key_label: string;
	sort_order: number;
	enabled: boolean;
	cooldown_until: Date | null;
	last_used_at: Date | null;
	last_http_status: number | null;
	last_error: string | null;
	wait_ms_hint: number | null;
	consecutive_failures: number;
	meta: Record<string, unknown>;
	updated_at: Date;
};

export type OrchestratorLease = {
	leaseId: string;
	provider: LabProvider;
	capability: LabCapability;
	keyLabel: string;
	keySuffix: string;
};

export type ReleaseLeaseInput = {
	leaseId: string;
	ok: boolean;
	errorMessage?: string;
	httpStatus?: number;
	headers?: Record<string, string>;
};

export type LeaseAcquireResult =
	| { ok: true; lease: OrchestratorLease }
	| { ok: false; waitMs: number; reason: string; slots?: LabApiKeySlotRow[] };
