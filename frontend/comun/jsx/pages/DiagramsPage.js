const { Box, Typography, Paper, Link, Divider } = window.Lab.mui;
const LabPage = window.Lab.LabPage;

const DIAGRAMS = [
	{
		id: "patyia-conversation",
		title: "patyia-conversation",
		mmd: "diagrams/patyia-conversation.mmd",
		png: "diagrams/patyia-conversation.png",
	},
	{
		id: "youtube-proofread",
		title: "youtube-proofread",
		mmd: "diagrams/youtube-proofread.mmd",
		png: "diagrams/youtube-proofread.png",
	},
	{
		id: "orchestrator-cascade",
		title: "orchestrator-cascade",
		mmd: "diagrams/orchestrator-cascade.mmd",
		png: "diagrams/orchestrator-cascade.png",
	},
];

function DiagramsPage() {
	return (
		<LabPage
			title="Diagramas LangGraph"
			subtitle="Generados con npm run diagrams:render · rutas del SPA (?s= page diagramas)"
		>
			<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
				Fuentes <code>.mmd</code> en <code>frontend/diagrams/</code>. PNG si <code>mmdc</code> está disponible.
			</Typography>
			<Box component="nav" sx={{ mb: 2 }}>
				{DIAGRAMS.map((d) => (
					<Link key={d.id} href={`#${d.id}`} sx={{ mr: 2 }}>
						{d.title}
					</Link>
				))}
			</Box>
			{DIAGRAMS.map((d) => (
				<Paper key={d.id} id={d.id} sx={{ p: 2, mb: 3 }} variant="outlined">
					<Typography variant="h6" gutterBottom>
						{d.title}
					</Typography>
					<Typography variant="body2" sx={{ mb: 1 }}>
						<Link href={d.mmd} target="_blank" rel="noopener">
							{d.mmd}
						</Link>
					</Typography>
					<Box
						component="img"
						src={d.png}
						alt={d.title}
						sx={{ maxWidth: "100%", bgcolor: "#fff", borderRadius: 1 }}
						onError={(e) => {
							e.target.style.display = "none";
						}}
					/>
					<Divider sx={{ my: 1 }} />
					<Typography variant="caption" color="text.secondary">
						Sin PNG: abre el <code>.mmd</code> o ejecuta <code>npm run diagrams:render</code>.
					</Typography>
				</Paper>
			))}
		</LabPage>
	);
}

window.Lab.DiagramsPage = DiagramsPage;
