/** Sustituye `{{var}}` en plantillas Postman. */
export function substituteTemplate(template: string, vars: Record<string, string>): string {
	return template.replace(/\{\{([^}]+)\}\}/g, (_, key: string) => {
		const k = key.trim();
		return vars[k] ?? `{{${k}}}`;
	});
}

export function extractHostVar(rawUrl: string): string {
	const m = rawUrl.match(/^\{\{([^}]+)\}\}/);
	return m?.[1]?.trim() ?? "HOST";
}

export function buildPathFromUrl(url: { path?: string[]; raw?: string }): string {
	if (url.path?.length) {
		const p = url.path.map((seg) => (seg.startsWith(":") ? `{{${seg.slice(1)}}}` : seg));
		return `/` + p.join("/").replace(/\/+/g, "/");
	}
	if (url.raw) {
		const withoutHost = url.raw.replace(/^\{\{[^}]+\}\}/, "").replace(/^https?:\/\/[^/]+/, "");
		return withoutHost.startsWith("/") ? withoutHost.split("?")[0]! : `/${withoutHost.split("?")[0]!}`;
	}
	return "/";
}
