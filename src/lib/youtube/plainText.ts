import type { CaptionSegment } from "./types.js";

export function segmentsToRagPlainText(segments: CaptionSegment[]): string {
	return segments
		.map((s) => s.text.replace(/\r/g, "").trim())
		.filter(Boolean)
		.join("\n");
}

export function buildTranscriptPlainText(description: string, segments: CaptionSegment[]): string {
	const body = segmentsToRagPlainText(segments);
	const desc = description?.trim();
	if (!desc) return body;
	return `${desc}\n\n---\n\n${body}`;
}
