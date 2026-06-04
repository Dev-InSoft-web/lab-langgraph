import { readFile } from "node:fs/promises";
import type { Document } from "@langchain/core/documents";
import { inferYoutubeCorpus } from "./metadata.js";
import { buildYoutubeWatchUrl, formatTimestampMs } from "./youtube.js";
import {
	listAllVideoJsonRefs,
	resolveYoutubeCorpusBase,
	resolveYoutubeVideosDir,
} from "./youtubeCorpusPaths.js";

export { resolveYoutubeVideosDir, resolveYoutubeCorpusBase };

export type YoutubeCorpusJson = {
	videoId: string;
	videoUrl?: string;
	ytdlp?: { title?: string; description?: string };
	transcript?: {
		dedupeVersion?: number;
		segments?: Array<{ startMs?: number; durationMs?: number; text?: string }>;
	};
};

function buildSegmentContent(
	title: string,
	description: string | undefined,
	videoUrl: string,
	startMs: number,
	text: string,
	includeDescription: boolean,
): string {
	const ts = formatTimestampMs(startMs);
	const link = buildYoutubeWatchUrl(
		videoUrl.match(/v=([a-zA-Z0-9_-]{11})/)?.[1] ?? "",
		startMs,
	);
	const lines = [`Video: ${title}`];
	if (includeDescription && description?.trim()) {
		lines.push(`Descripción: ${description.trim().slice(0, 500)}`);
	}
	lines.push(`[${ts}] ${text}`, `Ver: ${link}`);
	return lines.join("\n");
}

export type LoadYoutubeStats = {
	documents: Document[];
	videos: number;
	segments: number;
	skippedNoSegments: number;
};

export async function loadYoutubeCorpusDocuments(videosDir?: string): Promise<LoadYoutubeStats> {
	const dir = videosDir ?? resolveYoutubeVideosDir();
	const refs = await listAllVideoJsonRefs(dir);
	const docs: Document[] = [];
	let videos = 0;
	let skippedNoSegments = 0;

	for (const ref of refs) {
		const raw = await readFile(ref.jsonPath, "utf8");
		const record = JSON.parse(raw) as YoutubeCorpusJson;
		const videoId = record.videoId ?? ref.videoId;
		const title = record.ytdlp?.title ?? videoId;
		const corpus = inferYoutubeCorpus(title);
		const videoUrl = record.videoUrl ?? `https://www.youtube.com/watch?v=${videoId}`;
		const description = record.ytdlp?.description;
		const segments = record.transcript?.segments ?? [];
		if (!segments.length) {
			skippedNoSegments += 1;
			continue;
		}
		videos += 1;

		for (let i = 0; i < segments.length; i += 1) {
			const seg = segments[i];
			const text = (seg.text ?? "").trim();
			if (!text) continue;
			const startMs = typeof seg.startMs === "number" ? seg.startMs : 0;
			const page = formatTimestampMs(startMs);

			docs.push({
				pageContent: buildSegmentContent(
					title,
					description,
					videoUrl,
					startMs,
					text,
					i === 0,
				),
				metadata: {
					source: `youtube:${videoId}`,
					page,
					corpus,
					tipo: "youtube",
					kind: "youtube",
					url: buildYoutubeWatchUrl(
						videoUrl.match(/v=([a-zA-Z0-9_-]{11})/)?.[1] ?? videoId,
						startMs,
					),
					videoId,
					startMs,
					videoUrl,
					title,
					segmentIndex: i,
				},
			});
		}
	}

	return { documents: docs, videos, segments: docs.length, skippedNoSegments };
}

export function documentWatchUrl(doc: Document): string | undefined {
	const url = doc.metadata?.url;
	if (typeof url === "string" && url.startsWith("http")) return url;
	const videoId = String(doc.metadata?.videoId ?? "");
	const startMs = doc.metadata?.startMs as number | undefined;
	if (videoId) return buildYoutubeWatchUrl(videoId, startMs);
	const src = String(doc.metadata?.source ?? "");
	const m = src.match(/^youtube:([a-zA-Z0-9_-]{11})$/);
	if (!m) return undefined;
	return buildYoutubeWatchUrl(m[1], startMs);
}
