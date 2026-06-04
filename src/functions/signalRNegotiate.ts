import { app, input, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse } from "../lib/core/http.js";
import { SIGNALR_CONNECTION_SETTING, SIGNALR_HUB_NAME, signalRConfigured } from "../lib/core/signalr-config.js";

const connectionInfoInput = input.generic({
	type: "signalRConnectionInfo",
	name: "connectionInfo",
	hubName: SIGNALR_HUB_NAME,
	connectionStringSetting: SIGNALR_CONNECTION_SETTING,
	userId: "{query.userId}",
});

async function negotiateHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	if (request.method === "OPTIONS") return optionsResponse(origin);

	if (!signalRConfigured()) {
		return jsonResponse(
			{
				ok: false,
				error: "AzureSignalRConnectionString no configurada",
				hint: "Provisionar SignalR (Bicep) o local.settings.json",
			},
			503,
			corsHeaders(origin),
		);
	}

	try {
		const info = context.extraInputs.get(connectionInfoInput);
		return jsonResponse({ ok: true, hub: SIGNALR_HUB_NAME, connectionInfo: info }, 200, corsHeaders(origin));
	} catch (err) {
		context.error("signalr negotiate", err);
		return jsonResponse(
			{ ok: false, error: err instanceof Error ? err.message : String(err) },
			500,
			corsHeaders(origin),
		);
	}
}

app.http("signalRNegotiate", {
	methods: ["GET", "POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "signalr/negotiate",
	extraInputs: [connectionInfoInput],
	handler: negotiateHandler,
});
