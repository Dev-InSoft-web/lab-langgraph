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

const PATY_STAGING_INSTRUCCIONES_MUTATION_TABLES = new Set(["INSTRUCCION", "TDCONSULTAXINSTRUCCION"]);

const FORBIDDEN_EXEC_KEYWORDS =
	/\b(DROP|ALTER|TRUNCATE|DELETE|EXEC(?:UTE)?|GRANT|REVOKE|DENY|BACKUP|RESTORE|DBCC|KILL|SHUTDOWN)\b/i;

function extractMutationTables(sql: string): Set<string> {
	const cleaned = stripComments(sql);
	const tables = new Set<string>();
	const patterns = [
		/\bMERGE\s+(?:\[dbo\]\.)?\[?(\w+)\]?/gi,
		/\bINSERT\s+INTO\s+(?:\[dbo\]\.)?\[?(\w+)\]?/gi,
		/\bUPDATE\s+(?:\[dbo\]\.)?\[?(\w+)\]?/gi,
	];
	for (const pattern of patterns) {
		for (const match of cleaned.matchAll(pattern)) {
			const name = match[1]?.trim().toUpperCase();
			if (name) tables.add(name);
		}
	}
	return tables;
}

/** VRESTREPO: solo fusión de prompts en INSTRUCCION (+ enlace TDCONSULTAXINSTRUCCION) en Paty staging. */
export function assertPatyStagingInstruccionesSql(sql: string): void {
	const cleaned = stripComments(sql).trim();
	if (!cleaned) throw new Error("SQL vacío");
	if (FORBIDDEN_EXEC_KEYWORDS.test(cleaned)) {
		throw new Error("Operación no permitida. Solo fusión de INSTRUCCION en PatyIA staging.");
	}

	const mutationTables = extractMutationTables(cleaned);
	if (!mutationTables.size) {
		throw new Error("Sin cambios en INSTRUCCION. Solo MERGE/INSERT/UPDATE sobre INSTRUCCION.");
	}

	for (const table of mutationTables) {
		if (!PATY_STAGING_INSTRUCCIONES_MUTATION_TABLES.has(table)) {
			throw new Error(
				`Tabla no permitida (${table}). VRESTREPO solo puede actualizar INSTRUCCION y TDCONSULTAXINSTRUCCION en staging.`,
			);
		}
	}
}
