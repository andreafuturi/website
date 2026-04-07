import { startRouter } from "https://esm.sh/lightweight-router?debug=true";
import hydrateInteractiveComponents from "../lib/hydration.jsx";

// Minimal polyfill for CSS scroll-driven animations (animation-timeline: view())
if (typeof CSS !== "undefined" && !CSS.supports("animation-timeline", "view()")) {
  const style = document.createElement("style");
  style.textContent = `
    header {
      transition:
        box-shadow var(--scroll-ui-transition-duration) var(--scroll-ui-transition-easing),
        background-color var(--scroll-ui-transition-duration) var(--scroll-ui-transition-easing),
        backdrop-filter var(--scroll-ui-transition-duration) var(--scroll-ui-transition-easing),
        -webkit-backdrop-filter var(--scroll-ui-transition-duration) var(--scroll-ui-transition-easing);
    }
    header .logo {
      left: var(--global-padding-inline);
      transform: translate(0, -50%);
      transition:
        left var(--scroll-ui-transition-duration) var(--scroll-ui-transition-easing),
        transform var(--scroll-ui-transition-duration) var(--scroll-ui-transition-easing);
    }
    header .header-cta {
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--scroll-ui-transition-duration) var(--scroll-ui-transition-easing);
    }
    about > svg.about-fractal-bg {
      transition:
        filter var(--scroll-ui-transition-duration) var(--scroll-ui-transition-easing),
        transform var(--scroll-ui-transition-duration) var(--scroll-ui-transition-easing);
    }
    about::after {
      transition: opacity var(--scroll-ui-transition-duration) var(--scroll-ui-transition-easing);
    }
    first-values h1,
    first-values p {
      transition: opacity var(--scroll-ui-transition-duration) var(--scroll-ui-transition-easing);
    }
    nav a {
      transition: color var(--scroll-ui-transition-duration) var(--scroll-ui-transition-easing);
    }
    body.about header {
      box-shadow: var(--header-bar-shadow);
      background-color: var(--header-bar-bg);
      backdrop-filter: blur(var(--header-bar-backdrop-blur));
      -webkit-backdrop-filter: blur(var(--header-bar-backdrop-blur));
    }
    body:not(.about) header .logo {
      left: 50%;
      transform: translate(-50%, -50%);
    }
    body.about header .header-cta {
      opacity: 1;
      pointer-events: auto;
    }
    body.about about > svg.about-fractal-bg {
      filter: blur(var(--about-fractal-blur-end));
      transform: scale(var(--about-fractal-scale-end));
    }
    body.about about::after {
      opacity: var(--fractal-veil-opacity-end);
    }
    body.about first-values h1,
    body.about first-values p {
      opacity: 1;
    }
    body.about .scroll-to-about {
      opacity: 0;
    }
  `;
  document.head.appendChild(style);

  // Drive body.about class from scroll position on the home page.
  // Matches animation-range "entry 0% cover 22%": trigger when about covers 22% of the viewport.
  const syncScrollState = () => {
    if (location.pathname !== "/") return;
    const about = document.querySelector("about");
    if (!about) return;
    const scrolledIn = about.getBoundingClientRect().top < window.innerHeight - about.offsetHeight * 0.22;
    document.body.classList.toggle("about", scrolledIn);
  };

  addEventListener("scroll", syncScrollState, { passive: true });
  addEventListener("app:route", syncScrollState);
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
