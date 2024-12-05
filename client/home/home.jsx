import { inlineImport } from "../../lib/framework-utils.jsx";

const carrefourLogo = inlineImport({ src: "../components/companies/carrefour.svg" });
const recrowdLogo = inlineImport({ src: "../components/companies/recrowd.svg" });
const worldyLogo = inlineImport({ src: "../components/companies/worldy.svg" });
const gustirariLogo = inlineImport({ src: "../components/companies/gustirari.svg" });
function Home() {
  return (
    <home>
      {inlineImport({ src: "home.css" })}
      <img width={403} height={407} src="./images/hero.webp" alt="hero" />
      <herotexts>
        <texteffect>
          Ανδρέα φουτούρι <br />
          アンドレア フトゥリ <br />
          Андреа Футури <br />
          안드레아 푸투리
          <br />
          Andrea Futuri
          <br />
          אנדראה פוטורי
          <br />
          แอนเดรีย ฟูตูรี
          <br />
          ‎فوتوري ‎أندريا <br />
          आन्द्रेआ फुटुरी
        </texteffect>
        <h1>
          APPS <br /> WEBSITES <br /> AI AUTOMATIONS
        </h1>
        <p>Helping startups and founders build the future</p>
      </herotexts>
      <companies>
        <small class="center">Trusted by +10 companies</small>
        <logos>{[carrefourLogo, recrowdLogo, gustirariLogo, worldyLogo]}</logos>
      </companies>
      <cta>
        <a class="cta">Book a call now</a>
      </cta>
      {inlineImport({ src: initTextScramble, selfExecute: true })}
    </home>
  );
}

// Simplified text scramble animation 🎭
function initTextScramble() {
  const scrambleChars = "!<>-_\\/[]{}—=+*^?#_____";
  const el = document.querySelector("texteffect");

  async function scrambleText() {
    const text = el.innerText;

    // Reduced frames (10 instead of 30) but same speed per frame ⚡
    for (let frame = 0; frame < 10; frame++) {
      let output = "";
      for (let i = 0; i < text.length; i++) {
        if (text[i] === "\n") {
          output += "\n";
          continue;
        }

        // Reduced chance of scramble (30%) for smoother effect
        if (Math.random() < 0.3) {
          output += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        } else {
          output += text[i];
        }
      }
      el.innerText = output;
      await new Promise(r => setTimeout(r, 80)); // Keeping same frame rate
    }

    el.innerText = text;
  }

  // Start animation loop 🔄
  async function animate() {
    while (true) {
      await scrambleText();
      await new Promise(r => setTimeout(r, 8000));
    }
  }

  animate();
}

export default Home;
