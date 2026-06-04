import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { GOVERNMENT_PAGES_DIR } from "../core/data-paths.js";
import type { Document } from "@langchain/core/documents";
import type { RagCorpus, RagTipo } from "./metadata.js";

export type WebCorpusRecord = {
	pageId: string;
	url: string;
	title: string;
	corpus: RagCorpus;
	tipo: RagTipo;
	section?: string;
	fecha?: string;
	fetchedAt?: string;
	storageRel?: string;
	content: {
		markdown: string;
		plainText?: string;
	};
	/** Secciones explícitas (preferidas para chunking). */
	sections?: Array<{ heading: string; text: string }>;
};

export function pageIdFromUrl(url: string): string {
	return createHash("sha256").update(url.trim()).digest("hex").slice(0, 16);
}

export function resolveGovernmentPagesDir(): string {
	const fromEnv = process.env.GOVERNMENT_CORPUS_PAGES_DIR?.trim();
	if (fromEnv && existsSync(fromEnv)) return fromEnv;

	const candidates = [GOVERNMENT_PAGES_DIR, join(process.cwd(), "data/vectorize/web/government/pages")];
	for (const dir of candidates) {
		if (existsSync(dir)) return dir;
	}

	throw new Error(
		"No se encontró corpus web gubernamental. Ejecuta npm run lab:gov:fetch en ISA-DOC o define GOVERNMENT_CORPUS_PAGES_DIR.",
	);
}

function splitMarkdownSections(markdown: string): Array<{ heading: string; text: string }> {
	const lines = markdown.split("\n");
	const sections: Array<{ heading: string; text: string }> = [];
	let currentHeading = "Introducción";
	let buf: string[] = [];

	const flush = () => {
		const text = buf.join("\n").trim();
		if (text) sections.push({ heading: currentHeading, text });
		buf = [];
	};

	for (const line of lines) {
		const m = line.match(/^(#{1,6})\s+(.+)$/);
		if (m) {
			flush();
			currentHeading = m[2]!.trim();
			continue;
		}
		buf.push(line);
	}
	flush();
	return sections.length ? sections : [{ heading: "Contenido", text: markdown.trim() }];
}

function buildWebChunkContent(
	record: WebCorpusRecord,
	heading: string,
	text: string,
): string {
	const lines = [
		`Fuente: ${record.title}`,
		`URL: ${record.url}`,
		`Corpus: ${record.corpus} · ${record.tipo}`,
	];
	if (record.fecha) lines.push(`Fecha: ${record.fecha}`);
	lines.push(`Sección: ${heading}`, "", text.trim(), "", `Ver: ${record.url}`);
	return lines.join("\n");
}

export type LoadWebStats = {
	documents: Document[];
	pages: number;
	chunks: number;
	skippedEmpty: number;
};

async function collectGovJsonFiles(root: string): Promise<string[]> {
	const out: string[] = [];
	async function walk(dir: string): Promise<void> {
		let entries: string[];
		try {
			entries = await readdir(dir);
		} catch {
			return;
		}
		for (const name of entries) {
			const full = join(dir, name);
			if ((await stat(full)).isDirectory()) {
				await walk(full);
			} else if (name.endsWith(".json")) {
				out.push(full);
			}
		}
	}
	await walk(root);
	return out;
}

export async function loadGovernmentWebDocuments(pagesDir?: string): Promise<LoadWebStats> {
	const dir = pagesDir ?? resolveGovernmentPagesDir();
	const jsonFiles = await collectGovJsonFiles(dir);
	const docs: Document[] = [];
	let pages = 0;
	let skippedEmpty = 0;

	for (const jsonPath of jsonFiles) {
		const raw = await readFile(jsonPath, "utf8");
		const record = JSON.parse(raw) as WebCorpusRecord;
		const name = jsonPath.split(/[/\\]/).pop() ?? "";
		const pageId = record.pageId ?? name.replace(/\.json$/, "");
		const plain =
			record.content.plainText?.trim() ||
			record.content.markdown?.trim() ||
			"";
		if (!plain) {
			skippedEmpty += 1;
			continue;
		}
		pages += 1;

		const sections =
			record.sections?.length && record.sections.some((s) => s.text?.trim())
				? record.sections.filter((s) => s.text?.trim())
				: splitMarkdownSections(record.content.markdown || plain);

		for (let i = 0; i < sections.length; i += 1) {
			const sec = sections[i]!;
			const text = sec.text.trim();
			if (!text) continue;
			const heading = sec.heading || `§${i + 1}`;
			docs.push({
				pageContent: buildWebChunkContent(record, heading, text),
				metadata: {
					source: `web:${pageId}`,
					page: heading,
					corpus: record.corpus as import("./metadata.js").RagCorpus,
					tipo: record.tipo as import("./metadata.js").RagTipo,
					kind: record.tipo,
					url: record.url,
					title: record.title,
					section: heading,
					fecha: record.fecha,
					audience: "contadores",
				},
			});
		}
	}

	return { documents: docs, pages, chunks: docs.length, skippedEmpty };
}
