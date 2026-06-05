import { CAESAR_TRANSPORT_PREFIX, CAESAR_TRANSPORT_SUFFIX } from "../auth/caesar-transport.js";

/** HTML Swagger UI (CDN jsdelivr) — apunta a openapi.json en el mismo host /api. */
export function swaggerUiHtml(openApiJsonUrl: string): string {
	const specUrl = openApiJsonUrl.replace(/"/g, "&quot;");
	const prefix = CAESAR_TRANSPORT_PREFIX.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
	const suffix = CAESAR_TRANSPORT_SUFFIX.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
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
  var PREFIX = "${prefix}";
  var SUFFIX = "${suffix}";

  function caesarShiftForDate(d) {
    return d.getUTCDate();
  }

  function caesarEncode(text, shift) {
    return text.split("").map(function (c) {
      var code = c.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + shift) % 26) + 65);
      }
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + shift) % 26) + 97);
      }
      return c;
    }).join("");
  }

  function caesarDecode(text, shift) {
    return caesarEncode(text, 26 - (shift % 26));
  }

  function isWrappedTransport(encoded, shift) {
    var decoded = caesarDecode(encoded, shift);
    return decoded.indexOf(PREFIX) === 0 && decoded.slice(-SUFFIX.length) === SUFFIX;
  }

  function wrapPassword(plain) {
    if (!plain) return plain;
    var shift = caesarShiftForDate(new Date());
    if (isWrappedTransport(plain, shift)) return plain;
    return caesarEncode(PREFIX + plain + SUFFIX, shift);
  }

  if (typeof SwaggerUIBundle === "undefined" || typeof SwaggerUIStandalonePreset === "undefined") {
    document.getElementById("swagger-fallback").style.display = "block";
    return;
  }

  window.ui = SwaggerUIBundle({
    url: specUrl,
    dom_id: "#swagger-ui",
    deepLinking: true,
    persistAuthorization: true,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    layout: "StandaloneLayout",
    requestInterceptor: function (req) {
      if (req.method === "POST" && req.url && req.url.indexOf("/auth/token") !== -1 && req.body) {
        try {
          var body = JSON.parse(req.body);
          if (body.password) {
            body.password = wrapPassword(String(body.password));
            req.body = JSON.stringify(body);
          }
        } catch (e) { /* ignore */ }
      }
      return req;
    },
    onFailure: function () {
      document.getElementById("swagger-fallback").style.display = "block";
    }
  });
})();
</script>
</body>
</html>`;
}
