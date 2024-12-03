import { refresh } from "https://deno.land/x/refresh/mod.ts";
import { parse } from "https://deno.land/std/flags/mod.ts";
import { render } from "https://esm.sh/preact-render-to-string?deps=preact";
import App from "../client/index.jsx";
import { createServerHandler } from "../lib/server-handler.js";

// Parse CLI args
const args = parse(Deno.args);
globalThis.dev = args.dev;

// Setup configuration -> main app index jsx, dev mode, static files directory,  middleware for dev auto refreshing
const serverConfig = {
  RootComponent: App,
  renderFunction: render,
  staticAssetsDirectory: new URL("../client", import.meta.url).pathname,
  devMiddleware: globalThis.dev ? refresh() : null,
  routingConfig: {
    apiEndpointsPath: new URL("./api", import.meta.url).pathname,
    pagesDirectory: new URL("../client", import.meta.url).pathname,
    isDevelopmentMode: globalThis.dev,
  },
};

// Create and start server
const handler = createServerHandler(serverConfig);
Deno.serve(handler);
