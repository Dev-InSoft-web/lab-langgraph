const { useState, useEffect, useCallback } = React;
const { Box, Typography, TextField, Button, Alert, List, ListItem, ListItemText, Grid, CircularProgress } = window.Lab.mui;
const LabPage = window.Lab.LabPage;
const { useAuth } = window.Lab;
const { labFetch } = window.Lab.fetch;
const { getApiBase, loadChat, saveChat } = window.Lab.api;

function FitDocsPage() {
	const { isAuthenticated, openAuth } = useAuth();
	const [messages, setMessages] = useState(() => loadChat());
	const [docs, setDocs] = useState([]);
	const [question, setQuestion] = useState("");
	const [files, setFiles] = useState(null);
	const [busy, setBusy] = useState(false);
	const [status, setStatus] = useState("");

	const refreshDocs = useCallback(async () => {
		try {
			const data = await labFetch("/documents");
			setDocs(data.documents || []);
		} catch (e) {
			setStatus(e.message);
		}
	}, []);

	useEffect(() => { refreshDocs(); }, [refreshDocs]);
	useEffect(() => { saveChat(messages); }, [messages]);

	const indexPdfs = async () => {
		if (!files?.length) return setStatus("Selecciona PDFs");
		if (!isAuthenticated) await openAuth();
		const form = new FormData();
		for (const f of files) form.append("files", f, f.name);
		setBusy(true);
		try {
			const data = await labFetch("/index", { method: "POST", body: form });
			setStatus(data.message);
			setMessages([]);
			await refreshDocs();
		} catch (e) {
			setStatus(e.message);
		} finally {
			setBusy(false);
		}
	};

	const ask = async (ev) => {
		ev.preventDefault();
		const q = question.trim();
		if (!q) return;
		if (!isAuthenticated) await openAuth();
		setQuestion("");
		const next = [...messages, { role: "user", content: q }];
		setMessages([...next, { role: "assistant", content: "Buscando…" }]);
		try {
			const data = await labFetch("/ask", { method: "POST", body: JSON.stringify({ question: q, k: 4 }) });
			setMessages([...next, { role: "assistant", content: data.answer }]);
		} catch (e) {
			setMessages([...next, { role: "assistant", content: `Error: ${e.message}` }]);
		}
	};

	return (
		<LabPage title="FitDocs RAG" subtitle={`API: ${getApiBase()}`}>
			<Grid container spacing={2}>
				<Grid item xs={12} md={4}>
					<Button variant="outlined" component="label" fullWidth>
						PDFs
						<input type="file" hidden accept=".pdf" multiple onChange={(e) => setFiles(e.target.files)} />
					</Button>
					<Button fullWidth variant="contained" sx={{ mt: 1 }} onClick={indexPdfs} disabled={busy}>
						{busy ? <CircularProgress size={20} /> : "Indexar"}
					</Button>
					<Button fullWidth sx={{ mt: 1 }} onClick={refreshDocs}>Actualizar lista</Button>
					{status && <Typography variant="caption" display="block" sx={{ mt: 1 }}>{status}</Typography>}
					<List dense>
						{docs.map((d) => (
							<ListItem key={d}><ListItemText primary={d} /></ListItem>
						))}
					</List>
				</Grid>
				<Grid item xs={12} md={8}>
					{!docs.length && <Alert severity="warning">Indexa PDFs para empezar.</Alert>}
					<Box sx={{ minHeight: 280, maxHeight: 400, overflow: "auto", mb: 1 }}>
						{messages.map((m, i) => (
							<Box key={i} sx={{ mb: 1, p: 1, bgcolor: m.role === "user" ? "#243044" : "background.default", borderRadius: 1 }}>
								<Typography variant="caption">{m.role === "user" ? "Tú" : "IA"}</Typography>
								<Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{m.content}</Typography>
							</Box>
						))}
					</Box>
					<Box component="form" onSubmit={ask} sx={{ display: "flex", gap: 1 }}>
						<TextField fullWidth size="small" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Pregunta…" />
						<Button type="submit" variant="contained">Enviar</Button>
					</Box>
				</Grid>
			</Grid>
		</LabPage>
	);
}

window.Lab.FitDocsPage = FitDocsPage;
