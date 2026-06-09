import { app, input, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse, beginHttpRequest } from "../lib/core/http.js";
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
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

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
		const info = context.extraInputs.get(connectionInfoInput) as
			| { url?: string; accessToken?: string; negotiateVersion?: number }
			| undefined;
		if (!info?.url || !info?.accessToken) {
			return jsonResponse(
				{ ok: false, error: "Negotiate sin url/accessToken", hub: SIGNALR_HUB_NAME },
				502,
				corsHeaders(origin),
			);
		}
		// @microsoft/signalr espera url + accessToken en la raíz del JSON de negotiate.
		return jsonResponse(
			{ negotiateVersion: 1, url: info.url, accessToken: info.accessToken, hub: SIGNALR_HUB_NAME },
			200,
			corsHeaders(origin),
		);
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
