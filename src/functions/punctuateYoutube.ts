import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

import { corsHeaders, jsonResponse, optionsResponse } from "../lib/core/http.js";

import { applyPunctuationAndBrandsToVideo } from "../lib/youtube/proofread/run.js";



async function punctuateYoutubeHandler(

	request: HttpRequest,

	context: InvocationContext,

): Promise<HttpResponseInit> {

	const origin = request.headers.get("origin");

	if (request.method === "OPTIONS") return optionsResponse(origin);



	try {

		const videoId = request.query.get("videoId")?.trim();

		const force = request.query.get("force") === "true";

		const dryRun = request.query.get("dryRun") === "true";



		if (!videoId) {

			return jsonResponse(

				{ ok: false, error: "Query videoId requerido (ej. ?videoId=-FsBdhIguyM)" },

				400,

				corsHeaders(origin),

			);

		}



		context.log(`Punctuate (marcas+puntuación): ${videoId} force=${force} dryRun=${dryRun}`);

		const result = await applyPunctuationAndBrandsToVideo({ videoId, force, dryRun });



		return jsonResponse({ ok: true, ...result }, 200, corsHeaders(origin));

	} catch (err) {

		context.error("punctuate youtube error", err);

		const message = err instanceof Error ? err.message : String(err);

		return jsonResponse({ ok: false, error: message, videoId: request.query.get("videoId") }, 500, corsHeaders(origin));

	}

}



app.http("punctuateYoutube", {

	methods: ["POST", "OPTIONS"],

	authLevel: "anonymous",

	route: "youtube/punctuate",

	handler: punctuateYoutubeHandler,

});

