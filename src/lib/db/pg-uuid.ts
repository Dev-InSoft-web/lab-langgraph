const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Normaliza valor para columna UUID en PG; inválidos → null. */
export function toPgUuidOrNull(value: unknown): string | null {
	if (value == null) return null;
	const s = String(value).trim();
	if (!s || s === "undefined" || s === "null") return null;
	return UUID_RE.test(s) ? s : null;
}
