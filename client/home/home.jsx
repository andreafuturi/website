import { inlineImport, Title } from "../../lib/framework-utils.jsx";

const carrefourLogo = inlineImport({ src: "../components/companies/carrefour.svg" });
const recrowdLogo = inlineImport({ src: "../components/companies/recrowd.svg" });
const worldyLogo = inlineImport({ src: "../components/companies/worldy.svg" });
const gustirariLogo = inlineImport({ src: "../components/companies/gustirari.svg" });
function Home() {
  return (
    <home id="home">
      <Title>Home</Title>
      {inlineImport({ src: "home.css" })}
      <img width={565} height={440} src="./images/hero.webp" alt="hero" />

      <RotatingNames />

      <h1>
        APPS <br /> WEBSITES <br /> AI AUTOMATIONS
      </h1>
      <p>Helping startups and founders build the future</p>

      <CompanySection logos={[carrefourLogo, recrowdLogo, gustirariLogo, worldyLogo]} />
    </home>
  );
}

// Extracted components for better organization 🎨
const RotatingNames = () => (
  <ul class="texteffect" role="list" aria-label="Rotating names in different languages">
    {[
      "アンドレア フトゥリ",
      "Ανδρέα φουτούρι",
      "Андреа Футури",
      "Andrea Futuri",
      "אנדראה פוטורי",
      "안드레아 푸투리",
      "แอนเดรีย ฟูตูรี",
      "‎فوتوري ‎أندريا",
      "आन्द्रेआ फुटुरी",
    ].map(name => (
      <li key={name}>{name}</li>
    ))}
    {inlineImport({ src: initTextScroll, selfExecute: true })}
  </ul>
);

const CompanySection = ({ logos }) => (
  <cta>
    <companies>
      <small class="center">Trusted by +10 companies</small>
      <logos>{logos}</logos>
    </companies>
    <a class="cta">Book a call now</a>
  </cta>
);

// Simplified scroll animation 🎭
function initTextScroll() {
  const ul = document.querySelector("ul.texteffect");
  if (!ul) return;

  const SCROLL_INTERVAL = 3000;
  const SCROLL_AMOUNT = ul.clientHeight / ul.children.length;
  const ITEMS_COUNT = ul.children.length;

  ul.style.scrollBehavior = "smooth";

  const cloneItems = () => {
    const clone = Array.from(ul.children)
      .map(item => item.cloneNode(true))
      .reverse()
      .slice(1); // Remove first item to avoid duplicate
    ul.append(...clone);
  };

  const cleanup = () => {
    if (ul.children.length > ITEMS_COUNT * 5) {
      Array.from(ul.children)
        .slice(0, ITEMS_COUNT)
        .forEach(item => item.remove());
    }
  };

  ul.addEventListener("scroll", () => {
    const isNearEnd = ul.scrollTop + ul.clientHeight >= ul.scrollHeight - ul.clientHeight;
    if (isNearEnd) {
      cloneItems();
      cleanup();
    }
  });

  setInterval(() => ul.scrollBy({ top: SCROLL_AMOUNT }), SCROLL_INTERVAL);
}

export default Home;
