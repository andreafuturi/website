import { startRouter } from "https://esm.sh/lightweight-router?debug=true";
import hydrateInteractiveComponents from "../lib/hydration.jsx";

// Load the scroll-driven animations polyfill only in browsers that lack native support.
// After load, re-run initSpiralMorph — it is inlined as a plain script tag (SSR) and
// executes before this module, so ViewTimeline is still undefined when it first runs.
if (typeof CSS !== "undefined" && !CSS.supports("animation-timeline", "view()")) {
  import("https://esm.sh/scroll-timeline-polyfill").then(() => {
    if (typeof globalThis.initSpiralMorph === "function") globalThis.initSpiralMorph();
  });
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
