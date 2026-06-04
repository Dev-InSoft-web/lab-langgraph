import type { Document } from "@langchain/core/documents";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createChatLlm } from "../llm/chat-llm.js";
import { buildMediaUrl, getImagesForSourcePage } from "../media/store.js";
import { getSystemPrompt, PROMPT } from "./prompts.js";
import { documentWatchUrl } from "./youtubeChunks.js";
import { parseYoutubeSource, sourceLabel } from "./youtube.js";
import type { AskFilters, RagCorpus, RagTipo } from "./metadata.js";
import { buildMetadataFilter } from "./metadata.js";
import { ensureVectorInfrastructure } from "./vectorstore.js";

export type { AskFilters };

export type SourceFragment = {
	index: number;
	source: string;
	page: string;
	content: string;
	/** Enlace directo (YouTube, página oficial, PDF). */
	url?: string;
	title?: string;
	corpus?: RagCorpus;
	tipo?: RagTipo;
	kind?: "youtube" | "pdf" | "web" | "normativa";
	images: { id: string; url: string; width: number; height: number }[];
};

export function formatContext(chunks: Document[]): string {
	return chunks
		.map((chunk, i) => {
			const source = String(chunk.metadata?.source ?? "desconocido");
			const page = String(chunk.metadata?.page ?? "?");
			const title = String(chunk.metadata?.title ?? "");
			const yt = parseYoutubeSource(source);
			const corpus = chunk.metadata?.corpus ? String(chunk.metadata.corpus) : "";
			const corpusTag = corpus ? ` · ${corpus}` : "";
			const loc = yt
				? sourceLabel(source, page, title)
				: `${source} · ${page}${corpusTag}`;
			const url = documentWatchUrl(chunk);
			const urlHint = url ? ` · ${url}` : "";
			return `[Fragmento ${i + 1} · ${loc}${urlHint}]\n${chunk.pageContent}`;
		})
		.join("\n\n");
}

export async function chunksToSources(chunks: Document[], apiBase: string): Promise<SourceFragment[]> {
	const out: SourceFragment[] = [];
	for (let i = 0; i < chunks.length; i++) {
		const chunk = chunks[i];
		const source = String(chunk.metadata?.source ?? "desconocido");
		const page = String(chunk.metadata?.page ?? "?");
		const title = chunk.metadata?.title ? String(chunk.metadata.title) : undefined;
		const yt = parseYoutubeSource(source);
		const tipo = (chunk.metadata?.tipo as RagTipo | undefined) ?? (yt ? "youtube" : "pdf");
		const media = yt || tipo === "web" || tipo === "normativa" ? [] : await getImagesForSourcePage(source, page);
		out.push({
			index: i + 1,
			source,
			page,
			title,
			corpus: chunk.metadata?.corpus as RagCorpus | undefined,
			tipo,
			kind: tipo === "youtube" ? "youtube" : tipo === "pdf" ? "pdf" : tipo,
			url: documentWatchUrl(chunk),
			content: chunk.pageContent.slice(0, 2000),
			images: media.map((m) => ({
				id: m.id,
				url: buildMediaUrl(apiBase, m.id),
				width: m.width,
				height: m.height,
			})),
		});
	}
	return out;
}

export async function ask(
	question: string,
	k = 4,
	filters?: AskFilters,
): Promise<{ answer: string; chunks: Document[] }> {
	const store = await ensureVectorInfrastructure();
	const metaFilter = buildMetadataFilter(filters);
	const chunks = metaFilter
		? await store.similaritySearch(question, k, metaFilter as Record<string, unknown>)
		: await store.asRetriever({ k }).invoke(question);

	const llm = createChatLlm({ temperature: 0 });
	const chain = PROMPT.pipe(llm).pipe(new StringOutputParser());
	const answer = String(
		await chain.invoke({
			system: getSystemPrompt(),
			context: formatContext(chunks),
			question,
		}),
	);

	return { answer, chunks };
}
