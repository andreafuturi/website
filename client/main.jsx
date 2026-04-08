import { startRouter } from "https://esm.sh/lightweight-router?debug=true";
import hydrateInteractiveComponents from "../lib/hydration.jsx";

// DEBUG: Load the scroll-driven animations polyfill only in browsers that lack native support.
const hasCSS = typeof CSS !== "undefined";
const supportsTimeline = hasCSS && CSS.supports("animation-timeline", "view()");
alert(`CSS exists: ${hasCSS}\nSupports timeline: ${supportsTimeline}`);

if (typeof CSS === "undefined" || !CSS.supports("animation-timeline", "view()")) {
  alert("Loading polyfill...");
  import("https://cdn.jsdelivr.net/npm/@webkit/scroll-timeline-polyfill@0.1.5/dist/scroll-timeline-polyfill.min.js").then(() => {
    alert("Polyfill loaded!");
  }).catch(err => {
    alert(`Polyfill error: ${err}`);
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
