const { useState, useEffect, useCallback } = React;
const {
	Box, Typography, TextField, Button, Alert, List, ListItemButton, ListItemText, Grid, CircularProgress, IconButton,
} = window.Lab.mui;
const LabPage = window.Lab.LabPage;
const { useAuth } = window.Lab;
const {
	listConversations, createConversation, getConversation, deleteConversation, patchConversation, postMessage,
} = window.Lab.conversationApi;
const { readState, patchState, onStateChange } = window.Lab.urlState;

function turnsToMsgs(turnos = []) {
	const out = [];
	for (const t of turnos) {
		if (t.promptText) out.push({ role: "user", content: t.promptText });
		if (t.responseText) out.push({ role: "assistant", content: t.responseText });
	}
	return out;
}

function convFromUrl() {
	const c = Number(readState().conv);
	return Number.isFinite(c) && c > 0 ? c : null;
}

function ConversationPage() {
	const { isAuthenticated, openAuth, username } = useAuth();
	const [items, setItems] = useState([]);
	const [selectedId, setSelectedId] = useState(convFromUrl);
	const [messages, setMessages] = useState([]);
	const [prompt, setPrompt] = useState("");
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const [editTitle, setEditTitle] = useState("");

	const selectConv = useCallback((id) => {
		setSelectedId(id);
		patchState({ conv: id || undefined, page: "conversaciones" });
	}, []);

	const loadOne = useCallback(async (id, syncUrl = true) => {
		try {
			const data = await getConversation(id);
			setSelectedId(id);
			setEditTitle(data.body?.titulo || "");
			setMessages(turnsToMsgs(data.body?.turnos || []));
			if (syncUrl) patchState({ conv: id, page: "conversaciones" });
		} catch (e) {
			setError(e.message);
		}
	}, []);

	const refresh = useCallback(async () => {
		if (!isAuthenticated) return;
		try {
			const data = await listConversations();
			setItems(data.items || []);
		} catch (e) {
			setError(e.message);
		}
	}, [isAuthenticated]);

	useEffect(() => { refresh(); }, [refresh]);

	useEffect(() => {
		const id = convFromUrl();
		if (id) loadOne(id, false);
	}, [loadOne]);

	useEffect(() => onStateChange(() => {
		const id = convFromUrl();
		if (id !== selectedId) {
			if (id) loadOne(id, false);
			else {
				setSelectedId(null);
				setMessages([]);
				setEditTitle("");
			}
		}
	}), [selectedId, loadOne]);

	const createNew = async () => {
		if (!isAuthenticated) await openAuth();
		setBusy(true);
		setError("");
		try {
			const data = await createConversation("Nueva conversación");
			const id = data.body?.iconversacion;
			await refresh();
			if (id) {
				setEditTitle(data.body?.titulo || "Nueva conversación");
				setMessages([]);
				selectConv(id);
			}
		} catch (e) {
			setError(e.message);
		} finally {
			setBusy(false);
		}
	};

	const removeSelected = async () => {
		if (!selectedId) return;
		if (!confirm("¿Eliminar esta conversación?")) return;
		setBusy(true);
		try {
			await deleteConversation(selectedId);
			selectConv(null);
			await refresh();
		} catch (e) {
			setError(e.message);
		} finally {
			setBusy(false);
		}
	};

	const saveTitle = async () => {
		if (!selectedId || !editTitle.trim()) return;
		try {
			await patchConversation(selectedId, { titulo: editTitle.trim() });
			await refresh();
		} catch (e) {
			setError(e.message);
		}
	};

	const send = async () => {
		const text = prompt.trim();
		if (!text || busy) return;
		if (!isAuthenticated) await openAuth();
		if (!selectedId) {
			setError("Crea o selecciona una conversación primero");
			return;
		}
		setPrompt("");
		setBusy(true);
		setError("");
		setMessages((m) => [...m, { role: "user", content: text }, { role: "assistant", content: "…" }]);
		try {
			const data = await postMessage(selectedId, text);
			setMessages((m) => {
				const copy = [...m];
				copy[copy.length - 1] = { role: "assistant", content: data.respuesta || "" };
				return copy;
			});
			if (data.titulo) setEditTitle(data.titulo);
			await refresh();
		} catch (e) {
			setError(e.message);
			setMessages((m) => m.slice(0, -1));
		} finally {
			setBusy(false);
		}
	};

	return (
		<LabPage
			title="Lab conversaciones"
			subtitle={`LangGraph · usuario: ${username || "—"}`}
			actions={
				<>
					<Button variant="contained" onClick={createNew} disabled={busy}>Nueva</Button>
					<Button onClick={refresh}>Actualizar</Button>
				</>
			}
		>
			{error && <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError("")}>{error}</Alert>}
			<Grid container spacing={2}>
				<Grid item xs={12} md={4}>
					<List dense sx={{ maxHeight: 420, overflow: "auto", border: 1, borderColor: "divider", borderRadius: 1 }}>
						{items.length === 0 && (
							<Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
								Sin conversaciones. Pulsa Nueva.
							</Typography>
						)}
						{items.map((it) => (
							<ListItemButton
								key={it.iconversacion}
								selected={selectedId === it.iconversacion}
								onClick={() => loadOne(it.iconversacion)}
							>
								<ListItemText
									primary={it.titulo || `Conversación #${it.iconversacion}`}
									secondary={`${it.qmensajes || 0} msgs · ${new Date(it.fhultact || it.fhcre).toLocaleString()}`}
								/>
							</ListItemButton>
						))}
					</List>
				</Grid>
				<Grid item xs={12} md={8}>
					{selectedId ? (
						<Box sx={{ display: "flex", gap: 1, mb: 1, alignItems: "center" }}>
							<TextField size="small" fullWidth label="Título" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
							<Button size="small" onClick={saveTitle}>Guardar</Button>
							<IconButton color="error" size="small" onClick={removeSelected} title="Eliminar">
								<i className="fa-solid fa-trash" />
							</IconButton>
						</Box>
					) : (
						<Alert severity="info" sx={{ mb: 1 }}>Selecciona o crea una conversación para chatear con LangGraph.</Alert>
					)}
					<Box sx={{ minHeight: 300, maxHeight: 420, overflow: "auto", border: 1, borderColor: "divider", borderRadius: 1, p: 1, mb: 1 }}>
						{messages.map((m, i) => (
							<Box key={i} sx={{ mb: 1, p: 1, bgcolor: m.role === "user" ? "#243044" : "transparent", borderRadius: 1 }}>
								<Typography variant="caption" color="text.secondary">{m.role === "user" ? "Tú" : "LangGraph"}</Typography>
								<Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{m.content}</Typography>
							</Box>
						))}
					</Box>
					<Box sx={{ display: "flex", gap: 1 }}>
						<TextField
							fullWidth size="small" value={prompt}
							onChange={(e) => setPrompt(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
							placeholder={selectedId ? "Escribe un mensaje…" : "Crea una conversación primero"}
							disabled={busy || !selectedId}
						/>
						<Button variant="contained" onClick={send} disabled={busy || !selectedId}>
							{busy ? <CircularProgress size={20} /> : "Enviar"}
						</Button>
					</Box>
				</Grid>
			</Grid>
		</LabPage>
	);
}

window.Lab.ConversationPage = ConversationPage;
