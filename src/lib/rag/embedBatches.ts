import type { Document } from "@langchain/core/documents";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import type { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { EMBEDDING_MODEL } from "../core/lab-constants.js";
import { getHuggingFaceApiKey } from "../core/config.js";
import { loadHuggingFaceApiKeysFromEnv } from "../providers/huggingface/huggingface-api-keys.js";

export const YOUTUBE_MERGE_MAX_CHARS = 1400;

export type IndexBatchOptions = {
	batchSize?: number;
	batchDelayMs?: number;
	mergeYoutubeSegments?: boolean;
	skipSources?: Set<string>;
	onBatch?: (info: { batch: number; batches: number; indexed: number; total: number }) => void;
};

export function readIndexBatchOptionsFromEnv(): {
	batchSize: number;
	batchDelayMs: number;
	mergeYoutubeSegments: boolean;
} {
	const batchSize = Number(process.env.RAG_EMBED_BATCH_SIZE ?? 32);
	const batchDelayMs = Number(process.env.RAG_EMBED_BATCH_DELAY_MS ?? 1500);
	return {
		batchSize: Number.isFinite(batchSize) && batchSize > 0 ? batchSize : 32,
		batchDelayMs: Number.isFinite(batchDelayMs) && batchDelayMs >= 0 ? batchDelayMs : 1500,
		mergeYoutubeSegments: process.env.RAG_MERGE_YT_SEGMENTS !== "0",
	};
}

function sleep(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, ms));
}

function isRateLimitError(err: unknown): boolean {
	const msg = err instanceof Error ? err.message : String(err);
	return /429|rate.?limit|quota|too many|capacity|overloaded/i.test(msg);
}

function hfKeys(): string[] {
	const fromEnv = loadHuggingFaceApiKeysFromEnv().map((e) => e.key);
	if (fromEnv.length) return fromEnv;
	return [getHuggingFaceApiKey()];
}

function embeddingsForKey(apiKey: string): HuggingFaceInferenceEmbeddings {
	return new HuggingFaceInferenceEmbeddings({
		apiKey,
		model: EMBEDDING_MODEL,
	});
}

export function mergeAdjacentYoutubeSegments(docs: Document[]): Document[] {
	const bySource = new Map<string, Document[]>();
	for (const doc of docs) {
		const src = String(doc.metadata?.source ?? doc.metadata?.videoId ?? "");
		const bucket = bySource.get(src) ?? [];
		bucket.push(doc);
		bySource.set(src, bucket);
	}

	const merged: Document[] = [];
	for (const group of bySource.values()) {
		group.sort(
			(a, b) =>
				Number(a.metadata?.startMs ?? 0) - Number(b.metadata?.startMs ?? 0) ||
				Number(a.metadata?.segmentIndex ?? 0) - Number(b.metadata?.segmentIndex ?? 0),
		);
		let current: Document | null = null;
		for (const doc of group) {
			if (!current) {
				current = { pageContent: doc.pageContent, metadata: { ...doc.metadata } };
				continue;
			}
			const combined: string = `${current.pageContent}\n${doc.pageContent}`;
			if (combined.length <= YOUTUBE_MERGE_MAX_CHARS) {
				current = {
					pageContent: combined,
					metadata: {
						...current.metadata,
						mergedThroughIndex: doc.metadata?.segmentIndex,
						mergedThroughMs: doc.metadata?.startMs,
					},
				};
			} else {
				merged.push(current);
				current = { pageContent: doc.pageContent, metadata: { ...doc.metadata } };
			}
		}
		if (current) merged.push(current);
	}
	return merged;
}

function prepareDocuments(docs: Document[], opts?: IndexBatchOptions): Document[] {
	let out = docs;
	if (opts?.skipSources?.size) {
		out = out.filter((d) => !opts.skipSources!.has(String(d.metadata?.source ?? "")));
	}
	if (opts?.mergeYoutubeSegments) {
		out = mergeAdjacentYoutubeSegments(out);
	}
	return out;
}

export async function addDocumentsInBatches(
	store: PGVectorStore,
	docs: Document[],
	opts?: IndexBatchOptions,
): Promise<{ chunks: number; files: string[]; skipped: number }> {
	const envOpts = readIndexBatchOptionsFromEnv();
	const batchSize = opts?.batchSize ?? envOpts.batchSize;
	const batchDelayMs = opts?.batchDelayMs ?? envOpts.batchDelayMs;
	const mergeYoutube = opts?.mergeYoutubeSegments ?? envOpts.mergeYoutubeSegments;

	const prepared = prepareDocuments(docs, {
		...opts,
		mergeYoutubeSegments: mergeYoutube,
	});
	const skipped = docs.length - prepared.length;
	if (!prepared.length) return { chunks: 0, files: [], skipped };

	const keys = hfKeys();
	let keyIdx = 0;
	const files = new Set<string>();
	let indexed = 0;
	const batches = Math.ceil(prepared.length / batchSize);

	for (let b = 0; b < batches; b += 1) {
		const batch = prepared.slice(b * batchSize, (b + 1) * batchSize);
		let done = false;
		for (let attempt = 0; attempt < 24 && !done; attempt += 1) {
			const apiKey = keys[keyIdx % keys.length]!;
			try {
				const embeddings = embeddingsForKey(apiKey);
				const vectors = await embeddings.embedDocuments(batch.map((d) => d.pageContent));
				await store.addVectors(vectors, batch);
				for (const doc of batch) {
					files.add(String(doc.metadata?.source ?? "desconocido"));
				}
				indexed += batch.length;
				opts?.onBatch?.({ batch: b + 1, batches, indexed, total: prepared.length });
				done = true;
			} catch (err) {
				if (!isRateLimitError(err)) throw err;
				keyIdx += 1;
				const wait = Math.min(2000 + attempt * 2500, 120_000);
				console.warn(
					`HF rate limit · lote ${b + 1}/${batches} · key ${(keyIdx % keys.length) + 1}/${keys.length} · espera ${Math.round(wait / 1000)}s`,
				);
				await sleep(wait);
			}
		}
		if (!done) throw new Error(`Rate limit HF: lote ${b + 1}/${batches} sin completar`);
		if (batchDelayMs > 0 && b + 1 < batches) await sleep(batchDelayMs);
	}

	return { chunks: indexed, files: [...files], skipped };
}
