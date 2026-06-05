const { Box, Typography, Paper } = window.Lab.mui;

function LabPage({ title, subtitle, actions, children }) {
	return (
		<Box sx={{ maxWidth: 1200, mx: "auto" }}>
			<Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, gap: 2 }}>
				<Box>
					<Typography variant="h5" fontWeight={700}>
						{title}
					</Typography>
					{subtitle && (
						<Typography variant="body2" color="text.secondary">
							{subtitle}
						</Typography>
					)}
				</Box>
				{actions}
			</Box>
			<Paper variant="outlined" sx={{ p: 2 }}>
				{children}
			</Paper>
		</Box>
	);
}

window.Lab.LabPage = LabPage;
