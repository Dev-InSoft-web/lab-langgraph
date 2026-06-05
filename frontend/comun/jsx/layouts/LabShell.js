const { useState } = React;
const {
	Box, AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemText, ListItemIcon, IconButton, Divider, Button, Chip,
} = window.Lab.mui;
const { useAuth } = window.Lab;
const { getApiBase } = window.Lab.api;

const DRAWER_W = 260;
const NAV = [
	{ id: "fitdocs", label: "FitDocs RAG", icon: "fa-file-pdf" },
	{ id: "conversaciones", label: "Lab conversaciones", icon: "fa-comments" },
	{ id: "diagramas", label: "Diagramas", icon: "fa-diagram-project" },
];

function LabShell({ page, onPage, children }) {
	const [open, setOpen] = useState(true);
	const { isAuthenticated, username, openAuth, logout } = useAuth();
	const apiHost = getApiBase().replace(/\/api$/, "");

	return (
		<Box sx={{ display: "flex", minHeight: "100vh" }}>
			<AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
				<Toolbar>
					<IconButton color="inherit" edge="start" onClick={() => setOpen((v) => !v)}>
						<i className="fa-solid fa-bars" />
					</IconButton>
					<Typography variant="h6" sx={{ flexGrow: 1 }}>
						lab-langgraph
					</Typography>
					{isAuthenticated ? (
						<>
							<Chip size="small" label={username || "lab"} color="success" variant="outlined" sx={{ mr: 1 }} />
							<Button color="inherit" size="small" onClick={logout}>
								<i className="fa-solid fa-right-from-bracket" /> Salir
							</Button>
						</>
					) : (
						<Button color="inherit" size="small" variant="outlined" onClick={() => openAuth()}>
							<i className="fa-solid fa-key" /> Auth lab
						</Button>
					)}
				</Toolbar>
			</AppBar>
			<Drawer variant="persistent" open={open} sx={{ width: open ? DRAWER_W : 0, "& .MuiDrawer-paper": { width: DRAWER_W, top: 64 } }}>
				<Toolbar />
				<Divider />
				<List>
					{NAV.map((item) =>
						item.external ? (
							<ListItemButton key={item.label} component="a" href={item.href} target="_blank" rel="noopener">
								<ListItemIcon><i className={`fa-solid ${item.icon}`} /></ListItemIcon>
								<ListItemText primary={item.label} />
							</ListItemButton>
						) : (
							<ListItemButton key={item.id} selected={page === item.id} onClick={() => onPage(item.id)}>
								<ListItemIcon><i className={`fa-solid ${item.icon}`} /></ListItemIcon>
								<ListItemText primary={item.label} />
							</ListItemButton>
						),
					)}
					<ListItemButton component="a" href={`${apiHost}/api/docs`} target="_blank" rel="noopener">
						<ListItemIcon><i className="fa-solid fa-code" /></ListItemIcon>
						<ListItemText primary="Swagger API" />
					</ListItemButton>
				</List>
			</Drawer>
			<Box component="main" sx={{ flexGrow: 1, p: 2, mt: 8 }}>
				{children}
			</Box>
		</Box>
	);
}

window.Lab.LabShell = LabShell;
