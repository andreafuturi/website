import { inlineImport } from "../../lib/framework-utils.jsx";

const carrefourLogo = inlineImport({ src: "../components/companies/carrefour.svg" });
const recrowdLogo = inlineImport({ src: "../components/companies/recrowd.svg" });
const worldyLogo = inlineImport({ src: "../components/companies/worldy.svg" });
const gustirariLogo = inlineImport({ src: "../components/companies/gustirari.svg" });
function Home() {
  return (
    <home>
      {inlineImport({ src: "home.css" })}
      <img width={403} height={407} src="./images/hero-mobile.webp" alt="hero" />
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
      <a class="cta">Book a call now</a>
      <a class="center scroll-to-about flex-col" href="/about">
        About
        <svg fill="currentColor" width="17" height="11" viewBox="0 0 17 11" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.48633 10.4004C8.73047 10.4004 8.97461 10.3027 9.14062 10.1172L16.6992 2.37305C16.8652 2.20703 16.9629 1.99219 16.9629 1.74805C16.9629 1.24023 16.582 0.849609 16.0742 0.849609C15.8301 0.849609 15.6055 0.947266 15.4395 1.10352L7.95898 8.75H9.00391L1.52344 1.10352C1.36719 0.947266 1.14258 0.849609 0.888672 0.849609C0.380859 0.849609 0 1.24023 0 1.74805C0 1.99219 0.0976562 2.20703 0.263672 2.38281L7.82227 10.1172C8.00781 10.3027 8.23242 10.4004 8.48633 10.4004Z" />
        </svg>
      </a>
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

    // Slower scramble effect (30 frames, 80ms each) ✨
    for (let frame = 0; frame < 30; frame++) {
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
      await new Promise(r => setTimeout(r, 80)); // Slower frame rate
    }

    el.innerText = text;
  }

  // Start animation loop with longer pauses 🔄
  async function animate() {
    while (true) {
      await scrambleText();
      await new Promise(r => setTimeout(r, 8000)); // 8 second pause between animations
    }
  }

  animate();
}

export default Home;
