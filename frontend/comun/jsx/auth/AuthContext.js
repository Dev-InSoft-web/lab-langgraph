const { createContext, useContext, useState, useEffect, useCallback } = React;
const { registerAuthModal } = window.Lab.fetch;
const { getStoredLabToken, clearStoredLabToken, labTokenExpired, getLabUsername } = window.Lab.auth;
const AuthDialog = window.Lab.AuthDialog;

const AuthCtx = createContext(null);

function AuthProvider({ children }) {
	const [token, setToken] = useState(() => getStoredLabToken());
	const [username, setUsername] = useState(() => getLabUsername());
	const [dialogOpen, setDialogOpen] = useState(false);
	const [resolver, setResolver] = useState(null);

	const refresh = useCallback(() => {
		setToken(getStoredLabToken());
		setUsername(getLabUsername());
	}, []);

	useEffect(() => {
		const fn = () => refresh();
		window.addEventListener("lab-auth-changed", fn);
		return () => window.removeEventListener("lab-auth-changed", fn);
	}, [refresh]);

	const openAuth = useCallback(() => {
		return new Promise((resolve, reject) => {
			setResolver({ resolve, reject });
			setDialogOpen(true);
		});
	}, []);

	useEffect(() => {
		registerAuthModal(openAuth);
	}, [openAuth]);

	const onDialogClose = (ok) => {
		setDialogOpen(false);
		if (resolver) {
			if (ok) resolver.resolve(getStoredLabToken());
			else resolver.reject(new Error("Auth cancelada"));
			setResolver(null);
		}
		refresh();
	};

	const value = {
		isAuthenticated: Boolean(token) && !labTokenExpired(),
		username,
		openAuth,
		logout: () => {
			clearStoredLabToken();
			refresh();
		},
	};

	return (
		<AuthCtx.Provider value={value}>
			{children}
			<AuthDialog open={dialogOpen} onClose={onDialogClose} />
		</AuthCtx.Provider>
	);
}

function useAuth() {
	return useContext(AuthCtx);
}

window.Lab.AuthProvider = AuthProvider;
window.Lab.useAuth = useAuth;
