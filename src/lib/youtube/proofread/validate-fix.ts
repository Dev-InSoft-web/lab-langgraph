import { applyBrandCorrectionsToText } from "./brands.js";
import { segmentContinuesOnNext, stripSpuriousSegmentEndPunctuation } from "./segment-continuation.js";

export function tokenizeWords(text: string): string[] {
	return text
		.toLowerCase()
		.normalize("NFD")
		.replace(/\p{M}/gu, "")
		.replace(/[^\p{L}\p{N}\s]/gu, " ")
		.split(/\s+/)
		.filter(Boolean);
}

/** Mismas palabras en el mismo orden (solo cambian tildes/puntuación al tokenizar). */
export function isSameWordSequence(original: string, fixed: string): boolean {
	const a = tokenizeWords(original);
	const b = tokenizeWords(fixed);
	if (a.length !== b.length) return false;
	return a.every((w, i) => w === b[i]);
}

function brandTokens(activeBrands: string[]): Set<string> {
	const out = new Set<string>();
	for (const b of activeBrands) {
		for (const w of tokenizeWords(b)) out.add(w);
	}
	return out;
}

/** Palabras del fijo que no estaban en el original (ignora marcas permitidas). */
function substantiveNewWords(original: string, fixed: string, activeBrands: string[]): number {
	const oSet = new Set(tokenizeWords(original));
	const allowed = brandTokens(activeBrands);
	return tokenizeWords(fixed).filter(
		(w) => w.length > 2 && !oSet.has(w) && !allowed.has(w),
	).length;
}

/** Fracción de palabras del original que siguen en el texto corregido. */
function originalWordRetention(original: string, fixed: string): number {
	const o = tokenizeWords(original);
	if (!o.length) return 1;
	const f = new Set(tokenizeWords(fixed));
	let hit = 0;
	for (const w of o) if (f.has(w)) hit += 1;
	return hit / o.length;
}

/** Palabras del original que aparecen en el mismo orden en el fijo (subsecuencia). */
export function orderedWordRetention(original: string, fixed: string): number {
	const o = tokenizeWords(original);
	const f = tokenizeWords(fixed);
	if (!o.length) return 1;
	let j = 0;
	let hit = 0;
	for (const w of o) {
		while (j < f.length && f[j] !== w) j += 1;
		if (j < f.length && f[j] === w) {
			hit += 1;
			j += 1;
		}
	}
	return hit / o.length;
}

const FORBIDDEN_INTRO_RE =
	/^(en este video|bienvenidos(?:\s+al)?|en el siguiente video|hoy vamos a|vamos a ver\b)/i;

/**
 * Solo acepta correcciones locales (tildes, puntuación, marcas ASR).
 * Rechaza reescrituras o completar frases incompletas.
 */
export function isPlausibleProofreadFix(
	original: string,
	fixed: string,
	activeBrands: string[] = [],
	nextOriginal?: string,
): boolean {
	const o = original.trim();
	const f = fixed.trim();
	if (!f || f === o) return true;
	if (isSameWordSequence(o, f)) return true;

	if (activeBrands.length) {
		const normalized = applyBrandCorrectionsToText(o, activeBrands);
		if (f === normalized || isSameWordSequence(normalized, f)) return true;
	}

	const oTok = tokenizeWords(o);
	const fTok = tokenizeWords(f);
	if (!oTok.length) return true;

	// Mismo número de palabras ±1 (marcas: "conta pyme" → "contapyme")
	if (fTok.length > oTok.length + 1 || fTok.length < oTok.length - 1) return false;

	if (FORBIDDEN_INTRO_RE.test(f) && !FORBIDDEN_INTRO_RE.test(o)) return false;

	// La primera palabra del ASR debe conservarse (salvo misma secuencia tokenizada)
	if (oTok.length >= 3 && fTok.length >= 3 && oTok[0] !== fTok[0]) return false;

	if (originalWordRetention(o, f) < 0.92) return false;
	if (orderedWordRetention(o, f) < 0.88) return false;

	if (substantiveNewWords(o, f, activeBrands) > 0) return false;

	// Límite de longitud en caracteres (evita párrafos nuevos)
	if (f.length > o.length * 1.12 + 8) return false;

	if (
		nextOriginal &&
		!/[.!?]\s*$/.test(o) &&
		/[.!?]\s*$/.test(f) &&
		segmentContinuesOnNext(o, nextOriginal)
	) {
		return false;
	}

	return true;
}

/** Aplica reglas de puntuación entre renglones tras la respuesta del LLM. */
export function sanitizeProofreadSegmentText(
	fixed: string,
	original: string,
	nextOriginal?: string,
	activeBrands: string[] = [],
): string {
	let text = stripSpuriousSegmentEndPunctuation(fixed, original, nextOriginal);
	if (!isPlausibleProofreadFix(original, text, activeBrands, nextOriginal)) {
		return original.trim();
	}
	return text;
}
