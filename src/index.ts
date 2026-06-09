import { app } from "@azure/functions";
import { preloadIsaDocSecrets } from "./lib/core/secrets.js";

preloadIsaDocSecrets();

app.setup({ enableHttpStream: true });

/** Registro explícito de HTTP triggers (el glob en package.json no siempre carga en Flex Linux). */
import "./functions/health.js";
import "./functions/swagger.js";
import "./functions/auth.js";
import "./functions/store.js";
import "./functions/catalog.js";
import "./functions/imgbbAssets.js";
import "./functions/ticketMermaid.js";
import "./functions/configConnections.js";
import "./functions/mssqlEndpoints.js";
import "./functions/labTools.js";
import "./functions/apiAgent.js";
import "./functions/askQuestion.js";
import "./functions/documents.js";
import "./functions/indexDocuments.js";
import "./functions/indexYoutube.js";
import "./functions/indexWeb.js";
import "./functions/resetIndex.js";
import "./functions/conversacion.js";
import "./functions/getConversacionById.js";
import "./functions/getConversacionLogs.js";
import "./functions/postConversacionTruncate.js";
import "./functions/conversaciones.js";
import "./functions/postMensaje.js";
import "./functions/postConversacionJailbreak.js";
import "./functions/getLanglabPrompts.js";
import "./functions/persistence.js";
import "./functions/orchestrator.js";
import "./functions/punctuateYoutube.js";
import "./functions/proofreadYoutube.js";
import "./functions/serveMedia.js";
import "./functions/signalRNegotiate.js";
import "./functions/signalRNotify.js";
import "./functions/backup.js";
import "./functions/bitacora.js";
