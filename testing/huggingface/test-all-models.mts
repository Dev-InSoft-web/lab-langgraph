/**
 * Probe embeddings Hugging Face Inference × API key.
 * Uso: npm run test:huggingface:all [--only model] [--force]
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { preloadIsaDocSecrets } from "../../src/lib/core/secrets.js";
import {
	huggingFaceKeyDisplay,
	loadHuggingFaceApiKeysFromEnv,
} from "../../src/lib/providers/huggingface/huggingface-api-keys.js";
import { HUGGINGFACE_EMBED_CATALOG, huggingFaceInferenceBase } from "../../src/lib/providers/huggingface/huggingface-config.js";
import { testingDataPath } from "../_shared/paths.ts";

preloadIsaDocSecrets();

const OUT_DIR = testingDataPath("huggingface-model-samples");
const keys = loadHuggingFaceApiKeysFromEnv();
if (!keys.length) {
	console.error("Sin HUGGINGFACE_API_KEY / HUGGINGFACE_API_KEY_2");
	process.exit(1);
}

type SampleResult = {
	apiKeyLabel: string;
	modelId: string;
	platformName: string;
	ok: boolean;
	httpStatus?: number;
	dimensions?: number;
	detail?: string;
	elapsedMs: number;
};

async function probeEmbed(apiKey: string, modelId: string): Promise<SampleResult["detail"] & object> {
	const url = `${huggingFaceInferenceBase()}/models/${encodeURIComponent(modelId)}`;
	const res = await fetch(url, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ inputs: "hola mundo" }),
	});
	const text = await res.text();
	if (!res.ok) return { ok: false, status: res.status, detail: text.slice(0, 300) };
	try {
		const json = JSON.parse(text) as number[][] | number[];
		const flat = Array.isArray(json[0]) ? (json[0] as number[]) : (json as number[]);
		const dim = flat?.length ?? 0;
		return { ok: dim > 0, status: res.status, dimensions: dim };
	} catch {
		return { ok: false, status: res.status, detail: text.slice(0, 200) };
	}
}

async function main(): Promise<void> {
	const force = process.argv.includes("--force");
	await mkdir(join(OUT_DIR, "embed"), { recursive: true });
	const reportPath = join(OUT_DIR, "report.json");
	let prior: { results?: SampleResult[] } = {};
	try {
		prior = JSON.parse(await readFile(reportPath, "utf8")) as { results?: SampleResult[] };
	} catch {
		/* */
	}
	const priorOk = new Set((prior.results ?? []).filter((r) => r.ok).map((r) => `${r.apiKeyLabel}:${r.modelId}`));
	const results: SampleResult[] = [];

	for (let ki = 0; ki < keys.length; ki += 1) {
		const k = keys[ki]!;
		console.log(`\n── ${huggingFaceKeyDisplay(k, ki, keys.length)} ──`);
		for (const cat of HUGGINGFACE_EMBED_CATALOG) {
			const rk = `${k.label}:${cat.modelId}`;
			if (!force && priorOk.has(rk)) continue;
			process.stdout.write(`  ${cat.modelId} … `);
			const t0 = performance.now();
			const r = (await probeEmbed(k.key, cat.modelId)) as {
				ok: boolean;
				status: number;
				dimensions?: number;
				detail?: string;
			};
			const sample: SampleResult = {
				apiKeyLabel: k.label,
				modelId: cat.modelId,
				platformName: cat.platformName,
				ok: r.ok,
				httpStatus: r.status,
				dimensions: r.dimensions,
				detail: r.detail,
				elapsedMs: Math.round(performance.now() - t0),
			};
			results.push(sample);
			console.log(sample.ok ? `OK dim=${sample.dimensions}` : `FAIL ${sample.detail?.slice(0, 50)}`);
		}
	}

	await writeFile(
		reportPath,
		`${JSON.stringify(
			{ updatedAt: new Date().toISOString(), catalog: HUGGINGFACE_EMBED_CATALOG, results },
			null,
			2,
		)}\n`,
	);
	console.log(`\n✓ ${reportPath}`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
