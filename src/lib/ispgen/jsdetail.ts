/** Árbol JSDetail (como iInfoPlanEstudio / iInfoDriver en Capacitación). */
export type JSDetailNode = {
	todo?: boolean;
	[key: string]: JSDetailNode | boolean | undefined;
};

export function parseJSDetail(raw: string | null): JSDetailNode | null {
	if (!raw?.trim()) return null;
	const t = raw.trim();
	if (t === "todo" || t === "1" || t === "*") return { todo: true };
	try {
		const parsed = JSON.parse(t) as JSDetailNode;
		if (parsed && typeof parsed === "object") return parsed;
	} catch {
		/* claves simples: ?detail=atributos,cursos */
		const keys = t.split(",").map((s) => s.trim()).filter(Boolean);
		if (keys.length) {
			const node: JSDetailNode = {};
			for (const k of keys) node[k] = { todo: true };
			return node;
		}
	}
	return null;
}

export function wantsDetail(node: JSDetailNode | null, key: string): boolean {
	if (!node) return false;
	if (node.todo) return true;
	const child = node[key];
	if (child === true) return true;
	if (child && typeof child === "object") return true;
	return false;
}

export function detailChild(node: JSDetailNode | null, key: string): JSDetailNode | null {
	if (!node) return null;
	if (node.todo) return { todo: true };
	const child = node[key];
	if (child === true) return { todo: true };
	if (child && typeof child === "object") return child;
	return null;
}
