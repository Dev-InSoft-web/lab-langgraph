import { PNG } from "pngjs";
import { saveEmbeddedImage, type MediaEntry } from "../media/store.js";
import { loadPdfjs } from "./pdfjsRuntime.js";

const MIN_IMAGE_PX = 64;

type PdfImageObject = {
	bitmap?: { width: number; height: number; data: Uint8ClampedArray | Uint8Array };
	width?: number;
	height?: number;
	data?: Uint8ClampedArray | Uint8Array;
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

export async function extractImagesFromPage(
	page: { getOperatorList: () => Promise<{ fnArray: number[]; argsArray: unknown[][] }>; objs: { get: (id: string) => Promise<unknown> } },
	pageNum: number,
	source: string,
): Promise<MediaEntry[]> {
	const { OPS } = await loadPdfjs();
	const ops = await page.getOperatorList();
	const seen = new Set<string>();
	const saved: MediaEntry[] = [];
	let imgIdx = 0;

	for (let i = 0; i < ops.fnArray.length; i++) {
		const fn = ops.fnArray[i];
		if (fn !== OPS.paintImageXObject && fn !== OPS.paintInlineImageXObject) {
			continue;
		}

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
			const entry = await saveEmbeddedImage(
				source,
				pageNum,
				imgIdx,
				encoded.buffer,
				encoded.width,
				encoded.height,
			);
			saved.push(entry);
		} catch {
			/* imagen no decodificable (máscara, CMYK, etc.) */
		}
	}

	return saved;
}
