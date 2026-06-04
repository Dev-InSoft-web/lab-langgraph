/** Carga ESM de pdfjs bajo CJS (Azure Functions / tsc Node16). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cached: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loadPdfjs(): Promise<any> {
	if (!cached) {
		cached = await import("pdfjs-dist/legacy/build/pdf.mjs");
	}
	return cached;
}
