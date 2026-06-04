import type { Document } from "@langchain/core/documents";
import { getRagProfile } from "../core/config.js";
import type { RagCorpus } from "./metadata.js";
import { extractImagesFromPage } from "./pdfImages.js";
import { loadPdfjs } from "./pdfjsRuntime.js";
import type { MediaEntry } from "../media/store.js";

/** Texto por página + extracción de imágenes incrustadas (en memoria). */
export async function loadPdfWithMedia(
	buffer: Buffer,
	filename: string,
	opts?: { corpus?: RagCorpus; url?: string },
): Promise<{ docs: Document[]; images: MediaEntry[] }> {
	const corpus = opts?.corpus ?? (getRagProfile() === "fitdocs" ? "fitdocs" : "contapyme");
	const { getDocument } = await loadPdfjs();
	const data = new Uint8Array(buffer);
	const pdf = await getDocument({ data, useSystemFonts: true, isEvalSupported: false }).promise;
	const docs: Document[] = [];

	const images: MediaEntry[] = [];
	for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
		const page = await pdf.getPage(pageNum);
		const content = await page.getTextContent();
		const text = content.items
			.map((item: { str?: string }) => ("str" in item ? String(item.str) : ""))
			.join(" ")
			.replace(/\s+/g, " ")
			.trim();

		if (text) {
			docs.push({
				pageContent: text,
				metadata: {
					source: filename,
					page: String(pageNum),
					corpus,
					tipo: "pdf",
					kind: "pdf",
					title: filename,
					url: opts?.url,
				},
			});
		}

		const pageImages = await extractImagesFromPage(page, pageNum, filename);
		images.push(...pageImages);
	}

	return { docs, images };
}
