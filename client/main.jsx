import { startRouter } from "https://esm.sh/lightweight-router?debug=true";
import hydrateInteractiveComponents from "../lib/hydration.jsx";

// Load the scroll-driven animations polyfill only in browsers that lack native support.
// Uses <script> tag injection (not dynamic import) because the polyfill is a classic script, not an ES module.
if (typeof CSS === "undefined" || !CSS.supports("animation-timeline", "view()")) {
  const script = document.createElement("script");
  script.src = "https://flackr.github.io/scroll-timeline/dist/scroll-timeline.js";
  document.head.appendChild(script);
}

const interactiveComponents = [];

startRouter({
  debug: false,
  intersectionThreshold: 0.15,
  onRouteChange: currentPath => {
    //not needed?
    globalThis.dispatchEvent(new CustomEvent("app:route", { detail: { path: currentPath } }));
    document.body.className = currentPath === "/" ? "" : currentPath.slice(1);
    hydrateInteractiveComponents(document.querySelector(`route[path="${currentPath}"]`), interactiveComponents);
  },
});

//CLIENT HYDRATION
hydrateInteractiveComponents(document, interactiveComponents);

//This file is optional, it's used to setup an SPA like client navigation and hydrate eventual interactive components
