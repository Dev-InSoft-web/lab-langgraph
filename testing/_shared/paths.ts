import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const _DIR = dirname(fileURLToPath(import.meta.url));

/** Raíz del repo lab-langgraph. */
export const LAB_ROOT = resolve(_DIR, "../..");

/** Salida de pruebas de inventario (gemini/cerebras/minimax-model-samples). */
export function testingDataPath(...segments: string[]): string {
	return join(LAB_ROOT, "testing", "data", ...segments);
}
