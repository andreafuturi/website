import { inlineImport } from "../../lib/framework-utils.jsx";
import Layout from "../components/tools/Layout.jsx";
import CahoticSpiral from "../components/patterns/cahoticSprial.jsx";
import OrderedSpiral from "../components/patterns/orderedSpiral.jsx";

const creativityIcon = inlineImport({ src: "../components/icons/creativity.svg" });
const innovationIcon = inlineImport({ src: "../components/icons/innovation.svg" });
const minimalismIcon = inlineImport({ src: "../components/icons/minimalism.svg" });
const precisionIcon = inlineImport({ src: "../components/icons/precision.svg" });

export default function About() {
  const chaoticPath = CahoticSpiral();
  const orderedPath = OrderedSpiral();

  return (
    <>
    <about id="about">
      {inlineImport({ src: "./about.css" })}
        <a class="center scroll-to-about flex-col" href="/about">
          <svg fill="currentColor" width="17" height="11" viewBox="0 0 17 11" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.48633 10.4004C8.73047 10.4004 8.97461 10.3027 9.14062 10.1172L16.6992 2.37305C16.8652 2.20703 16.9629 1.99219 16.9629 1.74805C16.9629 1.24023 16.582 0.849609 16.0742 0.849609C15.8301 0.849609 15.6055 0.947266 15.4395 1.10352L7.95898 8.75H9.00391L1.52344 1.10352C1.36719 0.947266 1.14258 0.849609 0.888672 0.849609C0.380859 0.849609 0 1.24023 0 1.74805C0 1.99219 0.0976562 2.20703 0.263672 2.38281L7.82227 10.1172C8.00781 10.3027 8.23242 10.4004 8.48633 10.4004Z" />
          </svg>
          About
        </a>
        <h1>About me</h1>
        <p>My Values</p>
        <layout class="flex">
          <Layout class="spiral spiral-morph" width="50%" viewBoxWidth={862778} viewBoxHeight={929594} cover withLight>
            <path d={chaoticPath.props.d} data-to={orderedPath.props.d} />
          </Layout>
          {inlineImport({ src: initSpiralMorph, selfExecute: true })}
          <values>
            <value>
              {creativityIcon}
              <h3>Creativity</h3>
              <p>Crafting the future by mastering the power of chaos.</p>
            </value>
            <value>
              {innovationIcon}
              <h3>Innovation</h3>
              <p>
                With an open mind and adaptable approach, I design solutions that reimagine what&apos;s possible and lead the way to new standards.
              </p>
            </value>
          </values>
        </layout>
    </about>
      <about2>
      <values> 
      <value>
      {minimalismIcon}
        <h3>Minimalism</h3>
        <p>Achieving more with less through thoughtful reduction and iterations.</p>
      </value>
      <value>
        {precisionIcon}
        <h3>Precision</h3>
        <p>As a perfectionist, I pursue the highest quality in every choice, ensuring each detail serves a purpose.</p>
      </value>
      </values>
    </about2>
    </>
  );
}

/** Scroll-driven SVG path morph via WAAPI + ViewTimeline 🌀 */
function initSpiralMorph() {
  if (typeof ViewTimeline === "undefined") return;
  requestAnimationFrame(() => {
    const about = document.querySelector("about");
    if (!about) return;
    const path = about.querySelector(".spiral-morph path[data-to]");
    if (!path) return;

    path.animate(
      [{ d: `path("${path.getAttribute("d")}")` }, { d: `path("${path.dataset.to}")` }],
      {
        timeline: new ViewTimeline({ subject: about }),
        rangeStart: "entry 0%",
        rangeEnd: "contain 55%",
        fill: "both",
      }
    );
  });
}
