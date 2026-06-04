import { readFile } from "node:fs/promises";
import path from "node:path";
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse, beginHttpRequest } from "../lib/core/http.js";
import { resolveLabDataRoot } from "../lib/core/lab-data-paths.js";
import { getController } from "../lib/ispgen/controller.js";
import { ensureEntityControllersRegisteredAsync } from "../lib/ispgen/register.js";
import { uploadBufferToImgbb } from "../lib/imgbb/upload.js";

const SEGMENT = { project: "isa-doc", page: "tickets", entity: "imgbb-asset" };

function storeCors(origin: string | null): Record<string, string> {
	return {
		...corsHeaders(origin),
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	};
}

function inferTicketId(filename: string, explicit?: string): string | undefined {
	if (explicit?.trim()) return explicit.trim();
	const m = filename.match(/^tk(\d{6,8})/i);
	return m ? `TK-${m[1]}` : undefined;
}

async function upsertAssetRow(
	filename: string,
	meta: Record<string, unknown>,
	ticketId?: string,
): Promise<Record<string, unknown>> {
	await ensureEntityControllersRegisteredAsync();
	const ctrl = getController(SEGMENT.project, SEGMENT.page, SEGMENT.entity);
	if (!ctrl) throw new Error("Controlador imgbb-asset no registrado");
	const body = { filename, ticketId: ticketId ?? null, ...meta };
	const pk = encodeURIComponent(filename);
	const res = await ctrl.update(pk, body, true);
	if (!res.encabezado.resultado) {
		const created = await ctrl.create(body, {
			parent: ticketId
				? { project: "isa-doc", page: "tickets", entity: "ticket", ientityid: ticketId }
				: undefined,
			tags: ticketId ? [ticketId] : [],
		});
		if (!created.encabezado.resultado) {
			throw new Error(created.encabezado.mensaje || "No se pudo guardar imgbb-asset");
		}
		return (created.respuesta.datos ?? body) as Record<string, unknown>;
	}
	return (res.respuesta.datos ?? body) as Record<string, unknown>;
}

/** GET /api/imgbb/assets — lista. GET /api/imgbb/assets/{filename} — detalle. */
async function imgbbGetHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

	await ensureEntityControllersRegisteredAsync();
	const ctrl = getController(SEGMENT.project, SEGMENT.page, SEGMENT.entity);
	if (!ctrl) {
		return jsonResponse({ ok: false, error: "imgbb-asset no registrado" }, 500, storeCors(origin));
	}

	const filename = request.params.filename?.trim();
	const url = new URL(request.url);

	try {
		if (!filename) {
			const ticketId = url.searchParams.get("ticketId") ?? url.searchParams.get("parentPk") ?? undefined;
			const limit = Math.min(Number(url.searchParams.get("limit") ?? 200), 500);
			const res = await ctrl.list({
				limit,
				offset: 0,
				parentPk: ticketId,
				q: url.searchParams.get("q") ?? undefined,
			});
			return jsonResponse(res, res.encabezado.resultado ? 200 : 400, storeCors(origin));
		}

		const pk = decodeURIComponent(filename);
		const res = await ctrl.getOne(pk, null);
		const status = res.encabezado.resultado ? 200 : (res.encabezado.codigo ?? 404);
		return jsonResponse(res, status, storeCors(origin));
	} catch (err) {
		context.error("imgbb GET", err);
		return jsonResponse(
			{ ok: false, error: err instanceof Error ? err.message : String(err) },
			500,
			storeCors(origin),
		);
	}
}

type UploadJsonBody = {
	filename?: string;
	base64?: string;
	ticketId?: string;
	/** Ruta relativa bajo data/tickets/assets o ISA-DOC assets (solo servidor). */
	path?: string;
};

/** POST /api/imgbb/assets/upload — multipart file, JSON base64 o JSON path. */
async function imgbbUploadHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;
	if (request.method !== "POST") {
		return jsonResponse({ ok: false, error: "POST requerido" }, 405, storeCors(origin));
	}

	try {
		let filename = "";
		let buf: Buffer;
		let explicitTicketId: string | undefined;

		const ctype = request.headers.get("content-type") ?? "";
		if (ctype.includes("multipart/form-data")) {
			const form = await request.formData();
			const file = form.get("file");
			explicitTicketId = (form.get("ticketId") as string | null)?.trim() || undefined;
			filename =
				(form.get("filename") as string | null)?.trim() ||
				(file instanceof File ? file.name : "") ||
				"upload.png";
			if (!(file instanceof File)) {
				return jsonResponse({ ok: false, error: "Campo file requerido" }, 400, storeCors(origin));
			}
			buf = Buffer.from(await file.arrayBuffer());
		} else {
			const body = (await request.json()) as UploadJsonBody;
			filename = body.filename?.trim() ?? "";
			explicitTicketId = body.ticketId?.trim();
			if (!filename) {
				return jsonResponse({ ok: false, error: "filename requerido" }, 400, storeCors(origin));
			}
			if (body.base64?.trim()) {
				const b64 = body.base64.replace(/^data:image\/\w+;base64,/, "");
				buf = Buffer.from(b64, "base64");
			} else if (body.path?.trim()) {
				const rel = body.path.replace(/\\/g, "/").replace(/^\/+/, "");
				const candidates = [
					path.join(resolveLabDataRoot(), "tickets", "assets", rel),
					path.join(process.env.ISA_DOC_ROOT ?? "", "src/lib/features/tickets/assets", rel),
				].filter((p) => p && !p.includes(".."));
				let found: string | undefined;
				for (const c of candidates) {
					try {
						await readFile(c);
						found = c;
						break;
					} catch {
						/* try next */
					}
				}
				if (!found) {
					return jsonResponse({ ok: false, error: `No se encontró archivo: ${rel}` }, 404, storeCors(origin));
				}
				buf = await readFile(found);
			} else {
				return jsonResponse({ ok: false, error: "base64 o path requerido" }, 400, storeCors(origin));
			}
		}

		const ticketId = inferTicketId(filename, explicitTicketId);

		const uploaded = await uploadBufferToImgbb(filename, buf);
		const row = await upsertAssetRow(filename, uploaded, ticketId);

		return jsonResponse({ ok: true, asset: row }, 201, storeCors(origin));
	} catch (err) {
		context.error("imgbb upload", err);
		return jsonResponse(
			{ ok: false, error: err instanceof Error ? err.message : String(err) },
			500,
			storeCors(origin),
		);
	}
}

app.http("imgbbAssetsGet", {
	route: "imgbb/assets/{filename?}",
	methods: ["GET", "OPTIONS"],
	authLevel: "anonymous",
	handler: imgbbGetHandler,
});

app.http("imgbbAssetsUpload", {
	route: "imgbb/assets/upload",
	methods: ["POST", "OPTIONS"],
	authLevel: "anonymous",
	handler: imgbbUploadHandler,
});
