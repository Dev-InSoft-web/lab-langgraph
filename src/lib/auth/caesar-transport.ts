/** Capa de presentación: César + prefijo/sufijo dentro del cifrado (no es seguridad real). */

export const CAESAR_TRANSPORT_PREFIX = "abc123";
export const CAESAR_TRANSPORT_SUFFIX = "xyz987";

/** Desfase diario 1–31 según día del mes (UTC, mismo criterio en Swagger y API). */
export function caesarShiftForDate(date = new Date()): number {
	return date.getUTCDate();
}

function shiftChar(c: string, delta: number): string {
	const code = c.charCodeAt(0);
	if (code >= 65 && code <= 90) {
		return String.fromCharCode(((code - 65 + delta + 26) % 26) + 65);
	}
	if (code >= 97 && code <= 122) {
		return String.fromCharCode(((code - 97 + delta + 26) % 26) + 97);
	}
	return c;
}

export function caesarEncode(plain: string, shift: number): string {
	return [...plain].map((c) => shiftChar(c, shift)).join("");
}

export function caesarDecode(encoded: string, shift: number): string {
	return [...encoded].map((c) => shiftChar(c, -shift)).join("");
}

function extractPlainFromWrappedInner(inner: string): string | null {
	if (
		inner.startsWith(CAESAR_TRANSPORT_PREFIX) &&
		inner.endsWith(CAESAR_TRANSPORT_SUFFIX) &&
		inner.length > CAESAR_TRANSPORT_PREFIX.length + CAESAR_TRANSPORT_SUFFIX.length
	) {
		return inner.slice(
			CAESAR_TRANSPORT_PREFIX.length,
			inner.length - CAESAR_TRANSPORT_SUFFIX.length,
		);
	}
	return null;
}

/** abc123 + plain + xyz987 → César( todo ) con desfase = día UTC (1–31). */
export function wrapTransportPassword(plain: string, date = new Date()): string {
	const shift = caesarShiftForDate(date);
	const payload = `${CAESAR_TRANSPORT_PREFIX}${plain}${CAESAR_TRANSPORT_SUFFIX}`;
	return caesarEncode(payload, shift);
}

/**
 * Si viene cifrado (Swagger), decodifica con desfase del día UTC.
 * Si no coincide el envoltorio, devuelve texto plano (labFetch, Postman).
 * Compatibilidad v1: prefijo/sufijo visibles + César fijo 13 solo sobre la contraseña.
 */
export function unwrapTransportPassword(raw: string, date = new Date()): string {
	const shift = caesarShiftForDate(date);
	const decoded = caesarDecode(raw, shift);
	const plain = extractPlainFromWrappedInner(decoded);
	if (plain !== null) return plain;

	// Legacy v1 (prefijo/sufijo sin cifrar, shift fijo 13)
	if (
		raw.startsWith(CAESAR_TRANSPORT_PREFIX) &&
		raw.endsWith(CAESAR_TRANSPORT_SUFFIX) &&
		raw.length > CAESAR_TRANSPORT_PREFIX.length + CAESAR_TRANSPORT_SUFFIX.length
	) {
		const inner = raw.slice(
			CAESAR_TRANSPORT_PREFIX.length,
			raw.length - CAESAR_TRANSPORT_SUFFIX.length,
		);
		return caesarDecode(inner, 13);
	}

	return raw;
}
