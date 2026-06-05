(function () {
	const STORAGE_KEY = "isa-doc:lab-jwt";
	const STORAGE_EXP_KEY = "isa-doc:lab-jwt-exp";

	function decodeJwtPayload(token) {
		try {
			const part = token.split(".")[1];
			if (!part) return null;
			return JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
		} catch {
			return null;
		}
	}

	function getStoredLabToken() {
		return localStorage.getItem(STORAGE_KEY)?.trim() || null;
	}

	function setStoredLabToken(token, expiresAt) {
		localStorage.setItem(STORAGE_KEY, token.trim());
		if (expiresAt) localStorage.setItem(STORAGE_EXP_KEY, expiresAt);
		window.dispatchEvent(new CustomEvent("lab-auth-changed"));
	}

	function clearStoredLabToken() {
		localStorage.removeItem(STORAGE_KEY);
		localStorage.removeItem(STORAGE_EXP_KEY);
		window.dispatchEvent(new CustomEvent("lab-auth-changed"));
	}

	function labTokenExpired() {
		const expIso = localStorage.getItem(STORAGE_EXP_KEY);
		if (!expIso) {
			const token = getStoredLabToken();
			if (!token) return true;
			const payload = decodeJwtPayload(token);
			if (payload?.exp) return Date.now() >= payload.exp * 1000;
			return false;
		}
		return Date.now() >= new Date(expIso).getTime();
	}

	function labAuthHeaders() {
		const token = getStoredLabToken();
		if (!token || labTokenExpired()) return {};
		return { Authorization: `Bearer ${token}` };
	}

	function getLabUsername() {
		const token = getStoredLabToken();
		if (!token) return null;
		const p = decodeJwtPayload(token);
		return p?.username ?? p?.sub ?? null;
	}

	window.Lab = window.Lab || {};
	window.Lab.auth = {
		getStoredLabToken,
		setStoredLabToken,
		clearStoredLabToken,
		labTokenExpired,
		labAuthHeaders,
		getLabUsername,
	};
})();
