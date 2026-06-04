/** HTML Swagger UI (CDN jsdelivr) — apunta a openapi.json en el mismo host /api. */
export function swaggerUiHtml(openApiJsonUrl: string): string {
	const specUrl = openApiJsonUrl.replace(/"/g, "&quot;");
	return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>lab-langgraph API</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.18.2/swagger-ui.css"/>
</head>
<body>
<div id="swagger-ui"></div>
<p id="swagger-fallback" style="display:none;font-family:sans-serif;padding:1rem">
  No se pudo cargar Swagger UI. Abre la spec:
  <a href="${specUrl}">${specUrl}</a>
</p>
<script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.18.2/swagger-ui-bundle.js" crossorigin></script>
<script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.18.2/swagger-ui-standalone-preset.js" crossorigin></script>
<script>
(function () {
  var specUrl = "${specUrl}";
  if (typeof SwaggerUIBundle === "undefined" || typeof SwaggerUIStandalonePreset === "undefined") {
    document.getElementById("swagger-fallback").style.display = "block";
    return;
  }
  window.ui = SwaggerUIBundle({
    url: specUrl,
    dom_id: "#swagger-ui",
    deepLinking: true,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    layout: "StandaloneLayout",
    onFailure: function () {
      document.getElementById("swagger-fallback").style.display = "block";
    }
  });
})();
</script>
</body>
</html>`;
}
