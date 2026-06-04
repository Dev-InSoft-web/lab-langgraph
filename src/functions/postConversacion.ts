import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse } from "../lib/core/http.js";
import { runConversationTurn } from "../lib/patyia/conversation/runTurn.js";
import type { ConversationPostBody } from "../lib/patyia/conversation/types.js";

async function postConversacionHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	if (request.method === "OPTIONS") return optionsResponse(origin);

	try {
		const body = (await request.json()) as ConversationPostBody;
		const { stream } = await runConversationTurn(body);
		return {
			status: 200,
			headers: {
				...corsHeaders(origin),
				"Content-Type": "text/event-stream; charset=utf-8",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
			body: stream,
		};
	} catch (err) {
		context.error("postConversacion", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

app.http("postConversacion", {
	methods: ["POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "conversacion",
	handler: postConversacionHandler,
});
