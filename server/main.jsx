import { refresh } from "https://deno.land/x/refresh/mod.ts";
import { parse } from "https://deno.land/std/flags/mod.ts";
import { render } from "https://esm.sh/preact-render-to-string?deps=preact";
import App from "../client/index.jsx";
import { createServerHandler } from "../lib/server-handler.js";

// Import all route components statically
import Home from "../client/home/home.jsx";
import About from "../client/about/about.jsx";

// Parse CLI args
const args = parse(Deno.args);
globalThis.dev = args.dev;

// Define static routes map 🗺️
const routes = {
  home: Home,
  about: About,
  // Add other routes here
};

// Setup configuration
const serverConfig = {
  RootComponent: App,
  renderFunction: render,
  staticAssetsDirectory: "client/",
  devMiddleware: globalThis.dev ? refresh() : null,
  routingConfig: {
    apiEndpointsPath: new URL(".", import.meta.url).pathname + "api",
    pagesDirectory: new URL(".", import.meta.url).pathname + "../client",
    isDevelopmentMode: globalThis.dev,
    // Add predefined routes
    routes: routes,
  },
};

// Create and start server
const handler = createServerHandler(serverConfig);
Deno.serve(handler);
