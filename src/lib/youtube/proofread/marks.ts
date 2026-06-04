import type { VideoCorpusRecord } from "../types.js";
import { PROOFREAD_VERSION } from "./prompts.js";

export const ACCENTUATION_PUNCTUATION_VERSION = PROOFREAD_VERSION;

export type AccentuationPunctuationMeta = {
	api?: string;
	model?: string;
	via?: "langgraph-proofread" | "repunctuate" | "promoted-test" | "batch-punctuation";
};

/** Ya pasó corrección de tildes/ortografía y puntuación (flag explícito o legacy proofreadVersion). */
export function isAccentuationPunctuationCorrected(
	transcript: VideoCorpusRecord["transcript"],
): boolean {
	if (transcript.accentuationPunctuationCorrected === true) return true;
	return (
		transcript.proofreadVersion != null &&
		transcript.proofreadVersion >= ACCENTUATION_PUNCTUATION_VERSION
	);
}

export function applyAccentuationPunctuationMark(
	transcript: VideoCorpusRecord["transcript"],
	meta?: AccentuationPunctuationMeta,
): VideoCorpusRecord["transcript"] {
	const at = new Date().toISOString();
	return {
		...transcript,
		accentuationPunctuationCorrected: true,
		accentuationPunctuationCorrectedAt: at,
		accentuationPunctuationVersion: ACCENTUATION_PUNCTUATION_VERSION,
		accentuationPunctuationApi: meta?.api ?? transcript.proofreadApi,
		accentuationPunctuationModel: meta?.model ?? transcript.proofreadModel,
		accentuationPunctuationVia: meta?.via,
		proofreadVersion: ACCENTUATION_PUNCTUATION_VERSION,
		proofreadAt: transcript.proofreadAt ?? at,
		proofreadApi: meta?.api ?? transcript.proofreadApi,
		proofreadModel: meta?.model ?? transcript.proofreadModel,
	};
}
