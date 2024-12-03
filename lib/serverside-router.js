const CONTENT_TYPES = {
  json: "application/json; charset=utf-8",
  html: "text/html; charset=utf-8",
  js: "application/javascript; charset=utf-8",
};

// Create route manager factory function 🏭
function createRouteManager(basePath, extension, excludeFiles = []) {
  const routes = new Map();
  const isDev = globalThis.dev;

  // Helper to check if route is dynamic 🎯
  function isDynamicRoute(path) {
    return path.includes(":");
  }

  // Helper to match dynamic routes 🔍
  function matchDynamicRoute(routePath, requestPath) {
    const routeParts = routePath.split("/");
    const requestParts = requestPath.split("/");

    if (routeParts.length !== requestParts.length) return null;

    const params = {};

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(":")) {
        // Extract parameter
        const paramName = routeParts[i].slice(1);
        params[paramName] = requestParts[i];
      } else if (routeParts[i] !== requestParts[i]) {
        return null;
      }
    }

    return params;
  }

  // Dynamic route resolver for dev mode 🔄
  async function resolveRoute(path) {
    const tryPath = async fullPath => {
      try {
        await Deno.stat(fullPath);
        const module = await import(fullPath);
        return module.default;
      } catch {
        return null;
      }
    };

    // First try exact match
    const filePath = `${basePath}/${path}${extension}`;
    const folderPath = `${basePath}/${path}/${path}${extension}`;
    const exactMatch = (await tryPath(filePath)) || (await tryPath(folderPath));
    if (exactMatch) return { handler: exactMatch };

    // Try dynamic routes
    const dynamicPath = path.split("/");
    const lastPart = dynamicPath.pop();
    const parentPath = dynamicPath.join("/");

    // Check for :id.jsx file
    const dynamicFilePath = `${basePath}/${parentPath ? parentPath + "/" : ""}:id${extension}`;
    const dynamicHandler = await tryPath(dynamicFilePath);
    if (dynamicHandler) {
      return {
        handler: dynamicHandler,
        params: { id: lastPart },
      };
    }

    return null;
  }

  // Scan routes for production mode 📦
  async function scanRoutes() {
    const scan = async dir => {
      console.log("🔍 Scanning directory:", dir);
      for await (const entry of Deno.readDir(dir)) {
        const fullPath = `${dir}/${entry.name}`;
        console.log("📄 Found entry:", fullPath);
        if (entry.isDirectory) {
          // Check for folder/file pattern first
          const folderMatchPath = `${fullPath}/${entry.name}${extension}`;
          try {
            const stat = await Deno.stat(folderMatchPath);
            if (stat.isFile && !excludeFiles.includes(entry.name + extension)) {
              const routePath = entry.name;
              const module = await import(folderMatchPath);
              routes.set(routePath, module.default);
            }
          } catch {
            // If folder/file pattern doesn't exist, scan the directory normally
            await scan(fullPath);
          }
          continue;
        }

        if (!entry.isFile || !entry.name.endsWith(extension) || excludeFiles.includes(entry.name)) continue;

        const routePath = fullPath.slice(basePath.length + 1, -extension.length);
        const module = await import(fullPath);
        routes.set(routePath, module.default);
      }
    };

    await scan(basePath);
    console.log(`🚀 Routes loaded for ${extension}:`, routes);
  }

  // Get route handler (cached in prod, dynamic in dev) 🎯
  async function getHandler(path) {
    const normalizedPath = path || "home";

    if (isDev) {
      return await resolveRoute(normalizedPath);
    }

    if (routes.size === 0) {
      await scanRoutes();
    }

    // Check exact matches first
    const exactMatch = routes.get(normalizedPath);
    if (exactMatch) return { handler: exactMatch };

    // Check dynamic routes
    for (const [routePath, handler] of routes.entries()) {
      if (isDynamicRoute(routePath)) {
        const params = matchDynamicRoute(routePath, normalizedPath);
        if (params) {
          return { handler, params };
        }
      }
    }

    return null;
  }

  return { getHandler };
}

/**
 * Creates main router handler 🌐
 * @param {Object} config Router configuration
 */
export function createRouter({
  apiEndpointsPath = new URL(".", import.meta.url).pathname,
  pagesDirectory = new URL(".", import.meta.url).pathname + "../client",
  renderFunction,
  RootComponent,
  isDevelopmentMode = false,
  handleError,
  handleStaticFiles,
} = {}) {
  const apiManager = createRouteManager(apiEndpointsPath, ".js");
  const pageManager = createRouteManager(pagesDirectory, ".jsx", ["main.jsx", "index.jsx"]);
  globalThis.dev = isDevelopmentMode;

  return async function handleRequest(req) {
    globalThis.importedResources = new Set();

    try {
      const path = new URL(req.url).pathname.slice(1).replace(/\/+$/, "");
      globalThis.location = { pathname: "/" + path };

      const body = await req.text().then(text => {
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      });
      // Add this near the handleRequest function
      if (path === "debug-paths") {
        return new Response(
          JSON.stringify({
            cwd: Deno.cwd(),
            pagesDirectory,
            apiEndpointsPath,
            files: [...Deno.readDirSync(pagesDirectory)].map(f => f.name),
          }),
          {
            headers: { "content-type": "application/json" },
          }
        );
      }

      if (path.startsWith("api/")) {
        const apiPath = path.slice(4);
        const handler = await apiManager.getHandler(apiPath);
        if (!handler) throw new Error(`API route not found: ${apiPath}`);

        const result = await handler(body, req);
        return new Response(JSON.stringify(result), {
          headers: { "content-type": CONTENT_TYPES.json },
        });
      }

      // Handle page routes
      const normalizedPath = path || "home";
      const routeMatch = await pageManager.getHandler(normalizedPath);

      // Try static files if no page route found 🔄
      if (!routeMatch && handleStaticFiles) {
        return await handleStaticFiles(req);
      }

      if (!routeMatch) throw new Error(`Page not found: ${normalizedPath}`);

      const { handler: Page, params } = routeMatch;

      if (body === "onlyRoute") {
        return new Response(await renderFunction(await Page({ params, originRequest: req, ...body })), { headers: { "content-type": CONTENT_TYPES.js } });
      }

      const html = await renderFunction(
        await RootComponent({
          children: await Page({ params, originRequest: req, ...body }),
        })
      );

      return new Response((isDevelopmentMode ? "<!DOCTYPE html><script>globalThis.dev=true</script>" : "<!DOCTYPE html>") + html, {
        headers: { "content-type": CONTENT_TYPES.html },
      });
    } catch (error) {
      console.error("🚨 Router Error:", error);
      return handleError(error);
    }
  };
}
