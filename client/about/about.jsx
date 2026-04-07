import { inlineImport } from "../../lib/framework-utils.jsx";
import Layout from "../components/tools/Layout.jsx";
import AboutSpiralPaths from "../components/patterns/spiral.jsx";

const creativityIcon = inlineImport({ src: "../components/icons/creativity.svg" });
const innovationIcon = inlineImport({ src: "../components/icons/innovation.svg" });
const minimalismIcon = inlineImport({ src: "../components/icons/minimalism.svg" });
const precisionIcon = inlineImport({ src: "../components/icons/precision.svg" });

/** Texture URL for the tiled fractal (same folder as this module) 🖼️ */
const ABOUT_FRACTAL_IMAGE_SRC = "./images/fractal.webp";
/**
 * Bitmap pixel size — refresh with `bash client/about/images/print-fractal-dimensions.sh`
 * (script prints values for pasting here).
 */
const ABOUT_FRACTAL_FILE_W = 853;
const ABOUT_FRACTAL_FILE_H = 1363;
/**
 * How big each repeat is in SVG space (only knob for density). `1` ≈ 1 file pixel → 1 user unit.
 * ↑ larger motifs / fewer tiles; ↓ denser. Keeps FILE_* in sync with the bitmap; scaling never breaks mirrors.
 */
const ABOUT_FRACTAL_TILE_SCALE = 0.7;
/** Bleed into neighbor quadrants so raster anti-aliasing doesn’t leave a hairline at mirror seams 🪒 */
const ABOUT_FRACTAL_SEAM_BLEED = 1;
/** One quadrant in user units = ½ file × scale (each <image> is slice-fit into this box) */
const ABOUT_FRACTAL_QUAD_W = (ABOUT_FRACTAL_FILE_W / 2) * ABOUT_FRACTAL_TILE_SCALE;
const ABOUT_FRACTAL_QUAD_H = (ABOUT_FRACTAL_FILE_H / 2) * ABOUT_FRACTAL_TILE_SCALE;
const ABOUT_FRACTAL_IMG_W = ABOUT_FRACTAL_QUAD_W + ABOUT_FRACTAL_SEAM_BLEED;
const ABOUT_FRACTAL_IMG_H = ABOUT_FRACTAL_QUAD_H + ABOUT_FRACTAL_SEAM_BLEED;
/** Mirror-cell: [A][flipH A] over [flipV][flipHV] — spans full bitmap once in a 2×2 mirror 🪞 */
const ABOUT_FRACTAL_CELL_W = ABOUT_FRACTAL_FILE_W * ABOUT_FRACTAL_TILE_SCALE;
const ABOUT_FRACTAL_CELL_H = ABOUT_FRACTAL_FILE_H * ABOUT_FRACTAL_TILE_SCALE;
/** Repeat period = 2× cell on X and Y so each edge meets a mirror, not a copy of the same edge (avoids “restart” seam) */
const ABOUT_FRACTAL_PATTERN_W = ABOUT_FRACTAL_CELL_W * 2;
const ABOUT_FRACTAL_PATTERN_H = ABOUT_FRACTAL_CELL_H * 2;

/** One mirror-cell: four quadrant images (same bitmap, flipH / flipV / both) */
function AboutFractalMirrorCell() {
  const src = ABOUT_FRACTAL_IMAGE_SRC;
  const w = ABOUT_FRACTAL_IMG_W;
  const h = ABOUT_FRACTAL_IMG_H;
  const cw = ABOUT_FRACTAL_CELL_W;
  const ch = ABOUT_FRACTAL_CELL_H;
  return (
    <>
      <image href={src} xlinkHref={src} width={w} height={h} x="0" y="0" preserveAspectRatio="xMidYMid slice" />
      <image
        href={src}
        xlinkHref={src}
        width={w}
        height={h}
        preserveAspectRatio="xMidYMid slice"
        transform={`translate(${cw},0) scale(-1,1)`}
      />
      <image
        href={src}
        xlinkHref={src}
        width={w}
        height={h}
        preserveAspectRatio="xMidYMid slice"
        transform={`translate(0,${ch}) scale(1,-1)`}
      />
      <image
        href={src}
        xlinkHref={src}
        width={w}
        height={h}
        preserveAspectRatio="xMidYMid slice"
        transform={`translate(${cw},${ch}) scale(-1,-1)`}
      />
    </>
  );
}

export default function About() {
  return (
    <about>
      {inlineImport({ src: "./about.css" })}
      <svg
        class="about-fractal-bg"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="about-fractal-mirror-checker"
            patternUnits="userSpaceOnUse"
            width={ABOUT_FRACTAL_PATTERN_W}
            height={ABOUT_FRACTAL_PATTERN_H}
            overflow="visible"
          >
            <AboutFractalMirrorCell />
            <g transform={`matrix(-1, 0, 0, 1, ${ABOUT_FRACTAL_PATTERN_W}, 0)`}>
              <AboutFractalMirrorCell />
            </g>
            <g transform={`matrix(1, 0, 0, -1, 0, ${ABOUT_FRACTAL_PATTERN_H})`}>
              <AboutFractalMirrorCell />
              <g transform={`matrix(-1, 0, 0, 1, ${ABOUT_FRACTAL_PATTERN_W}, 0)`}>
                <AboutFractalMirrorCell />
              </g>
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#about-fractal-mirror-checker)" />
      </svg>
      <first-values>
        <a class="center scroll-to-about flex-col" href="/about">
          <svg fill="currentColor" width="17" height="11" viewBox="0 0 17 11" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.48633 10.4004C8.73047 10.4004 8.97461 10.3027 9.14062 10.1172L16.6992 2.37305C16.8652 2.20703 16.9629 1.99219 16.9629 1.74805C16.9629 1.24023 16.582 0.849609 16.0742 0.849609C15.8301 0.849609 15.6055 0.947266 15.4395 1.10352L7.95898 8.75H9.00391L1.52344 1.10352C1.36719 0.947266 1.14258 0.849609 0.888672 0.849609C0.380859 0.849609 0 1.24023 0 1.74805C0 1.99219 0.0976562 2.20703 0.263672 2.38281L7.82227 10.1172C8.00781 10.3027 8.23242 10.4004 8.48633 10.4004Z" />
          </svg>
          {/* About */}
        </a>
        <h1>My Values</h1>
        <layout class="flex">
          <svg
            class="spiral about-values-graphic"
            viewBox="0 0 862778 929594"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
            width="40%"
          >
            <image
              href="/about/images/fractal-nobg.webp"
              xlinkHref="/about/images/fractal-nobg.webp"
              x="0"
              y="0"
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid meet"
            />
            <g transform="translate(404523, 434021)">
              <AboutSpiralPaths />
            </g>
          </svg>

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
      </first-values>
      <second-values>
        <svg viewBox="0 0 862778 929594" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" class="spiral about-spiral-backdrop about-second-spiral" aria-hidden="true"><g transform="translate(404523, 434021)">
            <AboutSpiralPaths />
          </g>
          </svg>
          <values>
            <value>
              {precisionIcon}
              <h3>Precision</h3>
              <p>As a perfectionist, I pursue the highest quality in every choice, ensuring each detail serves a purpose.</p>
            </value>
            <value>
              {minimalismIcon}
              <h3>Minimalism</h3>
              <p>Achieving more with less through thoughtful reduction and iterations.</p>
            </value>
          </values>
      </second-values>
    </about>
  );
}

/**
 * Scroll-driven SVG path morph via WAAPI + ViewTimeline 🌀
 * ⚠️ Must be self-contained — inlineImport serialises only this function via .toString()
 */
function initSpiralMorph() {
  if (typeof ViewTimeline === "undefined") return;
  requestAnimationFrame(() => {
    const aboutEl = document.querySelector("about");
    if (!aboutEl) return;
    const paths = aboutEl.querySelectorAll(".spiral path[data-to]");
    if (!paths.length) return;

    const cs = getComputedStyle(aboutEl);
    const rangeStart = `cover ${cs.getPropertyValue("--about-phase2-cover-start").trim() || "40%"}`;
    const rangeEnd = `cover ${cs.getPropertyValue("--about-phase2-cover-end").trim() || "65%"}`;

    const blockEnd = getComputedStyle(document.documentElement).getPropertyValue("--about-view-inset-block-end").trim();
    const inset = cs.getPropertyValue("view-timeline-inset").trim() || (blockEnd ? `0 ${blockEnd}` : "auto");

    const timeline = new ViewTimeline({ subject: aboutEl, axis: "block", inset });
    const animOpts = { timeline, rangeStart, rangeEnd, fill: "both" };

    for (const path of paths) {
      const fromD = path.getAttribute("d");
      const toD = path.dataset.to;
      path.animate([{ d: `path("${fromD}")` }, { d: `path("${toD}")` }], animOpts);
    }
  });
}
