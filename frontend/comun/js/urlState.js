(function () {
	const PARAM = "s";
	const CHANGED = "lab:url-state-changed";

	function encodeState(obj) {
		const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
		return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
	}

	function decodeState(raw) {
		if (!raw) return {};
		try {
			let b64 = raw.replace(/-/g, "+").replace(/_/g, "/");
			const pad = b64.length % 4;
			if (pad) b64 += "=".repeat(4 - pad);
			const json = decodeURIComponent(escape(atob(b64)));
			const parsed = JSON.parse(json);
			return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
		} catch {
			return {};
		}
	}

	function readState() {
		return decodeState(new URL(window.location.href).searchParams.get(PARAM));
	}

	function patchState(patch) {
		const current = readState();
		const next = { ...current };
		for (const [k, v] of Object.entries(patch)) {
			if (v == null || v === "") delete next[k];
			else next[k] = v;
		}
		const url = new URL(window.location.href);
		const encoded = Object.keys(next).length ? encodeState(next) : null;
		if (!encoded) {
			if (!url.searchParams.has(PARAM)) return;
			url.searchParams.delete(PARAM);
		} else if (url.searchParams.get(PARAM) === encoded) {
			return;
		} else {
			url.searchParams.set(PARAM, encoded);
		}
		window.history.replaceState(window.history.state, "", url.toString());
		window.dispatchEvent(new CustomEvent(CHANGED));
	}

	function onStateChange(cb) {
		const fn = () => cb();
		window.addEventListener("popstate", fn);
		window.addEventListener(CHANGED, fn);
		return () => {
			window.removeEventListener("popstate", fn);
			window.removeEventListener(CHANGED, fn);
		};
	}

	window.Lab = window.Lab || {};
	window.Lab.urlState = { readState, patchState, onStateChange, PARAM };
})();
