(function () {
	const KEY = "lab-langgraph:lab-session";
	const LAB_ITERCERO = "lab-langgraph";

	function getLabSession() {
		try {
			const stored = JSON.parse(localStorage.getItem(KEY) || "{}");
			const username = window.Lab?.auth?.getLabUsername?.() || stored.nombre_usuario || "Usuario lab";
			return {
				itercero: LAB_ITERCERO,
				icontacto: stored.icontacto || username.toLowerCase(),
				nombre_usuario: username,
			};
		} catch {
			return { itercero: LAB_ITERCERO, icontacto: "default", nombre_usuario: "Usuario lab" };
		}
	}

	function setLabSession(patch) {
		const next = { ...getLabSession(), ...patch };
		localStorage.setItem(KEY, JSON.stringify({ icontacto: next.icontacto, nombre_usuario: next.nombre_usuario }));
		return next;
	}

	window.Lab = window.Lab || {};
	window.Lab.session = { getLabSession, setLabSession, getPatySession: getLabSession, setPatySession: setLabSession };
})();
