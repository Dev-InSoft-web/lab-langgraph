/**
 * Exporta diagramas Mermaid (LangGraph + orquestador) a docs/diagrams y frontend/diagrams.
 * Uso: npm run diagrams:render
 */
import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { conversationGraph } from "../src/lib/patyia/conversation/graph.js";
import { buildProofreadGraph } from "../src/lib/youtube/proofread/graph.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIRS = [join(ROOT, "docs", "diagrams"), join(ROOT, "frontend", "diagrams")];

const GRAPHS: Array<{ name: string; graph?: { getGraph: () => { drawMermaid: () => string } } }> = [
	{ name: "patyia-conversation", graph: conversationGraph },
	{ name: "youtube-proofread", graph: buildProofreadGraph() },
];

const STATIC_MMD = ["orchestrator-cascade.mmd"];

for (const dir of OUT_DIRS) {
	await mkdir(dir, { recursive: true });
}

const manifest: Array<{ name: string; mmd: string; png?: string }> = [];

for (const { name, graph } of GRAPHS) {
	if (!graph) continue;
	const mermaid = graph.getGraph().drawMermaid();
	for (const OUT_DIR of OUT_DIRS) {
		const mmdPath = join(OUT_DIR, `${name}.mmd`);
		await writeFile(mmdPath, `${mermaid}\n`, "utf8");
		console.log(`Wrote ${mmdPath}`);
		const pngPath = join(OUT_DIR, `${name}.png`);
		const proc = spawnSync(
			"npx",
			["-y", "@mermaid-js/mermaid-cli", "-i", mmdPath, "-o", pngPath, "-b", "transparent"],
			{ stdio: "inherit", shell: true, cwd: ROOT },
		);
		if (proc.status !== 0) {
			console.warn(`mmdc falló para ${name} — queda solo .mmd`);
		} else {
			console.log(`Wrote ${pngPath}`);
		}
	}
	manifest.push({ name, mmd: `${name}.mmd`, png: `${name}.png` });
}

const docsDir = join(ROOT, "docs", "diagrams");
for (const file of STATIC_MMD) {
	const src = join(docsDir, file);
	const text = await readFile(src, "utf8");
	const base = file.replace(/\.mmd$/, "");
	for (const OUT_DIR of OUT_DIRS) {
		await writeFile(join(OUT_DIR, file), text, "utf8");
		const mmdPath = join(OUT_DIR, file);
		const pngPath = join(OUT_DIR, `${base}.png`);
		spawnSync(
			"npx",
			["-y", "@mermaid-js/mermaid-cli", "-i", mmdPath, "-o", pngPath, "-b", "transparent"],
			{ stdio: "inherit", shell: true, cwd: ROOT },
		);
	}
	manifest.push({ name: base, mmd: file, png: `${base}.png` });
}

const indexHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>LangGraph · lab-langgraph</title>
  <script type="module">
    import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
    mermaid.initialize({ startOnLoad: true, theme: "neutral" });
  </script>
  <style>
    body { font-family: system-ui, sans-serif; margin: 1.5rem; background: #0f1419; color: #e7ecf3; }
    h1 { font-size: 1.25rem; }
    section { margin: 2rem 0; padding: 1rem; border: 1px solid #2a3544; border-radius: 8px; }
    img { max-width: 100%; background: #fff; border-radius: 4px; margin-top: 0.75rem; }
    a { color: #6eb6ff; }
    pre { overflow: auto; font-size: 0.75rem; background: #1a2332; padding: 0.75rem; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Diagramas LangGraph y orquestador</h1>
  <p>Generados con <code>npm run diagrams:render</code>. PNG si <code>mmdc</code> está disponible.</p>
  <nav>
    <ul>
${manifest.map((m) => `      <li><a href="#${m.name}">${m.name}</a></li>`).join("\n")}
    </ul>
  </nav>
${manifest
	.map(
		(m) => `  <section id="${m.name}">
    <h2>${m.name}</h2>
    <p><a href="${m.mmd}">${m.mmd}</a></p>
    ${m.png ? `<img src="${m.png}" alt="${m.name}" />` : "<p><em>Sin PNG — instala mmdc o abre el .mmd en VS Code</em></p>"}
    <pre class="mermaid-src"><!-- ver ${m.mmd} --></pre>
  </section>`,
	)
	.join("\n")}
</body>
</html>
`;

for (const OUT_DIR of OUT_DIRS) {
	await writeFile(join(OUT_DIR, "index.html"), indexHtml, "utf8");
}

console.log("\nDiagramas en docs/diagrams/ y frontend/diagrams/ (abre frontend/diagrams/index.html)");
