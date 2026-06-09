const BLOCKED_KEYWORDS =
	/\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|MERGE|EXEC(?:UTE)?|GRANT|REVOKE|DENY|BACKUP|RESTORE|DBCC|KILL|SHUTDOWN)\b/i;

function stripComments(sql: string): string {
	let s = sql;
	s = s.replace(/\/\*[\s\S]*?\*\//g, " ");
	s = s.replace(/--[^\n\r]*/g, " ");
	return s;
}

function firstKeyword(batch: string): string {
	const trimmed = batch.trim();
	if (!trimmed) return "";
	const m = trimmed.match(/^([A-Za-z_][\w]*)/);
	return m?.[1]?.toUpperCase() ?? "";
}

/** Solo lectura: SELECT o WITH (CTE). Rechaza mutaciones y DDL. */
export function assertReadOnlySql(sql: string): void {
	const cleaned = stripComments(sql).trim();
	if (!cleaned) throw new Error("SQL vacío");

	const batches = cleaned.split(";").map((b) => b.trim()).filter(Boolean);
	if (!batches.length) throw new Error("SQL vacío");

	for (const batch of batches) {
		if (BLOCKED_KEYWORDS.test(batch)) {
			throw new Error("Solo consultas de lectura (SELECT). Usa POST /api/mssql/{target}/exec para modificaciones.");
		}
		const kw = firstKeyword(batch);
		if (kw !== "SELECT" && kw !== "WITH") {
			throw new Error(`Operación no permitida en query (${kw || "?"}). Usa /exec con autenticación.`);
		}
	}
}
