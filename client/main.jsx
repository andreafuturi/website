import { startRouter } from "https://esm.sh/lightweight-router?debug=true";
import hydrateInteractiveComponents from "../lib/hydration.jsx";

const interactiveComponents = [];

/** Sync nav .active with the address bar (scroll routes use replaceState — no popstate) 🔗 */
function syncMenuActiveFromLocation() {
  const pathname = globalThis.location.pathname;
  for (const link of document.querySelectorAll("nav a")) {
    link.classList.toggle("active", new URL(link.href).pathname === pathname);
  }
}

startRouter({
  debug: false,
  onRouteChange: currentPath => {
    hydrateInteractiveComponents(document.querySelector(`route[path="${currentPath}"]`), interactiveComponents);
    syncMenuActiveFromLocation();
  },
});

//CLIENT HYDRATION
hydrateInteractiveComponents(document, interactiveComponents);

//This file is optional, it's used to setup an SPA like client navigation and hydrate eventual interactive components
