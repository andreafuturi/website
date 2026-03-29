import { inlineImport } from "../../lib/framework-utils.jsx";

export default function IconLeadBlock({ icon, title, children }) {
  return (
    <>
      {inlineImport({ src: "./icon-lead-block.css" })}
      <article class="icon-lead-block">
        <div class="icon-lead-block__icon" aria-hidden="true">
          {icon}
        </div>
        <h3 class="icon-lead-block__title">{title}</h3>
        <p class="icon-lead-block__text">{children}</p>
      </article>
    </>
  );
}
