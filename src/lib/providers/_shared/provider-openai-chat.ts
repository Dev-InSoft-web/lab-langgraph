/** Cliente mínimo OpenAI-compatible (OpenRouter, DeepSeek, …). */
export type OpenAiChatResult = {
	ok: boolean;
	status: number;
	reply: string;
	raw: string;
};

export async function openAiChatComplete(opts: {
	apiBase: string;
	apiKey: string;
	model: string;
	prompt: string;
	maxTokens?: number;
	extraHeaders?: Record<string, string>;
}): Promise<OpenAiChatResult> {
	const url = `${opts.apiBase.replace(/\/$/, "")}/chat/completions`;
	const res = await fetch(url, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${opts.apiKey}`,
			"Content-Type": "application/json",
			...opts.extraHeaders,
		},
		body: JSON.stringify({
			model: opts.model,
			messages: [{ role: "user", content: opts.prompt }],
			max_tokens: opts.maxTokens ?? 32,
			temperature: 0,
		}),
	});
	const raw = await res.text();
	if (!res.ok) {
		return { ok: false, status: res.status, reply: "", raw };
	}
	try {
		const json = JSON.parse(raw) as {
			choices?: Array<{ message?: { content?: string } }>;
		};
		const reply = json.choices?.[0]?.message?.content?.trim() ?? "";
		return { ok: true, status: res.status, reply, raw };
	} catch {
		return { ok: false, status: res.status, reply: "", raw };
	}
}

export async function openAiListModels(apiBase: string, apiKey: string): Promise<string[]> {
	const url = `${apiBase.replace(/\/$/, "")}/models`;
	const res = await fetch(url, {
		headers: { Authorization: `Bearer ${apiKey}` },
	});
	if (!res.ok) return [];
	const json = (await res.json()) as { data?: Array<{ id?: string }> };
	return (json.data ?? []).map((m) => m.id ?? "").filter(Boolean);
}
