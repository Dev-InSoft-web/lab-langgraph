/**
 * CRUD de archivos sobre el filestore (proveedor intercambiable, ver lib/filestore).
 *
 *   GET    /api/files                — lista (q, limit)
 *   POST   /api/files                — sube archivo (multipart `file` o JSON base64)
 *   GET    /api/files/{key}          — metadatos; con ?download=1 devuelve el binario
 *   PUT    /api/files/{key}          — reemplaza contenido
 *   DELETE /api/files/{key}          — elimina (proveedor + metadatos)
 */
import crypto from "node:crypto";
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, beginHttpRequest } from "../lib/core/http.js";
import { queryPaty } from "../lib/db/pg.js";
import { getFileStorage, getFilestoreConfig } from "../lib/filestore/storage.js";

const Q_FILE = '"BD_LANGLAB"."FILESTORE_FILE"';

type FileRow = {
	FILEKEY: string;
	FILENAME: string;
	CONTENTTYPE: string | null;
	SIZEBYTES: string | number | null;
	SHA256: string | null;
	PROVIDER: string;
	METADATA: unknown;
	FHCRE: string;
	FHULTACT: string;
};

function rowToJson(r: FileRow) {
	return {
		key: r.FILEKEY,
		filename: r.FILENAME,
		contentType: r.CONTENTTYPE,
		size: r.SIZEBYTES != null ? Number(r.SIZEBYTES) : null,
		sha256: r.SHA256,
		provider: r.PROVIDER,
		metadata: r.METADATA ?? null,
		fhcre: r.FHCRE,
		fhultact: r.FHULTACT,
	};
}

function sanitizeKey(raw: string): string {
	return raw
		.replace(/\\/g, "/")
		.replace(/^\/+/, "")
		.replace(/\.\./g, "")
		.replace(/[^\w\-./]+/g, "_");
}

type UploadPayload = {
	key: string;
	filename: string;
	buf: Buffer;
	contentType: string;
	metadata: unknown;
};

/** Extrae el archivo de la request: multipart `file` o JSON { filename, base64, contentType }. */
async function readUpload(request: HttpRequest, routeKey?: string): Promise<UploadPayload> {
	const ctype = request.headers.get("content-type") ?? "";
	if (ctype.includes("multipart/form-data")) {
		const form = await request.formData();
		const file = form.get("file");
		if (!(file instanceof File)) throw new Error("Campo file requerido (multipart)");
		const filename = (form.get("filename") as string | null)?.trim() || file.name || "upload.bin";
		const key = sanitizeKey(routeKey || (form.get("key") as string | null)?.trim() || filename);
		const metaRaw = (form.get("metadata") as string | null)?.trim();
		return {
			key,
			filename,
			buf: Buffer.from(await file.arrayBuffer()),
			contentType: file.type || "application/octet-stream",
			metadata: metaRaw ? JSON.parse(metaRaw) : null,
		};
	}
	const body = (await request.json()) as {
		filename?: string;
		key?: string;
		base64?: string;
		contentType?: string;
		metadata?: unknown;
	};
	const filename = body.filename?.trim() || routeKey || "";
	if (!filename) throw new Error("filename requerido");
	if (!body.base64?.trim()) throw new Error("base64 requerido");
	const b64 = body.base64.replace(/^data:[\w/+.-]+;base64,/, "");
	return {
		key: sanitizeKey(routeKey || body.key?.trim() || filename),
		filename,
		buf: Buffer.from(b64, "base64"),
		contentType: body.contentType?.trim() || "application/octet-stream",
		metadata: body.metadata ?? null,
	};
}

async function saveFile(payload: UploadPayload): Promise<FileRow> {
	const storage = getFileStorage();
	const cfg = getFilestoreConfig();
	await storage.putObject(payload.key, payload.buf, payload.contentType);
	const sha256 = crypto.createHash("sha256").update(payload.buf).digest("hex");
	const rows = await queryPaty<FileRow>(
		`INSERT INTO ${Q_FILE} ("FILEKEY","FILENAME","CONTENTTYPE","SIZEBYTES","SHA256","PROVIDER","METADATA")
		 VALUES ($1,$2,$3,$4,$5,$6,$7)
		 ON CONFLICT ("FILEKEY") DO UPDATE SET
		   "FILENAME" = EXCLUDED."FILENAME",
		   "CONTENTTYPE" = EXCLUDED."CONTENTTYPE",
		   "SIZEBYTES" = EXCLUDED."SIZEBYTES",
		   "SHA256" = EXCLUDED."SHA256",
		   "PROVIDER" = EXCLUDED."PROVIDER",
		   "METADATA" = COALESCE(EXCLUDED."METADATA", ${Q_FILE}."METADATA"),
		   "FHULTACT" = now()
		 RETURNING *`,
		[
			payload.key,
			payload.filename,
			payload.contentType,
			payload.buf.length,
			sha256,
			cfg.provider,
			payload.metadata == null ? null : JSON.stringify(payload.metadata),
		],
	);
	return rows[0]!;
}

/** GET/POST /api/files */
async function filesCollectionHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

	try {
		if (request.method === "GET") {
			const url = new URL(request.url);
			const q = url.searchParams.get("q")?.trim();
			const limit = Math.min(Number(url.searchParams.get("limit") ?? 200) || 200, 500);
			const rows = q
				? await queryPaty<FileRow>(
						`SELECT * FROM ${Q_FILE} WHERE "FILEKEY" ILIKE $1 OR "FILENAME" ILIKE $1 ORDER BY "FHULTACT" DESC LIMIT $2`,
						[`%${q}%`, limit],
					)
				: await queryPaty<FileRow>(
						`SELECT * FROM ${Q_FILE} ORDER BY "FHULTACT" DESC LIMIT $1`,
						[limit],
					);
			return jsonResponse({ ok: true, files: rows.map(rowToJson) }, 200, corsHeaders(origin));
		}

		const payload = await readUpload(request);
		const row = await saveFile(payload);
		return jsonResponse({ ok: true, file: rowToJson(row) }, 201, corsHeaders(origin));
	} catch (err) {
		context.error("files collection", err);
		return jsonResponse(
			{ ok: false, error: err instanceof Error ? err.message : String(err) },
			500,
			corsHeaders(origin),
		);
	}
}

/** GET/PUT/DELETE /api/files/{key} (key puede traer subcarpetas URL-encoded). */
async function filesItemHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

	const key = sanitizeKey(decodeURIComponent(request.params.key ?? ""));
	if (!key) {
		return jsonResponse({ ok: false, error: "key requerido" }, 400, corsHeaders(origin));
	}

	try {
		if (request.method === "GET") {
			const rows = await queryPaty<FileRow>(`SELECT * FROM ${Q_FILE} WHERE "FILEKEY" = $1`, [key]);
			const row = rows[0];
			if (!row) {
				return jsonResponse({ ok: false, error: "archivo no encontrado" }, 404, corsHeaders(origin));
			}
			const url = new URL(request.url);
			if (url.searchParams.get("download") === "1") {
				const obj = await getFileStorage().getObject(key);
				if (!obj) {
					return jsonResponse(
						{ ok: false, error: "contenido no disponible en el proveedor" },
						404,
						corsHeaders(origin),
					);
				}
				return {
					status: 200,
					headers: {
						"Content-Type": row.CONTENTTYPE || obj.contentType,
						"Content-Disposition": `attachment; filename="${row.FILENAME}"`,
						...corsHeaders(origin),
					},
					body: obj.body,
				};
			}
			return jsonResponse({ ok: true, file: rowToJson(row) }, 200, corsHeaders(origin));
		}

		if (request.method === "PUT") {
			const payload = await readUpload(request, key);
			const row = await saveFile(payload);
			return jsonResponse({ ok: true, file: rowToJson(row) }, 200, corsHeaders(origin));
		}

		// DELETE
		await getFileStorage().deleteObject(key);
		const rows = await queryPaty<FileRow>(
			`DELETE FROM ${Q_FILE} WHERE "FILEKEY" = $1 RETURNING "FILEKEY"`,
			[key],
		);
		if (!rows.length) {
			return jsonResponse({ ok: false, error: "archivo no encontrado" }, 404, corsHeaders(origin));
		}
		return jsonResponse({ ok: true, deleted: key }, 200, corsHeaders(origin));
	} catch (err) {
		context.error("files item", err);
		return jsonResponse(
			{ ok: false, error: err instanceof Error ? err.message : String(err) },
			500,
			corsHeaders(origin),
		);
	}
}

app.http("filesCollection", {
	route: "files",
	methods: ["GET", "POST", "OPTIONS"],
	authLevel: "anonymous",
	handler: filesCollectionHandler,
});

app.http("filesItem", {
	route: "files/{*key}",
	methods: ["GET", "PUT", "DELETE", "OPTIONS"],
	authLevel: "anonymous",
	handler: filesItemHandler,
});
