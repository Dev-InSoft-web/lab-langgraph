/**
 * Hola mundo DeepSeek × API key (créditos bienvenida ~30 días).
 * Uso: npm run test:deepseek:all [--force]
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { preloadIsaDocSecrets } from "../../src/lib/core/secrets.js";
import { deepSeekKeyDisplay, loadDeepSeekApiKeysFromEnv } from "../../src/lib/providers/deepseek/deepseek-api-keys.js";
import { DEEPSEEK_CATALOG, DEEPSEEK_WELCOME_DAYS, deepSeekApiBase } from "../../src/lib/providers/deepseek/deepseek-config.js";
import { openAiChatComplete } from "../../src/lib/providers/_shared/provider-openai-chat.js";
import { testingDataPath } from "../_shared/paths.ts";

preloadIsaDocSecrets();

const OUT_DIR = testingDataPath("deepseek-model-samples");
const PROMPT = "Di solo la palabra OK.";
const keys = loadDeepSeekApiKeysFromEnv();
if (!keys.length) {
	console.error("Sin DEEPSEEK_API_KEY / DEEPSEEK_API_KEY_2");
	process.exit(1);
}

const welcomeStart =
	process.env.DEEPSEEK_WELCOME_STARTED_AT?.trim() || new Date().toISOString().slice(0, 10);

type SampleResult = {
	apiKeyLabel: string;
	modelId: string;
	platformName: string;
	ok: boolean;
	httpStatus?: number;
	reply?: string;
	detail?: string;
	elapsedMs: number;
};

async function main(): Promise<void> {
	const force = process.argv.includes("--force");
	await mkdir(join(OUT_DIR, "language"), { recursive: true });
	const reportPath = join(OUT_DIR, "report.json");
	let prior: { results?: SampleResult[] } = {};
	try {
		prior = JSON.parse(await readFile(reportPath, "utf8")) as { results?: SampleResult[] };
	} catch {
		/* */
	}
	const priorOk = new Set((prior.results ?? []).filter((r) => r.ok).map((r) => `${r.apiKeyLabel}:${r.modelId}`));
	const results: SampleResult[] = [];
	const base = `${deepSeekApiBase()}/v1`;

	for (let ki = 0; ki < keys.length; ki += 1) {
		const k = keys[ki]!;
		console.log(`\n── ${deepSeekKeyDisplay(k, ki, keys.length)} ──`);
		for (const cat of DEEPSEEK_CATALOG) {
			const rk = `${k.label}:${cat.modelId}`;
			if (!force && priorOk.has(rk)) continue;
			process.stdout.write(`  ${cat.modelId} … `);
			const t0 = performance.now();
			const r = await openAiChatComplete({
				apiBase: base,
				apiKey: k.key,
				model: cat.modelId,
				prompt: PROMPT,
			});
			const sample: SampleResult = {
				apiKeyLabel: k.label,
				modelId: cat.modelId,
				platformName: cat.platformName,
				ok: r.ok && /ok/i.test(r.reply),
				httpStatus: r.status,
				reply: r.reply.slice(0, 120),
				detail: r.ok ? undefined : r.raw.slice(0, 300),
				elapsedMs: Math.round(performance.now() - t0),
			};
			results.push(sample);
			console.log(sample.ok ? `OK ${sample.elapsedMs}ms` : `FAIL ${sample.detail?.slice(0, 50)}`);
		}
	}

	await writeFile(
		reportPath,
		`${JSON.stringify(
			{
				updatedAt: new Date().toISOString(),
				welcomeStartedAt: welcomeStart,
				welcomeDays: DEEPSEEK_WELCOME_DAYS,
				catalog: DEEPSEEK_CATALOG,
				results: [...(prior.results ?? []), ...results],
			},
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
