/** Identificadores PostgreSQL con comillas (mayúsculas sostenidas en catálogo). */

export function pgQ(ident: string): string {
	return `"${ident.replace(/"/g, '""')}"`;
}

export function qualifiedQ(schema: string, table: string): string {
	return `${pgQ(schema)}.${pgQ(table)}`;
}

export function qualifiedSeq(schema: string, seq: string): string {
	return `${pgQ(schema)}.${pgQ(seq)}`;
}

/** Columna PG: mayúsculas sin guion bajo. */
export function sqlCol(name: string): string {
	return pgQ(name.replace(/_/g, "").toUpperCase());
}
