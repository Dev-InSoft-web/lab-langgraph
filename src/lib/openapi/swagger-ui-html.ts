/** HTML Swagger UI (CDN) — apunta a openapi.json en el mismo host /api. */
export function swaggerUiHtml(openApiJsonUrl: string): string {
	const specUrl = openApiJsonUrl.replace(/"/g, "&quot;");
	return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>lab-langgraph API</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css"/>
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-bundle.js" crossorigin></script>
<script>
window.onload = function () {
  window.ui = SwaggerUIBundle({
    url: "${specUrl}",
    dom_id: "#swagger-ui",
    deepLinking: true,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
    layout: "StandaloneLayout"
  });
};
</script>
</body>
</html>`;
}
