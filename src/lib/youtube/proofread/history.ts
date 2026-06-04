import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import type { CostUsd, ProofreadApi, TokenUsage } from "./pricing.js";

export type BatchAttemptLog = {
	batch: string;
	api: ProofreadApi;
	model: string;
	ok: boolean;
	error?: string;
	tokens?: TokenUsage;
	costUsd?: CostUsd;
	durationMs?: number;
};

export type ProofreadRunLog = {
	at: string;
	videoId: string;
	sourceFile: string;
	outputFile: string;
	segmentCount: number;
	segmentsChanged: number;
	provider: ProofreadApi;
	model: string;
	api: ProofreadApi;
	batches: number;
	tokens: TokenUsage;
	costUsd: CostUsd;
	attempts: BatchAttemptLog[];
	durationMs: number;
	skipped?: boolean;
	note?: string;
};

export type ProofreadHistoryFile = {
	updatedAt: string;
	runs: ProofreadRunLog[];
};

const HISTORY_NAME = "proofread-history.json";

export function resolveProofreadHistoryPath(videosDir: string): string {
	return join(dirname(videosDir), HISTORY_NAME);
}

export async function appendProofreadHistory(
	videosDir: string,
	entry: ProofreadRunLog,
): Promise<string> {
	const path = resolveProofreadHistoryPath(videosDir);
	let file: ProofreadHistoryFile = { updatedAt: new Date().toISOString(), runs: [] };
	if (existsSync(path)) {
		try {
			file = JSON.parse(await readFile(path, "utf8")) as ProofreadHistoryFile;
			if (!Array.isArray(file.runs)) file.runs = [];
		} catch {
			file = { updatedAt: new Date().toISOString(), runs: [] };
		}
	}
	file.runs.push(entry);
	file.updatedAt = new Date().toISOString();
	await writeFile(path, `${JSON.stringify(file, null, 2)}\n`, "utf8");
	return path;
}
