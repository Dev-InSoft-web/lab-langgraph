import type { Document } from "@langchain/core/documents";
import pdfParse from "pdf-parse";

/**
 * Parsea un PDF en memoria (sin escribir a disco).
 * VOLÁTIL: no dependas de /tmp; este camino evita archivos temporales.
 */
export async function loadPdfFromBuffer(buffer: Buffer, filename: string): Promise<Document[]> {
	const parsed = await pdfParse(buffer);
	const text = parsed.text?.trim() ?? "";
	if (!text) {
		return [];
	}

	const numPages = parsed.numpages || 1;
	// pdf-parse no devuelve texto por página; un solo documento con metadatos de archivo.
	return [
		{
			pageContent: text,
			metadata: {
				source: filename,
				page: numPages > 1 ? `1-${numPages}` : "1",
			},
		},
	];
}
