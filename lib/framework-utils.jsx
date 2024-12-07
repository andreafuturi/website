const ClientOnly = ({ children }) => {
  return typeof document !== "undefined" ? children : null;
};
function IndexCss({ isDev = false }) {
  return <link rel="stylesheet" href={`/${!isDev ? "dist/assets/" : ""}index.css`} />;
}

const COMPONENT_REGISTRY = new Map();
let componentCounter = 0;
export const registerComponent = Component => {
  const id = `c${componentCounter++}`;
  COMPONENT_REGISTRY.set(id, Component);
  return id;
};
/**
 * HOC to prevent component hydration 🛡️
 */
export const withoutHydration = WrappedComponent => {
  const WithoutHydration = props => {
    return <static>{WrappedComponent(props)}</static>;
  };
  WithoutHydration.displayName = `WithoutHydration(${WrappedComponent.name})`;
  return WithoutHydration;
};

export const inlineImport = withoutHydration(({ src, selfExecute, perInstance = false }) => {
  if (typeof Deno === "undefined") return null;
  const stackLines = new Error().stack.split("\n");
  // Look for the caller's location (second line in the stack) 🔍
  const callerLine = stackLines[3] || ""; // Index 3 because: [0] is Error, [1] is newImport, [2] is framework-utils, [3] is caller
  const filePathMatch = callerLine.match(/file:\/\/\/(.*?\.jsx?):/);
  const filePath = filePathMatch ? filePathMatch[1] : "Unknown path";
  const fileDir = filePath.split("/").slice(0, -1).join("/");
  const relativePath = ("/" + fileDir).replace(Deno.cwd(), "");
  try {
    // Initialize tracking Set if not exists 🔄
    globalThis.importedResources = globalThis.importedResources || new Set();

    // Generate unique key for functions or use src path 🔑
    const resourceKey = typeof src === "function" ? src.toString() : src;

    // Check if already imported ✨
    if (globalThis.importedResources.has(resourceKey) && !perInstance) {
      return null;
    }

    globalThis.importedResources.add(resourceKey);

    // Handle different import types
    if (typeof src === "function") return <script dangerouslySetInnerHTML={{ __html: src.toString() + (selfExecute ? `${src.name}()` : "") }} />;
    if (src.startsWith("http")) return <script rel="preconnect" type="module" src={src} />;

    // Handle file imports with error handling 🛡️
    if (src.endsWith(".css") || src.endsWith(".js") || src.endsWith(".svg")) {
      try {
        const filePath = Deno.cwd() + relativePath + "/" + src;
        const content = Deno.readTextFileSync(filePath).replaceAll('"', "'");

        // Handle different file types 📁
        if (src.endsWith(".css")) return <style>{content}</style>;
        if (src.endsWith(".js")) return <script>{content}</script>;
        if (src.endsWith(".svg")) return <figure dangerouslySetInnerHTML={{ __html: content }} />;
      } catch (err) {
        console.error(`🚨 Failed to read file ${src}:`, err);
        return <ErrorComponent error={`Failed to load resource: ${src}`} />;
      }
    }
  } catch (err) {
    console.error("🚨 Import component error:", err);
    return <ErrorComponent error={`Failed to process import: ${err.message}`} />;
  }
});

function MainJsx({ isDev = false }) {
  return (
    <>
      {isDev && <meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-inline' 'unsafe-eval' *;" />}
      <script rel="preconnect" type="module" crossorigin src={isDev ? "http://localhost:3456/main.jsx" : "/dist/assets/index.js"}></script>
      {isDev && <script>{fastrefresh}</script>}
    </>
  );
}
const fastrefresh = `((l) => {
  let w, i;

  function d(m) {
    console.info('[refresh] ', m);
  }

  function r() {
    l.reload();
  }

  function s(f) {
    if (w) w.close();
    w = new WebSocket(l.origin.replace('http', 'ws')+'/_r');
    w.addEventListener('open', f);
    w.addEventListener('message', () => {
      d('reloading...');
      r();
    });
    w.addEventListener('close', () => {
      d('connection lost - reconnecting...');
      clearTimeout(i);
      i = setTimeout(() => s(r), 1000);
    });
  }

  s();
})(location);`;

function updateDocumentTitle() {
  try {
    document.title = addRouteTitle("App Name");
  } catch (err) {
    console.error("🚨 Failed to update document title:", err);
  }
}
function handleRouteChange() {
  try {
    globalThis.addEventListener("popstate", updateDocumentTitle);
  } catch (err) {
    console.error("🚨 Failed to add route change handler:", err);
  }
}
function addRouteTitle(appTitle) {
  let path = globalThis.location.pathname.split("/").filter(Boolean);
  let title = path.length ? path[0] : "home";
  return title.charAt(0).toUpperCase() + title.slice(1) + " | " + appTitle;
}
const Title = ({ children }) => (
  <>
    <title>{addRouteTitle(children)}</title>
    {inlineImport({ src: addRouteTitle })}
    {inlineImport({ src: updateDocumentTitle })}
    {inlineImport({ src: handleRouteChange, selfExecute: true })}
  </>
);
//Error component
function ErrorComponent({ error }) {
  return (
    <div style="text-align:center;font-family:system-ui;margin-top:50vh">
      <span style="color:red">${error}</span>
      <br />
      <span>${error.stack || "No additional details available."}</span>
    </div>
  );
}
export { ClientOnly, IndexCss, MainJsx, Title, ErrorComponent };
