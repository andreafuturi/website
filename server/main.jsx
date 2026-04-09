import { refresh } from "https://deno.land/x/refresh/mod.ts";
import { parse } from "https://deno.land/std/flags/mod.ts";
import { render } from "https://esm.sh/preact-render-to-string?deps=preact";
import App from "../client/index.jsx";
import { createServerHandler } from "../lib/server-handler.js";
// Parse CLI args
const args = parse(Deno.args);
globalThis.dev = args.dev;

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
  },
};

const handler = createServerHandler(serverConfig);
const formatServerUrls = (hostname, port) => {
  const localHost = hostname === "0.0.0.0" ? "localhost" : hostname;
  const urls = [`  Local:   http://${localHost}:${port}/`];

  if (hostname === "0.0.0.0") {
    for (const iface of Deno.networkInterfaces()) {
      if (iface.family !== "IPv4") {
        continue;
      }

      // Skip loopback and link-local addresses.
      if (iface.address.startsWith("127.") || iface.address.startsWith("169.254.")) {
        continue;
      }

      urls.push(`  Network: http://${iface.address}:${port}/`);
    }
  }

  return urls.join("\n");
};

const createListenOptions = (port) => ({
  hostname: "0.0.0.0",
  port,
  onListen: ({ hostname, port }) => {
    console.log(formatServerUrls(hostname, port));
  },
});

try {
  Deno.serve(createListenOptions(8000), handler);
} catch (e) {
  if (e instanceof Deno.errors.AddrInUse) {
    Deno.serve(createListenOptions(0), handler);
  } else {
    throw e;
  }
}