import { app } from "@azure/functions";
import { preloadIsaDocSecrets } from "./lib/core/secrets.js";

preloadIsaDocSecrets();

app.setup({ enableHttpStream: true });
