import { tokenizeWords } from "./validate-fix.js";

/** Última palabra sugiere que la frase sigue en el siguiente renglón. */
const OPEN_END_WORDS = new Set([
	"de",
	"del",
	"la",
	"el",
	"los",
	"las",
	"en",
	"a",
	"al",
	"y",
	"e",
	"o",
	"u",
	"con",
	"por",
	"para",
	"sin",
	"sobre",
	"un",
	"una",
	"su",
	"tu",
	"mi",
	"mis",
	"acerca",
]);

export function segmentContinuesOnNext(current: string, next?: string): boolean {
	const cur = current.trim();
	const nxt = next?.trim();
	if (!cur || !nxt) return false;

	const last = tokenizeWords(cur).at(-1) ?? "";
	if (OPEN_END_WORDS.has(last)) return true;
	if (/,\s*$/.test(cur)) return true;
	if (/[.!?]\s*$/.test(cur)) return false;
	// Siguiente renglón sigue la misma frase (minúscula inicial)
	if (/^[a-záéíóúñü]/.test(nxt)) return true;
	return false;
}

/** Quita . ? ! final si el ASR no lo tenía y la frase continúa en el siguiente segmento. */
export function stripSpuriousSegmentEndPunctuation(
	fixed: string,
	original: string,
	nextText?: string,
): string {
	let f = fixed.trim();
	const o = original.trim();
	if (!segmentContinuesOnNext(o, nextText) && !segmentContinuesOnNext(f, nextText)) {
		return f;
	}
	if (!/[.!?]\s*$/.test(o) && /[.!?]\s*$/.test(f)) {
		f = f.replace(/[.!?]+\s*$/, "").trimEnd();
	}
	return f;
}
