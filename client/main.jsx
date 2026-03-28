import { startRouter } from "https://esm.sh/lightweight-router?debug=true";
import { pathToBodyClass } from "../lib/framework-utils.jsx";
import hydrateInteractiveComponents from "../lib/hydration.jsx";

const interactiveComponents = [];

startRouter({
  debug: false,
  onRouteChange: currentPath => {
    globalThis.dispatchEvent(new CustomEvent("app:route", { detail: { path: currentPath } }));
    document.body.className = pathToBodyClass(currentPath);
    hydrateInteractiveComponents(document.querySelector(`route[path="${currentPath}"]`), interactiveComponents);
  },
});

//CLIENT HYDRATION
hydrateInteractiveComponents(document, interactiveComponents);

//This file is optional, it's used to setup an SPA like client navigation and hydrate eventual interactive components
