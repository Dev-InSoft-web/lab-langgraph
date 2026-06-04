/**
 * Hola mundo por modelo OpenRouter (:free) × API key.
 * Uso: npm run test:openrouter:all [--only model] [--force] [--free-only]
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { preloadIsaDocSecrets } from "../../src/lib/core/secrets.js";
import { loadOpenRouterApiKeysFromEnv, openRouterKeyDisplay } from "../../src/lib/providers/openrouter/openrouter-api-keys.js";
import {
	OPENROUTER_FREE_CATALOG,
	OPENROUTER_RPD_FREE_TIER,
	openRouterApiBase,
} from "../../src/lib/providers/openrouter/openrouter-config.js";
import { openAiChatComplete, openAiListModels } from "../../src/lib/providers/_shared/provider-openai-chat.js";
import { testingDataPath } from "../_shared/paths.ts";
import {
	loadQuotaState,
	quotaCanRequest,
	quotaRecordRequest,
	quotaStatePath,
	saveQuotaState,
} from "../_shared/quota-state.ts";

preloadIsaDocSecrets();

const OUT_DIR = testingDataPath("openrouter-model-samples");
const PROMPT = "Di solo la palabra OK.";
const keys = loadOpenRouterApiKeysFromEnv();
if (!keys.length) {
	console.error("Sin OPENROUTER_API_KEY / OPENROUTER_API_KEY_2 en secrets/patyia/lab-langgraph.env");
	process.exit(1);
}

type SampleResult = {
	apiKeyLabel: string;
	keySuffix: string;
	modelId: string;
	platformName: string;
	freeTier: boolean;
	ok: boolean;
	httpStatus?: number;
	reply?: string;
	detail?: string;
	elapsedMs: number;
};

function parseArgs() {
	const argv = process.argv.slice(2);
	let only: Set<string> | null = null;
	let force = false;
	let freeOnly = true;
	for (let i = 0; i < argv.length; i += 1) {
		const a = argv[i]!;
		if (a === "--force") force = true;
		else if (a === "--all-models") freeOnly = false;
		else if (a === "--only" && argv[i + 1]) only = new Set(argv[++i]!.split(",").map((s) => s.trim()));
		else if (a.startsWith("--only=")) only = new Set(a.slice(7).split(",").map((s) => s.trim()));
	}
	return { only, force, freeOnly };
}

async function main(): Promise<void> {
	const { only, force, freeOnly } = parseArgs();
	await mkdir(join(OUT_DIR, "language"), { recursive: true });
	const ratePath = quotaStatePath(OUT_DIR, "rate-state.json");
	const rateState = await loadQuotaState(ratePath);

	const reportPath = join(OUT_DIR, "report.json");
	let prior: { results?: SampleResult[] } = {};
	try {
		prior = JSON.parse(await readFile(reportPath, "utf8")) as { results?: SampleResult[] };
	} catch {
		/* */
	}
	const priorOk = new Set((prior.results ?? []).filter((r) => r.ok).map((r) => `${r.apiKeyLabel}:${r.modelId}`));

	const results: SampleResult[] = [];
	const base = openRouterApiBase();
	const catalog = freeOnly ? OPENROUTER_FREE_CATALOG : OPENROUTER_FREE_CATALOG;

	for (let ki = 0; ki < keys.length; ki += 1) {
		const k = keys[ki]!;
		console.log(`\n── ${openRouterKeyDisplay(k, ki, keys.length)} ──`);
		const apiIds = await openAiListModels(base, k.key);
		const modelIds = [
			...new Set([
				...catalog.map((c) => c.modelId),
				...(freeOnly ? [] : apiIds.filter((id) => id.includes(":free"))),
			]),
		]
			.filter((id) => !only || only.has(id))
			.sort();

		for (const modelId of modelIds) {
			const rk = `${k.label}:${modelId}`;
			if (!force && priorOk.has(rk)) {
				console.log(`  skip ${rk}`);
				continue;
			}
			const gate = quotaCanRequest(rateState, k.label, "daily", OPENROUTER_RPD_FREE_TIER);
			if (!gate.ok) {
				console.log(`  [${k.label}] cuota diaria · espera ${Math.round((gate.waitMs ?? 0) / 1000)}s`);
				if (gate.waitMs) await new Promise((r) => setTimeout(r, Math.min(gate.waitMs!, 120_000)));
			}
			quotaRecordRequest(rateState, k.label, "daily");
			process.stdout.write(`  ${modelId} … `);
			const t0 = performance.now();
			const r = await openAiChatComplete({
				apiBase: base,
				apiKey: k.key,
				model: modelId,
				prompt: PROMPT,
				extraHeaders: {
					"HTTP-Referer": "http://localhost:5500",
					"X-Title": "lab-langgraph-probe",
				},
			});
			const cat = catalog.find((c) => c.modelId === modelId);
			const sample: SampleResult = {
				apiKeyLabel: k.label,
				keySuffix: k.key.slice(-4),
				modelId,
				platformName: cat?.platformName ?? modelId,
				freeTier: cat?.freeTier ?? modelId.includes(":free"),
				ok: r.ok && /ok/i.test(r.reply),
				httpStatus: r.status,
				reply: r.reply.slice(0, 120),
				detail: r.ok ? ( /ok/i.test(r.reply) ? undefined : "sin OK") : r.raw.slice(0, 300),
				elapsedMs: Math.round(performance.now() - t0),
			};
			results.push(sample);
			const safe = `${k.label}_${modelId}`.replace(/[^a-zA-Z0-9._-]+/g, "_");
			await writeFile(join(OUT_DIR, "language", `${safe}.json`), `${JSON.stringify(sample, null, 2)}\n`);
			console.log(sample.ok ? `OK ${sample.elapsedMs}ms` : `FAIL ${sample.detail?.slice(0, 50)}`);
			await saveQuotaState(ratePath, rateState);
			await new Promise((r) => setTimeout(r, 2500));
		}
	}

	const merged = [
		...(prior.results ?? []).filter((p) => !results.some((n) => `${n.apiKeyLabel}:${n.modelId}` === `${p.apiKeyLabel}:${p.modelId}`)),
		...results,
	];
	await writeFile(
		reportPath,
		`${JSON.stringify(
			{
				updatedAt: new Date().toISOString(),
				keys: keys.map((k) => k.label),
				rpdLimitPerKey: OPENROUTER_RPD_FREE_TIER,
				freeCatalog: OPENROUTER_FREE_CATALOG,
				results: merged,
			},
			null,
			2,
		)}\n`,
	);
	console.log(`\n✓ ${merged.filter((r) => r.ok).length}/${merged.length} OK · ${reportPath}`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
