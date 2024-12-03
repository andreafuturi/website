import { hydrate } from "https://esm.sh/preact";
import { registerComponent } from "./framework-utils.jsx";

const interactiveComponents = [];
const hydratedComponents = new Set();

const hydrateInteractiveComponents = (elementNode, components) => {
  console.log("🔄 Starting hydration process...");

  // Save original content of static elements
  const preserveServerOnlyContent = root => {
    const serverOnlyElements = (root || document).querySelectorAll("static");
    serverOnlyElements.forEach(el => {
      // Save original content immediately after hydration
      const originalContent = el.innerHTML;
      queueMicrotask(() => {
        el.innerHTML = originalContent;
      });
    });
  };

  if (components) {
    components.forEach(Component => {
      const componentId = Component.__componentId || registerComponent(Component);
      Component.__componentId = componentId;

      if (!interactiveComponents.some(c => c.id === componentId)) {
        console.log(`➕ Registering new component: ${componentId}`);
        interactiveComponents.push({
          id: componentId,
          function: Component,
        });
      }
    });
  }

  const observer = new IntersectionObserver(async entries => {
    entries.forEach(async entry => {
      const { target } = entry;
      if (hydratedComponents.has(target.id)) return;

      const component = interactiveComponents.find(c => target.getAttribute("data-component") === c.id);

      if (entry.isIntersecting && component) {
        const props = JSON.parse(target.getAttribute("props") || "{}");
        preserveServerOnlyContent(target);
        const ComponentToHydrate = component.function;
        hydrate(<ComponentToHydrate {...props} />, target);
        hydratedComponents.add(target.id);
      }
    });
  });

  interactiveComponents.forEach(({ id }) => {
    const elements = (elementNode || document).querySelectorAll(`interactive[data-component="${id}"]`);
    elements.forEach(el => {
      if (!hydratedComponents.has(el.id)) {
        observer.observe(el);
      }
    });
  });
};

export default hydrateInteractiveComponents;
