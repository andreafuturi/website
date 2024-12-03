import { inlineImport } from "../../lib/framework-utils.jsx";

export default function About() {
  return (
    <about>
      {inlineImport({ src: "./about.css" })}
      About
    </about>
  );
}
