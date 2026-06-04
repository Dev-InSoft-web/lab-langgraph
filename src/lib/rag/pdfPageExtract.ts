import { PNG } from "pngjs";
import { loadPdfjs } from "./pdfjsRuntime.js";

const MIN_IMAGE_PX = 64;

type PdfImageObject = {
	bitmap?: { width: number; height: number; data: Uint8ClampedArray | Uint8Array };
	width?: number;
	height?: number;
	data?: Uint8ClampedArray | Uint8Array;
};

export type ExtractedPdfImage = {
	index: number;
	buffer: Buffer;
	width: number;
	height: number;
};

export type ExtractedPdfPage = {
	pageNum: number;
	text: string;
	images: ExtractedPdfImage[];
};

function rgbaToPngBuffer(width: number, height: number, data: Uint8Array | Uint8ClampedArray): Buffer | null {
	if (data.length !== width * height * 4) return null;
	const png = new PNG({ width, height });
	png.data = Buffer.from(data);
	return PNG.sync.write(png);
}

function encodeImageObject(img: PdfImageObject): { buffer: Buffer; width: number; height: number } | null {
	const bitmap = img.bitmap ?? img;
	const width = bitmap.width ?? 0;
	const height = bitmap.height ?? 0;
	const data = bitmap.data;
	if (!width || !height || !data) return null;
	const buffer = rgbaToPngBuffer(width, height, data);
	if (!buffer) return null;
	return { buffer, width, height };
}

function pageTextFromContent(content: { items: unknown[] }): string {
	const parts: string[] = [];
	for (const raw of content.items) {
		const item = raw as { str?: string; hasEOL?: boolean };
		if (!("str" in item) || !item.str) continue;
		parts.push(item.str);
		if (item.hasEOL) parts.push("\n");
		else parts.push(" ");
	}
	return parts
		.join("")
		.replace(/[ \t]+\n/g, "\n")
		.replace(/\n{3,}/g, "\n\n")
		.replace(/[ \t]{2,}/g, " ")
		.trim();
}

async function extractImagesFromPage(
	page: {
		getOperatorList: () => Promise<{ fnArray: number[]; argsArray: unknown[][] }>;
		objs: { get: (id: string) => Promise<unknown> };
	},
	pageNum: number,
): Promise<ExtractedPdfImage[]> {
	const { OPS } = await loadPdfjs();
	const ops = await page.getOperatorList();
	const seen = new Set<string>();
	const saved: ExtractedPdfImage[] = [];
	let imgIdx = 0;

	for (let i = 0; i < ops.fnArray.length; i++) {
		const fn = ops.fnArray[i];
		if (fn !== OPS.paintImageXObject && fn !== OPS.paintInlineImageXObject) continue;

		const name = ops.argsArray[i]?.[0];
		if (name == null) continue;
		const key = String(name);
		if (seen.has(key)) continue;
		seen.add(key);

		try {
			const raw = (await page.objs.get(key)) as PdfImageObject | null;
			if (!raw) continue;
			const encoded = encodeImageObject(raw);
			if (!encoded) continue;
			if (encoded.width < MIN_IMAGE_PX || encoded.height < MIN_IMAGE_PX) continue;

			imgIdx += 1;
			saved.push({
				index: imgIdx,
				buffer: encoded.buffer,
				width: encoded.width,
				height: encoded.height,
			});
		} catch {
			/* imagen no decodificable */
		}
	}

	return saved;
}

/** Texto e imágenes por página (sin persistir en disco). */
export async function extractPdfPages(buffer: Buffer): Promise<ExtractedPdfPage[]> {
	const { getDocument } = await loadPdfjs();
	const pdf = await getDocument({
		data: new Uint8Array(buffer),
		useSystemFonts: true,
		isEvalSupported: false,
	}).promise;

	const pages: ExtractedPdfPage[] = [];
	for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
		const page = await pdf.getPage(pageNum);
		const content = await page.getTextContent();
		const text = pageTextFromContent(content);
		const images = await extractImagesFromPage(page, pageNum);
		if (text || images.length) {
			pages.push({ pageNum, text, images });
		}
	}
	return pages;
}
