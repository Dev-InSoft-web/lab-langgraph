/**
 * Hola mundo por modelo × cada API key Cerebras (SDK oficial).
 * Uso: npm run test:cerebras:all [--only gpt-oss-120b] [--force] [--stream]
 */
import Cerebras from "@cerebras/cerebras_cloud_sdk";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { preloadIsaDocSecrets } from "../../src/lib/core/secrets.js";
import { testingDataPath } from "../_shared/paths.ts";
import { keySuffix, loadCerebrasApiKeysFromEnv, type CerebrasKeyEntry } from "../../src/lib/providers/cerebras/cerebras-api-keys.js";
import {
	CEREBRAS_CATALOG,
	cerebrasKeyEntryDisplay,
	cerebrasNeedsNoReasoning,
	type CerebrasCatalogEntry,
} from "../../src/lib/providers/cerebras/cerebras-config.js";

preloadIsaDocSecrets();

const OUT_DIR = testingDataPath("cerebras-model-samples");
const PROMPT = "Di solo la palabra OK.";

type SampleResult = {
	apiKeyLabel: string;
	keySuffix: string;
	modelId: string;
	platformName: string;
	ok: boolean;
	httpStatus?: number;
	reply?: string;
	detail?: string;
	stream: boolean;
	elapsedMs: number;
};

const keys = loadCerebrasApiKeysFromEnv();
if (!keys.length) {
	console.error("Sin CEREBRAS_API_KEY / CEREBRAS_API_KEY_2 en secrets/patyia/lab-langgraph.env");
	process.exit(1);
}

function parseArgs(): {
	only: Set<string> | null;
	force: boolean;
	stream: boolean;
	apiOnly: boolean;
} {
	const argv = process.argv.slice(2);
	let only: Set<string> | null = null;
	let force = false;
	let stream = false;
	let apiOnly = false;
	for (let i = 0; i < argv.length; i += 1) {
		const a = argv[i]!;
		if (a === "--force") force = true;
		else if (a === "--stream") stream = true;
		else if (a === "--api-only") apiOnly = true;
		else if (a === "--only" && argv[i + 1]) only = new Set(argv[++i]!.split(",").map((s) => s.trim()));
		else if (a.startsWith("--only=")) only = new Set(a.slice(7).split(",").map((s) => s.trim()));
	}
	return { only, force, stream, apiOnly };
}

function catalogName(modelId: string): string {
	return CEREBRAS_CATALOG.find((c) => c.modelId === modelId)?.platformName ?? modelId;
}

async function listApiModels(apiKey: string): Promise<string[]> {
	const client = new Cerebras({ apiKey });
	const res = await client.models.list();
	const data = (res as { data?: Array<{ id?: string }> }).data ?? [];
	return data.map((m) => m.id ?? "").filter(Boolean);
}

function modelsToProbe(apiIds: string[], only: Set<string> | null, apiOnly: boolean): string[] {
	const fromCatalog = CEREBRAS_CATALOG.map((c) => c.modelId);
	const union = apiOnly ? apiIds : [...new Set([...fromCatalog, ...apiIds])];
	return union.filter((id) => !only || only.has(id)).sort();
}

async function probeModel(
	keyEntry: CerebrasKeyEntry,
	keyIndex: number,
	keyTotal: number,
	modelId: string,
	stream: boolean,
): Promise<SampleResult> {
	const t0 = performance.now();
	const client = new Cerebras({ apiKey: keyEntry.key });
	const reasoning_effort = cerebrasNeedsNoReasoning(modelId)
		? ("none" as const)
		: /gpt-oss/i.test(modelId)
			? ("low" as const)
			: undefined;

	const base = {
		model: modelId,
		messages: [{ role: "user" as const, content: PROMPT }],
		max_completion_tokens: 64,
		temperature: 0,
		top_p: 1,
		...(reasoning_effort ? { reasoning_effort } : {}),
	};

	try {
		let reply = "";
		if (stream) {
			const s = await client.chat.completions.create({ ...base, stream: true });
			for await (const chunk of s) {
				reply += chunk.choices[0]?.delta?.content ?? "";
			}
		} else {
			const res = await client.chat.completions.create({ ...base, stream: false });
			const msg = res.choices[0]?.message;
			reply = (msg?.content ?? (msg as { reasoning?: string })?.reasoning ?? "").trim();
		}
		const elapsedMs = Math.round(performance.now() - t0);
		const ok = /ok/i.test(reply);
		return {
			apiKeyLabel: keyEntry.label,
			keySuffix: keySuffix(keyEntry.key),
			modelId,
			platformName: catalogName(modelId),
			ok,
			httpStatus: 200,
			reply: reply.slice(0, 120),
			detail: ok ? undefined : `sin OK (${cerebrasKeyEntryDisplay(keyEntry, keyIndex, keyTotal)})`,
			stream,
			elapsedMs,
		};
	} catch (e) {
		const err = e instanceof Error ? e.message : String(e);
		const status = (e as { status?: number }).status;
		return {
			apiKeyLabel: keyEntry.label,
			keySuffix: keySuffix(keyEntry.key),
			modelId,
			platformName: catalogName(modelId),
			ok: false,
			httpStatus: status,
			detail: err.slice(0, 400),
			stream,
			elapsedMs: Math.round(performance.now() - t0),
		};
	}
}

function resultKey(r: SampleResult): string {
	return `${r.apiKeyLabel}:${r.modelId}`;
}

async function main(): Promise<void> {
	const { only, force, stream, apiOnly } = parseArgs();
	await mkdir(OUT_DIR, { recursive: true });
	await mkdir(join(OUT_DIR, "language"), { recursive: true });

	console.log(`Cerebras SDK · ${keys.length} API key(s) · stream=${stream}`);

	const reportPath = join(OUT_DIR, "report.json");
	let prior: { results?: SampleResult[] } = {};
	try {
		prior = JSON.parse(await readFile(reportPath, "utf8")) as { results?: SampleResult[] };
	} catch {
		/* */
	}
	const priorOk = new Set((prior.results ?? []).filter((r) => r.ok).map(resultKey));

	const apiModelsByKey: Record<string, string[]> = {};
	for (let ki = 0; ki < keys.length; ki += 1) {
		const k = keys[ki]!;
		console.log(`\n── ${cerebrasKeyEntryDisplay(k, ki, keys.length)} ──`);
		apiModelsByKey[k.label] = await listApiModels(k.key);
		console.log(`GET /v1/models → ${apiModelsByKey[k.label]!.join(", ") || "(vacío)"}`);
	}

	const results: SampleResult[] = [];

	for (let ki = 0; ki < keys.length; ki += 1) {
		const k = keys[ki]!;
		const modelIds = modelsToProbe(apiModelsByKey[k.label] ?? [], only, apiOnly);
		for (const modelId of modelIds) {
			const rk = `${k.label}:${modelId}`;
			if (!force && priorOk.has(rk)) {
				console.log(`  skip ${rk} (ok previo)`);
				continue;
			}
			process.stdout.write(`  ${k.label} · ${modelId} … `);
			const r = await probeModel(k, ki, keys.length, modelId, stream);
			results.push(r);
			const safe = `${k.label}_${modelId}`.replace(/[^a-zA-Z0-9._-]+/g, "_");
			const langPath = join(OUT_DIR, "language", `${safe}.txt`);
			if (r.ok && r.reply) await writeFile(langPath, `${r.reply}\n`);
			await writeFile(join(OUT_DIR, "language", `${safe}.json`), `${JSON.stringify(r, null, 2)}\n`);
			console.log(r.ok ? `OK ${r.elapsedMs}ms` : `FAIL ${r.detail?.slice(0, 70)}`);
		}
	}

	const merged = [...(prior.results ?? []).filter((p) => !results.some((n) => resultKey(n) === resultKey(p))), ...results];
	const okN = merged.filter((r) => r.ok).length;
	await writeFile(
		reportPath,
		`${JSON.stringify(
			{
				updatedAt: new Date().toISOString(),
				keys: keys.map((k) => k.label),
				apiModelsByKey,
				stream,
				results: merged,
			},
			null,
			2,
		)}\n`,
	);

	const summary = [
		"# Cerebras — hola mundo por modelo y API key",
		"",
		`Generado: ${new Date().toISOString()}`,
		"",
		`| Métrica | Valor |`,
		`|---------|-------|`,
		`| API keys | ${keys.length} |`,
		`| Pruebas OK | ${okN}/${merged.length} |`,
		`| SDK | @cerebras/cerebras_cloud_sdk |`,
		"",
		"## Por key",
		"",
		...keys.map((k) => {
			const rows = merged.filter((r) => r.apiKeyLabel === k.label);
			const ok = rows.filter((r) => r.ok).length;
			return `- **${k.label}** (${keySuffix(k.key)}): ${ok}/${rows.length} OK · modelos API: ${(apiModelsByKey[k.label] ?? []).join(", ")}`;
		}),
		"",
		"Re-ejecutar: `npm run test:cerebras:all` (omite OK en report.json; `--force` repite todo).",
		"",
	].join("\n");
	await writeFile(join(OUT_DIR, "SUMMARY.md"), `${summary}\n`);
	await writeFile(
		join(OUT_DIR, "README.md"),
		`# Cerebras model samples\n\nVer \`SUMMARY.md\` y \`report.json\`. Artefactos en \`language/\`.\n\n\`\`\`bash\nnpm run test:cerebras:all\nnpm run test:cerebras:all -- --force\nnpm run test:cerebras:all -- --stream\n\`\`\`\n`,
	);

	console.log(`\n✓ ${okN}/${merged.length} OK · reporte: ${reportPath}`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
