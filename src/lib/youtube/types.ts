/** Segmento de subtítulo / ASR (compatible con corpus ISA-DOC). */
export interface CaptionSegment {
	startMs: number | null;
	durationMs: number | null;
	text: string;
}

export interface VideoCorpusRecord {
	schemaVersion: number;
	extractedAt: string;
	videoId: string;
	videoUrl: string;
	channel: { title: string; id: string; url: string; listUrl: string };
	ytdlp: {
		id: string;
		title?: string;
		fulltitle?: string;
		description?: string;
		duration?: number;
		duration_string?: string;
		upload_date?: string;
		view_count?: number;
		like_count?: number;
		comment_count?: number;
		channel?: string;
		channel_id?: string;
		channel_url?: string;
		uploader?: string;
		uploader_id?: string;
		tags?: string[];
		categories?: string[];
		language?: string;
		live_status?: string;
		availability?: string;
		playable_in_embed?: boolean;
		age_limit?: number;
		thumbnail?: string;
		chapters?: Array<{ start_time?: number; title?: string }>;
	};
	oembed?: { title?: string; thumbnail_url?: string };
	transcript: {
		method: string;
		languageCode?: string;
		dedupeVersion?: number;
		/** true = acentuación y puntuación ya aplicadas (no reprocesar salvo force). */
		accentuationPunctuationCorrected?: boolean;
		accentuationPunctuationCorrectedAt?: string;
		accentuationPunctuationVersion?: number;
		accentuationPunctuationApi?: string;
		accentuationPunctuationModel?: string;
		accentuationPunctuationVia?: string;
		/** Legacy; mantener en sync con accentuationPunctuationVersion. */
		proofreadVersion?: number;
		proofreadAt?: string;
		proofreadApi?: string;
		proofreadModel?: string;
		segmentCount: number;
		transcriptChars: number;
		segments: CaptionSegment[];
		plainText: string;
		segmentsOriginal?: CaptionSegment[];
	};
	comments: { fetched: number; items: unknown[] };
	technical: Record<string, unknown>;
	contentKind?: "videos" | "shorts" | "streams";
	publishYear?: string;
	files: { year?: string; kind?: string; md: string; json: string; infoJson: string };
}
