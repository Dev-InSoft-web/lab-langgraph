(function () {
	const PUBLIC = new Set(["/auth/token", "/health", "/tools/health"]);
	let openAuthModal = null;

	async function ensureAuth() {
		const { auth } = window.Lab;
		if (auth.getStoredLabToken() && !auth.labTokenExpired()) return;
		if (!openAuthModal) throw new Error("Inicia sesión (Auth lab)");
		await openAuthModal();
	}

	async function labFetch(path, init = {}, retry = true) {
		const { api, auth } = window.Lab;
		const url = `${api.getApiBase()}${path.startsWith("/") ? path : `/${path}`}`;
		const pub = PUBLIC.has(path.split("?")[0]);
		if (!pub) await ensureAuth();
		const headers = {
			...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
			...(pub ? {} : auth.labAuthHeaders()),
			...(init.headers || {}),
		};
		const res = await fetch(url, { ...init, headers });
		const text = await res.text();
		let data = {};
		try {
			data = text ? JSON.parse(text) : {};
		} catch {
			data = { raw: text };
		}
		if (res.status === 401 && retry && !pub) {
			auth.clearStoredLabToken();
			await openAuthModal?.();
			return labFetch(path, init, false);
		}
		if (!res.ok) throw new Error(data.error || data.hint || res.statusText);
		return data;
	}

	async function labFetchRaw(path, init = {}, retry = true) {
		const { api, auth } = window.Lab;
		const url = `${api.getApiBase()}${path.startsWith("/") ? path : `/${path}`}`;
		const pub = PUBLIC.has(path.split("?")[0]);
		if (!pub) await ensureAuth();
		const res = await fetch(url, { ...init, headers: { ...auth.labAuthHeaders(), ...(init.headers || {}) } });
		if (res.status === 401 && retry && !pub) {
			auth.clearStoredLabToken();
			await openAuthModal?.();
			return labFetchRaw(path, init, false);
		}
		if (!res.ok) {
			const t = await res.text();
			let err = res.statusText;
			try {
				err = JSON.parse(t).error || err;
			} catch {
				err = t || err;
			}
			throw new Error(err);
		}
		return res;
	}

	function registerAuthModal(fn) {
		openAuthModal = fn;
	}

	window.Lab = window.Lab || {};
	window.Lab.fetch = { registerAuthModal, labFetch, labFetchRaw };
})();
