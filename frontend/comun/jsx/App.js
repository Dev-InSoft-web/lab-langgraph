const { useState, useEffect, useCallback } = React;
const { ThemeProvider, CssBaseline, labTheme } = window.Lab.mui;
const { AuthProvider } = window.Lab;
const LabShell = window.Lab.LabShell;
const FitDocsPage = window.Lab.FitDocsPage;
const ConversationPage = window.Lab.ConversationPage;
const DiagramsPage = window.Lab.DiagramsPage;
const { readState, patchState, onStateChange } = window.Lab.urlState;

const PAGES = ["fitdocs", "conversaciones", "diagramas"];

function initialPage() {
	const s = readState();
	return PAGES.includes(s.page) ? s.page : "fitdocs";
}

function App() {
	const [page, setPageInternal] = useState(initialPage);

	const setPage = useCallback((next) => {
		if (!PAGES.includes(next)) return;
		setPageInternal(next);
		const patch = { page: next };
		if (next !== "conversaciones") patch.conv = undefined;
		if (next !== "diagramas") patch.diagram = undefined;
		patchState(patch);
	}, []);

	useEffect(() => onStateChange(() => {
		const s = readState();
		if (s.page && PAGES.includes(s.page)) setPageInternal(s.page);
		else if (!s.page) setPageInternal("fitdocs");
	}), []);

	return (
		<ThemeProvider theme={labTheme}>
			<CssBaseline />
			<AuthProvider>
				<LabShell page={page} onPage={setPage}>
					{page === "fitdocs" && <FitDocsPage />}
					{page === "conversaciones" && <ConversationPage />}
					{page === "diagramas" && <DiagramsPage />}
				</LabShell>
			</AuthProvider>
		</ThemeProvider>
	);
}

window.Lab.App = App;
