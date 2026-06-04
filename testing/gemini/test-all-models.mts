/**
 * Pruebas Gemini por modalidad (language, image, tts, audio, other) × API key.
 * RPD + cooldown en rate-state.json; reintentos 429 con delay parseado.
 *
 * Uso:
 *   npm run test:gemini:all
 *   npm run test:gemini:all -- --modality=image
 *   npm run test:gemini:all -- --free-only --delay 3000
 *   npm run test:gemini:all -- --force --max-429-retries 5
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { preloadIsaDocSecrets } from "../../src/lib/core/secrets.js";
import { testingDataPath } from "../_shared/paths.ts";
import {
	geminiKeyDisplay,
	keySuffix,
	loadGeminiApiKeysFromEnv,
	type GeminiKeyEntry,
} from "../../src/lib/providers/gemini/gemini-api-keys.js";
import {
	classifyGeminiModel,
	GEMINI_FREE_TIER_DOC,
	GEMINI_MODALITY_DIRS,
	type GeminiCatalogEntry,
	type GeminiModality,
} from "../../src/lib/providers/gemini/gemini-config.js";
import { listGeminiModels, modelIdFromApiName } from "../../src/lib/providers/gemini/gemini-client.js";
import {
	geminiKeyApplyCooldown,
	geminiKeyCanProbe,
	geminiKeyRecordRequest,
	GEMINI_PROBE_DELAY_MS,
	GEMINI_PROBE_MAX_429_RETRIES,
	GEMINI_PROBE_RPD_PER_KEY,
	isGemini429,
	loadGeminiRateState,
	parseGemini429WaitMs,
	rateStatePath,
	saveGeminiRateState,
	sleepGeminiProbe,
	type GeminiRateStateFile,
} from "../../src/lib/providers/gemini/gemini-rate-limit.js";
import {
	modalityForModel,
	modelSupportsProbe,
	runGeminiProbe,
} from "../../src/lib/providers/gemini/gemini-probes.js";

preloadIsaDocSecrets();

const OUT_DIR = testingDataPath("gemini-model-samples");

type SampleResult = {
	apiKeyLabel: string;
	keySuffix: string;
	modelId: string;
	modality: GeminiModality;
	platformName: string;
	freeTierDoc: boolean;
	ok: boolean;
	httpStatus?: number;
	reply?: string;
	detail?: string;
	hasImagePart?: boolean;
	skipped?: boolean;
	attempts?: number;
	waitedMs429?: number;
	elapsedMs: number;
};

const keys = loadGeminiApiKeysFromEnv();
if (!keys.length) {
	console.error("Sin GEMINI_API_KEY / GEMINI_API_KEY_2 en secrets/patyia/lab-langgraph.env");
	process.exit(1);
}

function parseArgs(): {
	only: Set<string> | null;
	force: boolean;
	apiOnly: boolean;
	freeOnly: boolean;
	delayMs: number;
	modalityFilter: Set<GeminiModality> | null;
	max429Retries: number;
} {
	const argv = process.argv.slice(2);
	let only: Set<string> | null = null;
	let force = false;
	let apiOnly = false;
	let freeOnly = false;
	let delayMs = GEMINI_PROBE_DELAY_MS;
	let modalityFilter: Set<GeminiModality> | null = null;
	let max429Retries = GEMINI_PROBE_MAX_429_RETRIES;

	for (let i = 0; i < argv.length; i += 1) {
		const a = argv[i]!;
		if (a === "--force") force = true;
		else if (a === "--api-only") apiOnly = true;
		else if (a === "--free-only") freeOnly = true;
		else if (a === "--delay" && argv[i + 1]) delayMs = Number(argv[++i]);
		else if (a.startsWith("--delay=")) delayMs = Number(a.slice(8));
		else if (a === "--only" && argv[i + 1])
			only = new Set(argv[++i]!.split(",").map((s) => s.trim()));
		else if (a.startsWith("--only=")) only = new Set(a.slice(7).split(",").map((s) => s.trim()));
		else if (a === "--modality" && argv[i + 1]) {
			modalityFilter = new Set(
				argv[++i]!.split(",").map((s) => s.trim() as GeminiModality),
			);
		} else if (a.startsWith("--modality=")) {
			modalityFilter = new Set(a.slice(11).split(",").map((s) => s.trim() as GeminiModality));
		} else if (a === "--max-429-retries" && argv[i + 1]) max429Retries = Number(argv[++i]);
		else if (a.startsWith("--max-429-retries=")) max429Retries = Number(a.slice(18));
	}
	return { only, force, apiOnly, freeOnly, delayMs, modalityFilter, max429Retries };
}

function catalogEntry(modelId: string): GeminiCatalogEntry {
	return (
		GEMINI_FREE_TIER_DOC.find((c) => c.modelId === modelId) ?? {
			platformName: modelId,
			modelId,
			freeTierDoc: false,
		}
	);
}

type ModelProbeTarget = { modelId: string; modality: GeminiModality; methods: string[] };

function buildTargets(
	meta: Awaited<ReturnType<typeof listGeminiModels>>,
	opts: ReturnType<typeof parseArgs>,
): ModelProbeTarget[] {
	const docIds = new Set(GEMINI_FREE_TIER_DOC.map((c) => c.modelId));
	const out: ModelProbeTarget[] = [];

	for (const m of meta) {
		const modelId = modelIdFromApiName(m.name);
		const methods = m.supportedGenerationMethods ?? [];
		if (!modelSupportsProbe(modelId, methods)) continue;

		let modality = modalityForModel(modelId, methods);
		if (!methods.includes("generateContent") && methods.includes("embedContent")) {
			modality = "embed";
		}

		if (opts.freeOnly && !docIds.has(modelId) && modality === "language") continue;
		if (opts.modalityFilter && !opts.modalityFilter.has(modality)) continue;
		if (opts.only && !opts.only.has(modelId)) continue;

		out.push({ modelId, modality, methods });
	}

	if (!opts.apiOnly && !opts.freeOnly) {
		for (const c of GEMINI_FREE_TIER_DOC) {
			if (opts.only && !opts.only.has(c.modelId)) continue;
			const mod = classifyGeminiModel(c.modelId);
			if (opts.modalityFilter && !opts.modalityFilter.has(mod)) continue;
			if (!out.some((t) => t.modelId === c.modelId)) {
				out.push({ modelId: c.modelId, modality: mod, methods: ["generateContent"] });
			}
		}
	}

	return [...new Map(out.map((t) => [t.modelId, t])).values()].sort(
		(a, b) => a.modality.localeCompare(b.modality) || a.modelId.localeCompare(b.modelId),
	);
}

async function sleep(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, ms));
}

async function waitForKeyReady(state: GeminiRateStateFile, keyLabel: string): Promise<void> {
	for (;;) {
		const gate = geminiKeyCanProbe(state, keyLabel);
		if (gate.ok) return;
		if (gate.waitMs && gate.waitMs > 0) {
			console.log(
				`  [${keyLabel}] ${gate.reason} · espera ${Math.round(gate.waitMs / 1000)}s (RPD ${GEMINI_PROBE_RPD_PER_KEY})`,
			);
			await sleepGeminiProbe(gate.waitMs);
			continue;
		}
		throw new Error(`${keyLabel}: ${gate.reason ?? "no disponible"}`);
	}
}

async function probeWithRetries(
	keyEntry: GeminiKeyEntry,
	target: ModelProbeTarget,
	state: GeminiRateStateFile,
	max429Retries: number,
): Promise<SampleResult> {
	const cat = catalogEntry(target.modelId);
	const t0 = performance.now();
	let waitedMs429 = 0;

	for (let retry = 0; retry <= max429Retries; retry += 1) {
		const attempts = retry + 1;
		await waitForKeyReady(state, keyEntry.label);
		geminiKeyRecordRequest(state, keyEntry.label);

		const outcome = await runGeminiProbe({
			apiKey: keyEntry.key,
			modelId: target.modelId,
			modality: target.modality,
		});

		if (outcome.ok || outcome.skipped) {
			return {
				apiKeyLabel: keyEntry.label,
				keySuffix: keySuffix(keyEntry.key),
				modelId: target.modelId,
				modality: target.modality,
				platformName: cat.platformName,
				freeTierDoc: cat.freeTierDoc,
				ok: outcome.ok,
				httpStatus: outcome.httpStatus ?? 200,
				reply: outcome.reply,
				hasImagePart: outcome.hasImagePart,
				skipped: outcome.skipped,
				detail: outcome.detail ?? outcome.skipReason,
				attempts,
				waitedMs429: waitedMs429 || undefined,
				elapsedMs: Math.round(performance.now() - t0),
			};
		}

		const status = outcome.httpStatus ?? 0;
		const detail = outcome.detail ?? "";
		if (isGemini429(status, detail) && retry < max429Retries) {
			const waitMs = parseGemini429WaitMs(status, detail);
			waitedMs429 += waitMs;
			geminiKeyApplyCooldown(state, keyEntry.label, waitMs, detail);
			await saveGeminiRateState(rateStatePath(OUT_DIR), state);
			await sleepGeminiProbe(waitMs);
			continue;
		}

		return {
			apiKeyLabel: keyEntry.label,
			keySuffix: keySuffix(keyEntry.key),
			modelId: target.modelId,
			modality: target.modality,
			platformName: cat.platformName,
			freeTierDoc: cat.freeTierDoc,
			ok: false,
			httpStatus: status || undefined,
			detail: detail.slice(0, 500),
			attempts,
			waitedMs429: waitedMs429 || undefined,
			elapsedMs: Math.round(performance.now() - t0),
		};
	}

	return {
		apiKeyLabel: keyEntry.label,
		keySuffix: keySuffix(keyEntry.key),
		modelId: target.modelId,
		modality: target.modality,
		platformName: cat.platformName,
		freeTierDoc: cat.freeTierDoc,
		ok: false,
		detail: "max reintentos 429",
		waitedMs429,
		elapsedMs: Math.round(performance.now() - t0),
	};
}

function resultKey(r: SampleResult): string {
	return `${r.apiKeyLabel}:${r.modality}:${r.modelId}`;
}

async function main(): Promise<void> {
	const opts = parseArgs();
	await mkdir(OUT_DIR, { recursive: true });
	for (const d of GEMINI_MODALITY_DIRS) {
		await mkdir(join(OUT_DIR, d), { recursive: true });
	}

	const ratePath = rateStatePath(OUT_DIR);
	const rateState = await loadGeminiRateState(ratePath);

	console.log(
		`Gemini API · ${keys.length} key(s) · delay=${opts.delayMs}ms · RPD/key=${GEMINI_PROBE_RPD_PER_KEY} · 429 retries=${opts.max429Retries}`,
	);

	const reportPath = join(OUT_DIR, "report.json");
	let prior: { results?: SampleResult[] } = {};
	try {
		prior = JSON.parse(await readFile(reportPath, "utf8")) as { results?: SampleResult[] };
	} catch {
		/* */
	}
	const priorOk = new Set((prior.results ?? []).filter((r) => r.ok).map(resultKey));

	const apiModelsByKey: Record<string, string[]> = {};
	const targetsByKey: Record<string, ModelProbeTarget[]> = {};

	for (let ki = 0; ki < keys.length; ki += 1) {
		const k = keys[ki]!;
		console.log(`\n── ${geminiKeyDisplay(k, ki, keys.length)} ──`);
		const meta = await listGeminiModels(k.key);
		const targets = buildTargets(meta, opts);
		targetsByKey[k.label] = targets;
		apiModelsByKey[k.label] = targets.map((t) => t.modelId);
		const byMod = Object.groupBy(targets, (t) => t.modality);
		console.log(
			`Modelos a probar: ${targets.length} · ` +
				Object.entries(byMod)
					.map(([m, arr]) => `${m}:${arr?.length ?? 0}`)
					.join(" · "),
		);
	}

	const results: SampleResult[] = [];

	for (let ki = 0; ki < keys.length; ki += 1) {
		const k = keys[ki]!;
		for (const target of targetsByKey[k.label] ?? []) {
			const rk = `${k.label}:${target.modality}:${target.modelId}`;
			if (!opts.force && priorOk.has(rk)) {
				console.log(`  skip ${rk} (ok previo)`);
				continue;
			}
			process.stdout.write(`  ${k.label} · [${target.modality}] ${target.modelId} … `);
			const r = await probeWithRetries(k, target, rateState, opts.max429Retries);
			results.push(r);
			const safe = `${k.label}_${target.modelId}`.replace(/[^a-zA-Z0-9._-]+/g, "_");
			const dir = join(OUT_DIR, r.modality);
			if (r.ok && r.reply) await writeFile(join(dir, `${safe}.txt`), `${r.reply}\n`);
			await writeFile(join(dir, `${safe}.json`), `${JSON.stringify(r, null, 2)}\n`);
			const tag = r.ok ? `OK ${r.elapsedMs}ms` : `FAIL ${r.detail?.slice(0, 60)}`;
			const extra = r.attempts && r.attempts > 1 ? ` (${r.attempts} intentos)` : "";
			console.log(tag + extra);
			await saveGeminiRateState(ratePath, rateState);
			await sleep(opts.delayMs);
		}
	}

	await saveGeminiRateState(ratePath, rateState);

	const merged = [
		...(prior.results ?? []).filter((p) => !results.some((n) => resultKey(n) === resultKey(p))),
		...results,
	];
	const okN = merged.filter((r) => r.ok).length;
	const byModality = Object.groupBy(merged, (r) => r.modality);

	await writeFile(
		reportPath,
		`${JSON.stringify(
			{
				updatedAt: new Date().toISOString(),
				keys: keys.map((k) => k.label),
				rpdLimitPerKey: GEMINI_PROBE_RPD_PER_KEY,
				probeDelayMs: opts.delayMs,
				apiModelsByKey,
				targetsByKey,
				freeTierDoc: GEMINI_FREE_TIER_DOC,
				rateState: rateState.keys,
				results: merged,
			},
			null,
			2,
		)}\n`,
	);

	const modLines = GEMINI_MODALITY_DIRS.filter((m) => m !== "skipped").map((m) => {
		const rows = merged.filter((r) => r.modality === m);
		const ok = rows.filter((r) => r.ok).length;
		return `| ${m} | ${ok}/${rows.length} |`;
	});

	const summary = [
		"# Google AI Studio (Gemini) — pruebas por modalidad",
		"",
		`Actualizado: ${new Date().toISOString()}`,
		"",
		"| Métrica | Valor |",
		"|---------|-------|",
		`| API keys | ${keys.length} |`,
		`| Pruebas OK | ${okN}/${merged.length} |`,
		`| RPD límite / key / día | ${GEMINI_PROBE_RPD_PER_KEY} |`,
		`| Delay entre modelos | ${opts.delayMs}ms |`,
		"",
		"## Por modalidad",
		"",
		"| Modalidad | OK/Total |",
		"|-----------|----------|",
		...modLines,
		"",
		"Carpetas: `language/`, `image/`, `tts/`, `audio/`, `other/`. Estado RPD: `rate-state.json`.",
		"",
		"```bash",
		"npm run test:gemini:all",
		"npm run test:gemini:all -- --modality=image",
		"npm run test:gemini:all -- --modality=language,image --delay 3000",
		"```",
	].join("\n");

	await writeFile(join(OUT_DIR, "SUMMARY.md"), `${summary}\n`);
	await writeFile(
		join(OUT_DIR, "README.md"),
		`# Gemini model samples\n\nModalidades: ${GEMINI_MODALITY_DIRS.join(", ")}.\n\nVer SUMMARY.md, report.json, rate-state.json.\n`,
	);

	console.log(`\n✓ ${okN}/${merged.length} OK · ${reportPath}`);
	for (const [m, rows] of Object.entries(byModality)) {
		if (!rows?.length) continue;
		console.log(`  ${m}: ${rows.filter((r) => r.ok).length}/${rows.length} OK`);
	}
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
