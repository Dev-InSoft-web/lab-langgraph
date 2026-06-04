import { Document } from "@langchain/core/documents";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getRagPgPool } from "../db/pg.js";
import {
	EMBEDDING_DIMENSIONS,
	EMBEDDING_MODEL,
	PG_SCHEMA_RAG,
	getRagVectorTableName,
} from "../core/lab-constants.js";
import { getHuggingFaceApiKey, getPgCollection, getRagProfile } from "../core/config.js";
import { ensureRagSchema } from "./ensureSchema.js";

const splitter = new RecursiveCharacterTextSplitter({
	chunkSize: 1000,
	chunkOverlap: 100,
	separators: ["\n\n", "\n", ". ", " ", ""],
});

function qualifiedTable(table: string): string {
	return `"${PG_SCHEMA_RAG}"."${table}"`;
}

function getEmbeddings(): HuggingFaceInferenceEmbeddings {
	return new HuggingFaceInferenceEmbeddings({
		apiKey: getHuggingFaceApiKey(),
		model: EMBEDDING_MODEL,
	});
}

/** Asegura DDL en BD RAG (`bd_rag.rag_vec_*`). */
export async function ensureVectorTable(profile?: "contapyme" | "fitdocs"): Promise<void> {
	await ensureRagSchema();
}

export async function ensureVectorInfrastructure(): Promise<PGVectorStore> {
	await ensureVectorTable();
	return getVectorStore(true);
}

export async function getVectorStore(skipInitCheck = false): Promise<PGVectorStore> {
	const tableName = getPgCollection();
	const store = await PGVectorStore.initialize(getEmbeddings(), {
		pool: getRagPgPool(),
		schemaName: PG_SCHEMA_RAG,
		tableName,
		dimensions: EMBEDDING_DIMENSIONS,
		skipInitializationCheck: skipInitCheck,
		columns: {
			idColumnName: "id",
			vectorColumnName: "embedding",
			contentColumnName: "content",
			metadataColumnName: "metadata",
		},
	});
	return store;
}

export async function ensurePgVectorExtension(): Promise<void> {
	await ensureRagSchema();
}

export async function indexDocuments(docs: Document[]): Promise<{ chunks: number; files: string[] }> {
	await ensurePgVectorExtension();
	const chunks = await splitter.splitDocuments(docs);
	if (chunks.length === 0) {
		return { chunks: 0, files: [] };
	}

	const files: string[] = [
		...new Set(chunks.map((c: Document) => String(c.metadata?.source ?? "desconocido"))),
	];
	const store = await ensureVectorInfrastructure();
	await store.addDocuments(chunks);
	return { chunks: chunks.length, files };
}

const YOUTUBE_MAX_SEGMENT_CHARS = 1400;

export async function indexYoutubeDocuments(docs: Document[]): Promise<{ chunks: number; files: string[] }> {
	await ensurePgVectorExtension();
	if (docs.length === 0) return { chunks: 0, files: [] };

	const toIndex: Document[] = [];
	for (const doc of docs) {
		if (doc.pageContent.length <= YOUTUBE_MAX_SEGMENT_CHARS) {
			toIndex.push(doc);
			continue;
		}
		const parts = await splitter.splitDocuments([doc]);
		for (const part of parts) {
			toIndex.push({
				...part,
				metadata: { ...doc.metadata, ...part.metadata },
			});
		}
	}

	const files: string[] = [
		...new Set(toIndex.map((c) => String(c.metadata?.source ?? "desconocido"))),
	];
	const store = await ensureVectorInfrastructure();
	await store.addDocuments(toIndex);
	return { chunks: toIndex.length, files };
}

export async function indexWebDocuments(docs: Document[]): Promise<{ chunks: number; files: string[] }> {
	return indexYoutubeDocuments(docs);
}

export async function clearVectorStore(): Promise<void> {
	const profile = getRagProfile();
	const table = getRagVectorTableName(profile);
	await ensureRagSchema();
	await getRagPgPool().query(`TRUNCATE TABLE ${qualifiedTable(table)}`);
}

export async function listIndexedSources(): Promise<string[]> {
	const table = getPgCollection();
	await ensureRagSchema();
	try {
		const res = await getRagPgPool().query(
			`SELECT DISTINCT metadata->>'source' AS source FROM ${qualifiedTable(table)} WHERE metadata->>'source' IS NOT NULL ORDER BY 1`,
		);
		return res.rows.map((r: { source: string }) => r.source).filter(Boolean);
	} catch {
		return [];
	}
}
