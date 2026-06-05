(function () {
	const CHAT_KEY = "fitdocs_chat_v1";

	window.Lab = window.Lab || {};
	window.Lab.api = {
		getApiBase() {
			return (window.FITDOCS_API_BASE || "http://127.0.0.1:5500/api").replace(/\/$/, "");
		},
		loadChat() {
			try {
				return JSON.parse(sessionStorage.getItem(CHAT_KEY) || "[]");
			} catch {
				return [];
			}
		},
		saveChat(messages) {
			sessionStorage.setItem(CHAT_KEY, JSON.stringify(messages));
		},
	};
})();
