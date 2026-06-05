const { useState } = React;
const { TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Typography } = window.Lab.mui;
const { getApiBase } = window.Lab.api;
const { setStoredLabToken } = window.Lab.auth;

function AuthDialog({ open, onClose }) {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const submit = async (ev) => {
		ev.preventDefault();
		setLoading(true);
		setError("");
		try {
			const res = await fetch(`${getApiBase()}/auth/token`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username: username.trim(), password }),
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(data.error || res.statusText);
			setStoredLabToken(data.token, data.expiresAt);
			setPassword("");
			onClose(true);
		} catch (e) {
			setError(e.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onClose={() => onClose(false)} maxWidth="xs" fullWidth>
			<form onSubmit={submit}>
				<DialogTitle>Auth lab-langgraph</DialogTitle>
				<DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
					<Typography variant="body2" color="text.secondary">
						JWT 30 días · POST /api/auth/token
					</Typography>
					{error && <Alert severity="error">{error}</Alert>}
					<TextField label="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} required />
					<TextField label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
				</DialogContent>
				<DialogActions>
					<Button onClick={() => onClose(false)}>Cancelar</Button>
					<Button type="submit" variant="contained" disabled={loading}>
						{loading ? "Entrando…" : "Entrar"}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
}

window.Lab.AuthDialog = AuthDialog;
