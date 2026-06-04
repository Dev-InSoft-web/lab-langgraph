import type { CaptionSegment, VideoCorpusRecord } from "./types.js";

function formatTimestamp(ms: number | null): string {
	if (ms == null || !Number.isFinite(ms)) return "??:??:??.???";
	const h = Math.floor(ms / 3_600_000);
	const m = Math.floor((ms % 3_600_000) / 60_000);
	const s = Math.floor((ms % 60_000) / 1000);
	const frac = Math.floor(ms % 1000);
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(frac).padStart(3, "0")}`;
}

export function segmentsToTimestampedLines(segments: CaptionSegment[]): string {
	return segments
		.map((seg) => {
			const line = seg.text.replace(/\r/g, "").trim();
			if (!line) return "";
			return `[${formatTimestamp(seg.startMs)}] ${line}`;
		})
		.filter(Boolean)
		.join("\n");
}

/** Markdown por video (alineado con ISA-DOC; secciones esenciales). */
export function videoCorpusMarkdown(record: VideoCorpusRecord): string {
	const y = record.ytdlp;
	const title = y.title ?? record.videoId;
	const tags = (y.tags ?? []).join(", ") || "—";

	const lines = [
		"---",
		`schemaVersion: ${record.schemaVersion}`,
		`videoId: ${record.videoId}`,
		`title: ${JSON.stringify(title)}`,
		`transcript_segments: ${record.transcript.segmentCount}`,
		`extracted_at: ${record.extractedAt}`,
		"---",
		"",
		`# ${title}`,
		"",
		`| **Video ID** | \`${record.videoId}\` |`,
		`| **URL** | ${record.videoUrl} |`,
		`| **Método transcripción** | ${record.transcript.method} |`,
		`| **Acentuación/puntuación** | ${record.transcript.accentuationPunctuationCorrected ? "sí" : "no"} · v${record.transcript.accentuationPunctuationVersion ?? "—"} · ${record.transcript.accentuationPunctuationCorrectedAt ?? "—"} |`,
		"",
		"## Descripción",
		"",
		y.description?.trim() || "_Sin descripción._",
		"",
		"## Clasificación",
		"",
		`| Etiquetas | ${tags} |`,
		"",
		"## Transcripción",
		"",
		segmentsToTimestampedLines(record.transcript.segments) || "_Sin segmentos._",
		"",
		"### Texto plano (referencia)",
		"",
		"```text",
		record.transcript.plainText.slice(0, 50_000) +
			(record.transcript.plainText.length > 50_000 ? "\n… [truncado]" : ""),
		"```",
		"",
	];

	return lines.join("\n");
}
