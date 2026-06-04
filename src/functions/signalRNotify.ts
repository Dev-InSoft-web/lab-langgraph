import { app, output, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse, beginHttpRequest } from "../lib/core/http.js";
import {
	notifyTokenOk,
	signalRConfigured,
	SIGNALR_CONNECTION_SETTING,
	SIGNALR_HUB_NAME,
} from "../lib/core/signalr-config.js";
import { toSignalROutput, type LabNotifyBody } from "../lib/core/signalr-messages.js";

const signalROutput = output.generic({
	type: "signalR",
	name: "signalRMessages",
	hubName: SIGNALR_HUB_NAME,
	connectionStringSetting: SIGNALR_CONNECTION_SETTING,
});

async function notifyHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

	if (!signalRConfigured()) {
		return jsonResponse({ ok: false, error: "SignalR no configurado" }, 503, corsHeaders(origin));
	}
	if (!notifyTokenOk(request)) {
		return jsonResponse({ ok: false, error: "No autorizado" }, 401, corsHeaders(origin));
	}

	let body: LabNotifyBody;
	try {
		body = (await request.json()) as LabNotifyBody;
	} catch {
		return jsonResponse({ ok: false, error: "JSON inválido" }, 400, corsHeaders(origin));
	}

	const msg = toSignalROutput(body);
	context.extraOutputs.set(signalROutput, [msg]);

	return jsonResponse({ ok: true, sent: msg }, 202, corsHeaders(origin));
}

app.http("signalRNotify", {
	methods: ["POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "signalr/notify",
	extraOutputs: [signalROutput],
	handler: notifyHandler,
});
