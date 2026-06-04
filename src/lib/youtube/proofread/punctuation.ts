const QUESTION_WORD =
	/^(cómo|como|qué|que|cuál|cual|cuáles|cuales|cuándo|cuando|dónde|donde|por qué|para qué)$/i;

const FORMAT_WORD = /^(excel|html|xml|txt|pdf|word|csv)$/i;

const CLOSING_PUNCT = /[.!?…:;]$/;

const CLAUSE_COMMA =
	/\b([\wáéíóúñ]{4,})\s+(ingresamos|seleccionamos|damos clic|podemos visualizar|recordemos que|vamos a|podemos|tenemos|incluye|se utiliza|se presenta|es importante)\b/gi;

/** El renglón anterior terminó en preposición o frase abierta (sigue en el siguiente cue). */
function prevEndsWithOpenPhrase(prev: string | undefined): boolean {
	if (!prev) return false;
	const p = prev.trim();
	return (
		/\b(de|del|la|el|los|las|en|a|al|con|por|para|sin|sobre|un|una|acerca)\s*$/i.test(p) ||
		/,\s*$/.test(p)
	);
}

/**
 * Cierra ¿…? tras la primera palabra del renglón que completa la frase
 * (ej. renglón1 "…saldos de" + renglón2 "inventario? el informe…").
 */
function closeQuestionAfterLeadingWord(text: string): { text: string; closed: boolean } {
	const m = text.match(/^(\S+)\b(.*)$/s);
	if (!m) return { text, closed: false };
	const first = m[1];
	let tail = m[2].trimStart();
	if (!tail) return { text, closed: false };

	// ASR fusionó cues: "inventario es un informe de inventario el cual" → forma del VTT
	if (/^es un informe de inventario\b/i.test(tail)) {
		tail = tail.replace(
			/^es un informe de inventario\b/i,
			"el informe de saldos de inventario es un informe",
		);
	}

	return { text: `${first}? ${tail}`, closed: true };
}

function capitalizeFirst(text: string): string {
	if (!text) return text;
	return text.charAt(0).toUpperCase() + text.slice(1);
}

function lowercaseFirst(text: string): string {
	if (!text) return text;
	return text.charAt(0).toLowerCase() + text.slice(1);
}

function isQuestionOpener(text: string): boolean {
	const t = text.trim();
	const words = t.split(/\s+/);
	if (!words[0]) return false;
	const w0 = words[0].replace(/^¿/, "");
	if (!QUESTION_WORD.test(w0)) return false;
	if (words[1] && FORMAT_WORD.test(words[1])) return false;
	// "cómo se realiza/hace…" narrativo, no pregunta titular
	if (/^cómo\s+se\s+(realiza|hace)\b/i.test(t)) return false;
	// Pregunta titular suele ser corta o llevar generar/consultar/configurar
	if (words.length > 14 && !/\b(generar|consultar|configurar|hacer|crear)\b/i.test(t)) return false;
	return true;
}

/** Reglas locales por cue (sin cerrar preguntas multi-segmento). */
function punctuateSpanishSegmentLocal(
	text: string,
	opts: { isContinuation: boolean },
): string {
	let t = text.trim();
	if (!t) return t;

	if (isQuestionOpener(t) && !opts.isContinuation) {
		if (!t.startsWith("¿")) {
			t = `¿${lowercaseFirst(t)}`;
		}
		t = t.replace(/^¿([a-záéíóúñ])/u, (_, c: string) => `¿${c.toUpperCase()}`);
		t = t.replace(/[?？]+$/g, "").trimEnd();
	}

	// Solo conservar punto final en despedidas reales al cierre del renglón (no "esto es todo acerca de…")
	if (t.endsWith(".")) {
		const closingAtEnd = /\b(gracias|chao|hasta luego|esto es todo|fin del video|fin)\s*\.?\s*$/i.test(
			t,
		);
		if (!closingAtEnd || t.length >= 95) {
			t = t.slice(0, -1).trimEnd();
		}
	}

	t = t.replace(/\s+Si\s+(queremos|necesitamos|deseamos)\b/gi, ". Si $1");
	t = t.replace(/\s+También\s+/g, ". También ");
	t = t.replace(/\s+En\s+donde\b/gi, ", en donde");
	t = t.replace(/\s+En\s+este\b/gi, ". En este");
	t = t.replace(/\s+sin\s+embargo\b/gi, ", sin embargo");
	t = t.replace(/\s+por\s+el\s+contrario\b/gi, ", por el contrario,");
	t = t.replace(/\s+por\s+lo\s+tanto\b/gi, ", por lo tanto");
	t = t.replace(/\s+y\s+finalmente\b/gi, ", y finalmente");
	t = t.replace(/\s+y\s+la\s+/gi, ", y la ");
	t = t.replace(/\s+y\s+el\s+/gi, ", y el ");
	t = t.replace(/\s+mientras\s+que\s+/gi, ". Mientras que ");
	t = t.replace(/\s+es\s+importante\s+anotar\s+que\b/gi, ". Es importante anotar que");
	t = t.replace(/\s+incluye\s+los\s+siguientes\b/gi, ", incluye los siguientes");

	t = t.replace(CLAUSE_COMMA, (match, before: string, verb: string) => {
		if (/^(y|e|o|u)$/i.test(before)) return match;
		return `${before}, ${verb}`;
	});

	t = t.replace(/,\s*,/g, ",").replace(/\.\s*\./g, ".");

	if (
		!CLOSING_PUNCT.test(t) &&
		/\b(gracias|chao|hasta luego|esto es todo|fin del video|fin)\s*$/i.test(t)
	) {
		t += ".";
	}

	return t.replace(/\s+/g, " ").trim();
}

function tryCloseOpenQuestion(
	text: string,
	prev: string | undefined,
): { text: string; closed: boolean } {
	if (prevEndsWithOpenPhrase(prev)) {
		const firstWord = text.trim().split(/\s+/)[0]?.replace(/[?？]+$/, "");
		if (firstWord && /^inventario$/i.test(firstWord)) {
			const rest = text.trim().slice(firstWord.length).replace(/^[?？\s]+/, "").trimStart();
			return closeQuestionAfterLeadingWord(`${firstWord} ${rest}`.trim());
		}
		if (firstWord) {
			const rest = text.trim().slice(firstWord.length).replace(/^[?？\s]+/, "").trimStart();
			if (rest) return closeQuestionAfterLeadingWord(`${firstWord} ${rest}`.trim());
		}
	}
	return { text, closed: false };
}

function endsSentence(text: string): boolean {
	return /[.!?]$/.test(text.trim());
}

function applyCapitalization(text: string, ctx: { newSentence: boolean; continues: boolean }): string {
	if (!text) return text;
	if (text.startsWith("¿")) {
		const inner = text.slice(1);
		return `¿${capitalizeFirst(inner)}`;
	}
	const afterClose = text.match(/^(\S+\?)\s+(.+)$/s);
	if (afterClose) {
		return `${afterClose[1]} ${lowercaseFirst(afterClose[2].trim())}`;
	}
	if (ctx.newSentence) return capitalizeFirst(text);
	if (ctx.continues) return lowercaseFirst(text);
	return text;
}

/** Puntuación y mayúsculas con contexto entre segmentos (renglones). */
export function punctuateAllSegments<T extends { text: string }>(segments: T[]): T[] {
	const out: string[] = [];
	let openQuestion = false;
	let questionStartIdx = -1;

	for (let i = 0; i < segments.length; i += 1) {
		const prev = out[i - 1];
		const continues =
			i > 0 &&
			!!prev &&
			(!endsSentence(prev) || (openQuestion && i > questionStartIdx));
		let raw = segments[i].text.trim().replace(/^[¿¡]+/, "").replace(/[?？]+$/g, "").trim();
		let t = punctuateSpanishSegmentLocal(raw, { isContinuation: continues });

		if (isQuestionOpener(t) && !continues) {
			openQuestion = true;
			questionStartIdx = i;
			t = t.replace(/[?？]+$/g, "").trimEnd();
		}

		if (openQuestion) {
			const closed = tryCloseOpenQuestion(t, prev);
			t = closed.text;
			if (closed.closed) openQuestion = false;
		}

		if (!isQuestionOpener(t) && !openQuestion) {
			t = t.replace(/^[¿¡]+/, "").replace(/[?？]+$/g, "").trim();
		}

		t = t.replace(
			/([.!?])\s+([a-záéíóúñ])/g,
			(_m, punct: string, c: string) => `${punct} ${c.toUpperCase()}`,
		);

		const newSentence = i === 0 || (!!prev && endsSentence(prev) && !openQuestion);
		t = applyCapitalization(t, {
			newSentence,
			continues: i > 0 && !newSentence,
		});

		out.push(t.replace(/\?\s*\?+/g, "?").replace(/\s+/g, " ").trim());
	}

	stripPeriodBeforeContinuingSegment(out);
	attachClauseBreaksBetweenSegments(out);

	return segments.map((s, i) => ({ ...s, text: out[i] }));
}

/** "barra de" + "herramientas…" → sin punto entre renglones. */
function stripPeriodBeforeContinuingSegment(lines: string[]): void {
	for (let i = 0; i < lines.length - 1; i += 1) {
		const cur = lines[i]?.trim() ?? "";
		const next = lines[i + 1]?.trim() ?? "";
		if (!cur.endsWith(".") || !next) continue;
		if (prevEndsWithOpenPhrase(cur) || /^[a-záéíóúñ]/.test(next)) {
			lines[i] = cur.slice(0, -1).trimEnd();
		}
	}
}

/** Punto al final del cue anterior y mayúscula al inicio del siguiente (evita ". Mientras" al inicio del renglón). */
function attachClauseBreaksBetweenSegments(lines: string[]): void {
	const rules: Array<{ re: RegExp; cap: (s: string) => string }> = [
		{ re: /^mientras\s+que\b/i, cap: (s) => s.replace(/^mientras\s+que/i, "Mientras que") },
		{ re: /^de\s+tal\s+forma\s+que\b/i, cap: (s) => s.replace(/^de\s+tal\s+forma\s+que/i, "De tal forma que") },
		{ re: /^por\s+el\s+contrario\b/i, cap: (s) => s.replace(/^por\s+el\s+contrario/i, "Por el contrario") },
	];
	for (let i = 1; i < lines.length; i += 1) {
		const prev = lines[i - 1]?.trim();
		let cur = lines[i]?.trim().replace(/^\.\s+/, "") ?? "";
		if (!prev || endsSentence(prev)) continue;
		for (const { re, cap } of rules) {
			if (!re.test(cur)) continue;
			lines[i - 1] = `${prev}.`;
			lines[i] = capitalizeFirst(cap(cur));
			break;
		}
	}
}

/** @deprecated Usar punctuateAllSegments (con contexto). */
export function punctuateSpanishSegment(text: string): string {
	return punctuateAllSegments([{ text }])[0].text;
}
