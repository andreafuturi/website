import { startRouter } from "https://esm.sh/lightweight-router?debug=true";
import hydrateInteractiveComponents from "../lib/hydration.jsx";

// Load the scroll-driven animations polyfill only in browsers that lack native support.
// Uses <script> tag injection (not dynamic import) because the polyfill is a classic script, not an ES module.
const _cssSupports = typeof CSS !== "undefined" && CSS.supports("animation-timeline", "view()");
alert("DEBUG: CSS defined=" + (typeof CSS !== "undefined") + " | supports animation-timeline=" + _cssSupports + " | UA=" + navigator.userAgent);
if (!_cssSupports) {
  alert("DEBUG: injecting polyfill script...");
  const script = document.createElement("script");
  script.src = "https://flackr.github.io/scroll-timeline/dist/scroll-timeline.js";
  script.onload = () => alert("DEBUG: polyfill loaded OK");
  script.onerror = (e) => alert("DEBUG: polyfill FAILED to load: " + e);
  document.head.appendChild(script);
} else {
  alert("DEBUG: native support detected, polyfill skipped");
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
