import { inlineImport } from "../../lib/framework-utils.jsx";

const carrefourLogo = inlineImport({ src: "../components/companies/carrefour.svg" });
const recrowdLogo = inlineImport({ src: "../components/companies/recrowd.svg" });
const worldyLogo = inlineImport({ src: "../components/companies/worldy.svg" });
const gustirariLogo = inlineImport({ src: "../components/companies/gustirari.svg" });
function Home() {
  return (
    <home>
      {inlineImport({ src: "home.css" })}
      <img width={565} height={440} src="./images/hero.webp" alt="hero" />
      <herotexts>
        <ul class="texteffect" role="list" aria-label="Rotating names in different languages">
          <li>アンドレア フトゥリ</li>
          <li>Ανδρέα φουτούρι</li>
          <li>Андреа Футури</li>
          <li>Andrea Futuri</li>
          <li>אנדראה פוטורי</li>
          <li>안드레아 푸투리</li>
          <li>แอนเดรีย ฟูตูรี</li>
          <li>‎فوتوري ‎أندريا</li>
          <li>आन्द्रेआ फुटुरी</li>
          <li>Ανδρέα φουτούρι</li>
        </ul>
        <h1>
          APPS <br /> WEBSITES <br /> AI AUTOMATIONS
        </h1>
        <p>Helping startups and founders build the future</p>
      </herotexts>

      <cta>
        <companies>
          <small class="center">Trusted by +10 companies</small>
          <logos>{[carrefourLogo, recrowdLogo, gustirariLogo, worldyLogo]}</logos>
        </companies>
        <a class="cta">Book a call now</a>
      </cta>
      {inlineImport({ src: initTextScroll, selfExecute: true })}
      {/* {inlineImport({ src: initTextScramble, selfExecute: true })} */}
    </home>
  );
}

// Simplified text scramble animation 🎭
function initTextScroll() {
  const ul = document.querySelector("ul.texteffect");
  if (!ul) return;
  const height = ul.clientHeight;

  async function scroll() {
    // Check if we're near the end
    const isNearEnd = ul.scrollTop + ul.clientHeight >= ul.scrollHeight - height / 2;
    if (isNearEnd) {
      const firstItem = ul.children[0].cloneNode(true);
      ul.appendChild(firstItem);
      ul.children[0].remove();
    }
    ul.scrollBy({ top: height / 10 });
  }
  // Initial setup
  ul.style.scrollBehavior = "smooth";
  setInterval(scroll, 3000);
}

export default Home;
