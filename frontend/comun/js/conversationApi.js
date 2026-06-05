(function () {
	function sessionPayload(extra = {}) {
		const s = window.Lab.session.getLabSession();
		return {
			itercero: s.itercero,
			icontacto: s.icontacto,
			nombre_usuario: s.nombre_usuario,
			...extra,
		};
	}

	window.Lab = window.Lab || {};
	window.Lab.conversationApi = {
		async listConversations() {
			const s = window.Lab.session.getLabSession();
			const q = new URLSearchParams({ itercero: s.itercero, icontacto: s.icontacto });
			return window.Lab.fetch.labFetch(`/conversaciones?${q}`);
		},
		async createConversation(titulo = "Nueva conversación") {
			return window.Lab.fetch.labFetch("/conversaciones", {
				method: "POST",
				body: JSON.stringify(sessionPayload({ titulo })),
			});
		},
		async getConversation(id) {
			return window.Lab.fetch.labFetch(`/conversacion/${id}`);
		},
		async patchConversation(id, patch) {
			return window.Lab.fetch.labFetch(`/conversacion/${id}`, {
				method: "PATCH",
				body: JSON.stringify(patch),
			});
		},
		async deleteConversation(id) {
			return window.Lab.fetch.labFetch(`/conversacion/${id}`, { method: "DELETE" });
		},
		async postMessage(iconversacion, mensaje) {
			return window.Lab.fetch.labFetch("/mensaje", {
				method: "POST",
				body: JSON.stringify({ iconversacion, mensaje }),
			});
		},
	};
})();
