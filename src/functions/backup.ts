import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, beginHttpRequest } from "../lib/core/http.js";
import {
	buildBackup,
	minifyBackup,
	normalizeBackupProjects,
	type BackupProject,
} from "../lib/backup/export.js";

async function backupHandler(
	request: HttpRequest,
	_context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

	if (request.method !== "POST") {
		return jsonResponse({ ok: false, error: "Usar POST con body { projects: [...] }" }, 405, corsHeaders(origin));
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return jsonResponse({ ok: false, error: "JSON inválido" }, 400, corsHeaders(origin));
	}

	const rawProjects =
		typeof body === "object" && body !== null && "projects" in body
			? (body as { projects: unknown }).projects
			: body;

	const projects = normalizeBackupProjects(rawProjects);
	if (!projects.length) {
		return jsonResponse(
			{
				ok: false,
				error: "projects vacío o inválido",
				hint: 'Enviar { "projects": ["langlab","clientesis","patyia"] }',
				allowed: ["langlab", "clientesis", "patyia"] satisfies BackupProject[],
			},
			400,
			corsHeaders(origin),
		);
	}

	const payload = await buildBackup(projects);
	const hasErrors = payload.errors && Object.keys(payload.errors).length > 0;
	const ts = payload.generatedAt.replace(/[:.]/g, "-");
	const filename = `lab-backup-${ts}.json`;

	return {
		status: hasErrors ? 207 : 200,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Content-Disposition": `attachment; filename="${filename}"`,
			...corsHeaders(origin),
		},
		body: minifyBackup(payload),
	};
}

app.http("backup", {
	route: "backup",
	methods: ["POST", "OPTIONS"],
	authLevel: "anonymous",
	handler: backupHandler,
});
