import { getPgPool } from "../db/pg.js";
import { Q_LAB_ORCHESTRATOR_ROTATION_LOG } from "../db/pg-identifiers.js";
import { ensurePatyiaSchema } from "../patyia/db/ensureSchema.js";
import type { LabCapability, LabProvider } from "./types.js";

export type RotationLogEvent =
	| "sync_slots"
	| "acquire_lease"
	| "release_ok"
	| "release_error"
	| "turn_lock"
	| "turn_unlock"
	| "turn_gap_wait";

export async function logOrchestratorRotation(input: {
	capability: LabCapability;
	provider: LabProvider;
	keyLabel: string;
	event: RotationLogEvent;
	leaseId?: string;
	iconversacion?: number;
	turnIndex?: number;
	waitMs?: number;
	meta?: Record<string, unknown>;
}): Promise<void> {
	await ensurePatyiaSchema();
	await getPgPool().query(
		`INSERT INTO ${Q_LAB_ORCHESTRATOR_ROTATION_LOG}
		 (capability, provider, keylabel, ilease, iconversacion, iturnindex, event, waitms, meta)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
		[
			input.capability,
			input.provider,
			input.keyLabel,
			input.leaseId ?? null,
			input.iconversacion ?? null,
			input.turnIndex ?? null,
			input.event,
			input.waitMs ?? null,
			JSON.stringify(input.meta ?? {}),
		],
	);
}
