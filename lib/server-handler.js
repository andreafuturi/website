import { serveDir } from "https://deno.land/std/http/file_server.ts";
import { ErrorComponent } from "./framework-utils.jsx";
import { createRouter } from "./serverside-router.js";

// Error handler helper
const createErrorHandler = renderFunction => async error =>
  new Response(await renderFunction(ErrorComponent({ error })), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });

// Static file handler
const handleStaticFiles = async (req, options = {}) => {
  const { pathname } = new URL(req.url);
  if (!pathname.endsWith(".jsx") && !pathname.startsWith("/vite.config.js")) {
    return await serveDir(req, {
      fsRoot: options.staticDir || "client/",
      urlRoot: "",
    });
  }
  return new Response("Not Found");
};

/**
 * @typedef {Object} ServerConfig
 * @property {Function} RootComponent - Main app component
 * @property {Function} renderFunction - Server-side rendering function
 * @property {string} [staticAssetsDirectory="client/"] - Static assets location
 * @property {Function} [devMiddleware=null] - Development middleware
 * @property {Object} [routingConfig] - Routing configuration
 */

/**
 * @param {ServerConfig} config
 */
export const createServerHandler = ({
  RootComponent,
  routingConfig = null,
  devMiddleware = null,
  staticAssetsDirectory = new URL("../client", import.meta.url).pathname,
  renderFunction,
}) => {
  console.log("📁 Static Assets Directory:", staticAssetsDirectory);
  const handleError = createErrorHandler(renderFunction);
  // Create router instance if options provided
  const router = routingConfig
    ? createRouter({
        ...routingConfig,
        RootComponent,
        renderFunction,
        handleError,
        handleStaticFiles: req => handleStaticFiles(req, { staticDir: staticAssetsDirectory }),
      })
    : null;

  return async req => {
    try {
      //set globalthis location to the current path
      const path = new URL(req.url).pathname.slice(1).replace(/\/+$/, "");
      globalThis.location = { pathname: "/" + path };

      // Check middleware first if provided
      if (devMiddleware) {
        const middlewareResponse = devMiddleware(req);
        if (middlewareResponse) return middlewareResponse;
      }

      // Use router if provided, otherwise render single page
      if (router) {
        try {
          const response = await router(req);
          if (response) return response;
        } catch (error) {
          //route failed let's try static files
          const staticResponse = await handleStaticFiles(req, { staticDir: staticAssetsDirectory });
          if (staticResponse) return staticResponse;
        }
      } else {
        // Simple single page rendering and static files
        if (req.url.includes(".")) {
          const staticResponse = await handleStaticFiles(req, { staticDir: staticAssetsDirectory });
          if (staticResponse) return staticResponse;
        }
        return new Response(await renderFunction(await RootComponent({ children: null })), {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
    } catch (error) {
      return handleError(error);
    }
  };
};
