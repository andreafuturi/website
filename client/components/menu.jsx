import { inlineImport } from "../../lib/framework-utils.jsx";

const homeIcon = inlineImport({ src: "./icons/home.svg" });
const aboutIcon = inlineImport({ src: "./icons/about.svg" });
const servicesIcon = inlineImport({ src: "./icons/services.svg" });
const portfolioIcon = inlineImport({ src: "./icons/portfolio.svg" });
const myStoryIcon = inlineImport({ src: "./icons/my-story.svg" });

function Menu() {
  const links = [
    { href: "/", icon: homeIcon, text: "Home" },
    { href: "/about", icon: aboutIcon, text: "About" },
    { href: "/services", icon: servicesIcon, text: "Services" },
    { href: "/portfolio", icon: portfolioIcon, text: "Portfolio" },
    { href: "/my-story", icon: myStoryIcon, text: "My Story" },
  ];

  return (
    <>
      <nav class="center">
        {links.map(({ href, icon, text }) => (
          <a href={href}>
            {icon}
            {text}
          </a>
        ))}
        {inlineImport({ src: "menu.css" })}
      </nav>
    </>
  );
}

export default Menu;
