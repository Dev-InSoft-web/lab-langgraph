import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { corsHeaders, jsonResponse, optionsResponse, beginHttpRequest } from "../lib/core/http.js";
import { runConversationTurn } from "../lib/patyia/conversation/runTurn.js";
import type { ConversationPostBody } from "../lib/patyia/conversation/types.js";

async function postConversacionJailbreakHandler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const origin = request.headers.get("origin");
	const authBlock = await beginHttpRequest(request, origin);
	if (authBlock) return authBlock;

	try {
		const body = (await request.json()) as ConversationPostBody;
		const { stream } = await runConversationTurn({ ...body, jailbreak: true });
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
		context.error("postConversacionJailbreak", err);
		const message = err instanceof Error ? err.message : String(err);
		return jsonResponse({ ok: false, error: message }, 500, corsHeaders(origin));
	}
}

app.http("postConversacionJailbreak", {
	methods: ["POST", "OPTIONS"],
	authLevel: "anonymous",
	route: "conversacion/jailbreak",
	handler: postConversacionJailbreakHandler,
});
