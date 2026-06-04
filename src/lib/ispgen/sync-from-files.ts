import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { resolveLabDataRoot } from "../core/lab-data-paths.js";
import { upsertEntityRow } from "./repository.js";
const ISA_DOC = "isa-doc";
const TICKETS = "tickets";

/** Importa imgbb-map y revisado desde data/ (post migrate-isa-doc). */
export async function seedImgbbFromMap(mapPath?: string): Promise<number> {
	const path = mapPath ?? join(resolveLabDataRoot(), "tickets", "assets", "imgbb-map.json");
	if (!existsSync(path)) return 0;
	const map = JSON.parse(readFileSync(path, "utf8")) as Record<
		string,
		Record<string, unknown>
	>;
	let n = 0;
	for (const [filename, meta] of Object.entries(map)) {
		const ticketId = inferTicketIdFromFilename(filename, path);
		const body = { filename, ticketId, ...meta };
		const pk = encodeURIComponent(filename);
		await upsertEntityRow(
			{ project: ISA_DOC, page: TICKETS, entity: "imgbb-asset" },
			pk,
			body,
			{
				tags: ticketId ? [ticketId] : [],
				parent: ticketId
					? { project: ISA_DOC, page: TICKETS, entity: "ticket", ientityid: ticketId }
					: undefined,
			},
		);
		n++;
	}
	return n;
}

function inferTicketIdFromFilename(filename: string, mapPath: string): string | undefined {
	const prefix = filename.match(/^tk(\d{6,8})/i);
	if (prefix) return `TK-${prefix[1]}`;

	const indexPath = join(mapPath, "..", "asset-index.json");
	if (existsSync(indexPath)) {
		try {
			const index = JSON.parse(readFileSync(indexPath, "utf8")) as Record<
				string,
				{ ticketId?: string | null }
			>;
			const tid = index[filename]?.ticketId;
			if (tid) return tid;
		} catch {
			/* ignore */
		}
	}

	const assetsRoot = join(mapPath, "..");
	if (!existsSync(assetsRoot)) return undefined;

	function walkTkDirs(dir: string): string | undefined {
		for (const ent of readdirSync(dir, { withFileTypes: true })) {
			const p = join(dir, ent.name);
			if (ent.isDirectory()) {
				if (/^TK-\d+$/i.test(ent.name)) {
					try {
						const files = readdirSync(p);
						if (files.includes(filename)) return ent.name;
						const manifest = join(p, "manifest.json");
						if (existsSync(manifest)) {
							const m = JSON.parse(readFileSync(manifest, "utf8")) as {
								assets?: { filename: string }[];
							};
							if (m.assets?.some((a) => a.filename === filename)) return ent.name;
						}
					} catch {
						/* skip */
					}
				} else {
					const found = walkTkDirs(p);
					if (found) return found;
				}
			}
		}
		return undefined;
	}

	return walkTkDirs(assetsRoot);
}

export async function seedRevisadoFromJson(jsonPath?: string): Promise<number> {
	const path = jsonPath ?? join(resolveLabDataRoot(), "bitacora", "revisado.json");
	if (!existsSync(path)) return 0;
	const data = JSON.parse(readFileSync(path, "utf8")) as Record<string, boolean>;
	let n = 0;
	for (const [key, revisado] of Object.entries(data)) {
		await upsertEntityRow(
			{ project: ISA_DOC, page: "bitacora", entity: "revisado" },
			encodeURIComponent(key),
			{ key, revisado },
		);
		n++;
	}
	return n;
}
