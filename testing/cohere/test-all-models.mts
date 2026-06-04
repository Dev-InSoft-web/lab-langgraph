/**
 * Prueba Cohere chat / embed / rerank × API key. Trial ~1000 llamadas/mes (reset UTC mensual).
 * Uso: npm run test:cohere:all [--include-paid] [--only model] [--force]
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { preloadIsaDocSecrets } from "../../src/lib/core/secrets.js";
import { cohereKeyDisplay, loadCohereApiKeysFromEnv } from "../../src/lib/providers/cohere/cohere-api-keys.js";
import {
	COHERE_FREE_TIER_CATALOG,
	COHERE_PAID_ONLY_CATALOG,
	COHERE_TRIAL_CALLS_PER_MONTH,
	type CohereCatalogEntry,
} from "../../src/lib/providers/cohere/cohere-config.js";
import { cohereProbeModel } from "../../src/lib/providers/cohere/cohere-client.js";
import { testingDataPath } from "../_shared/paths.ts";
import {
	loadQuotaState,
	quotaCanRequest,
	quotaRecordRequest,
	quotaStatePath,
	saveQuotaState,
} from "../_shared/quota-state.ts";

preloadIsaDocSecrets();

const OUT_DIR = testingDataPath("cohere-model-samples");
const keys = loadCohereApiKeysFromEnv();
if (!keys.length) {
	console.error("Sin COHERE_API_KEY / COHERE_API_KEY_2");
	process.exit(1);
}

type SampleResult = {
	apiKeyLabel: string;
	modelId: string;
	modality: string;
	platformName: string;
	freeTier: boolean;
	layoutTier: "free" | "paid_only";
	ok: boolean;
	httpStatus?: number;
	reply?: string;
	detail?: string;
	elapsedMs: number;
};

function parseArgs() {
	let only: Set<string> | null = null;
	let force = false;
	let includePaid = false;
	for (const a of process.argv.slice(2)) {
		if (a === "--force") force = true;
		else if (a === "--include-paid") includePaid = true;
		else if (a.startsWith("--only=")) only = new Set(a.slice(7).split(","));
	}
	return { only, force, includePaid };
}

function catalog(includePaid: boolean): Array<CohereCatalogEntry & { layoutTier: "free" | "paid_only" }> {
	const free = COHERE_FREE_TIER_CATALOG.map((c) => ({ ...c, layoutTier: "free" as const }));
	const paid = includePaid
		? COHERE_PAID_ONLY_CATALOG.map((c) => ({ ...c, layoutTier: "paid_only" as const }))
		: [];
	return [...free, ...paid];
}

async function main(): Promise<void> {
	const { only, force, includePaid } = parseArgs();
	for (const m of ["language", "embed", "rerank", "paid_only"]) {
		await mkdir(join(OUT_DIR, m), { recursive: true });
	}
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
	const models = catalog(includePaid).filter((c) => !only || only.has(c.modelId));

	for (let ki = 0; ki < keys.length; ki += 1) {
		const k = keys[ki]!;
		console.log(`\n── ${cohereKeyDisplay(k, ki, keys.length)} ──`);
		for (const entry of models) {
			if (!entry.freeTier && !includePaid) continue;
			const rk = `${k.label}:${entry.modelId}`;
			if (!force && priorOk.has(rk)) continue;
			const gate = quotaCanRequest(
				rateState,
				k.label,
				"monthly",
				COHERE_TRIAL_CALLS_PER_MONTH,
			);
			if (!gate.ok) {
				console.log(
					`  [${k.label}] trial mensual agotado · reintento en ${Math.round((gate.waitMs ?? 0) / 3600000)}h (UTC mes nuevo)`,
				);
				continue;
			}
			quotaRecordRequest(rateState, k.label, "monthly");
			process.stdout.write(`  [${entry.modality}] ${entry.modelId} … `);
			const t0 = performance.now();
			const r = await cohereProbeModel({
				apiKey: k.key,
				modelId: entry.modelId,
				modality: entry.modality,
			});
			const sample: SampleResult = {
				apiKeyLabel: k.label,
				modelId: entry.modelId,
				modality: entry.modality,
				platformName: entry.platformName,
				freeTier: entry.freeTier,
				layoutTier: entry.layoutTier,
				ok: r.ok,
				httpStatus: r.status,
				reply: r.reply,
				detail: r.detail,
				elapsedMs: Math.round(performance.now() - t0),
			};
			results.push(sample);
			const dir = entry.layoutTier === "paid_only" ? "paid_only" : entry.modality === "chat" ? "language" : entry.modality;
			const safe = `${k.label}_${entry.modelId}`.replace(/[^a-zA-Z0-9._-]+/g, "_");
			await writeFile(join(OUT_DIR, dir, `${safe}.json`), `${JSON.stringify(sample, null, 2)}\n`);
			console.log(sample.ok ? "OK" : `FAIL ${sample.detail?.slice(0, 60)}`);
			await saveQuotaState(ratePath, rateState);
		}
	}

	const merged = [
		...(prior.results ?? []).filter(
			(p) => !results.some((n) => n.apiKeyLabel === p.apiKeyLabel && n.modelId === p.modelId),
		),
		...results,
	];
	await writeFile(
		reportPath,
		`${JSON.stringify(
			{
				updatedAt: new Date().toISOString(),
				trialCallsPerMonth: COHERE_TRIAL_CALLS_PER_MONTH,
				freeTierCatalog: COHERE_FREE_TIER_CATALOG,
				paidOnlyCatalog: COHERE_PAID_ONLY_CATALOG,
				results: merged,
			},
			null,
			2,
		)}\n`,
	);
	await writeFile(
		join(OUT_DIR, "README.md"),
		`# Cohere samples\n\n- **free/** layout trial: chat, embed, rerank en capa gratis.\n- **paid_only/** modelos fuera de trial (solo con \`--include-paid\`).\n\nReset mensual: \`rate-state.json\` (UTC).\n`,
	);
	console.log(`\n✓ reporte ${reportPath}`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
