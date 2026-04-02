import { useEffect, useState } from "preact/hooks";

/**
 * Live viewport pointer position in CSS pixels. No react-spring — springs were
 * resetting to 0 on re-inits / frame idle with newer react-spring + Preact.
 */
export const useMousePosition = () => {
  const [position, setPosition] = useState(() =>
    typeof document !== "undefined"
      ? {
          x: globalThis.innerWidth / 2,
          y: globalThis.innerHeight / 2,
        }
      : { x: 0, y: 0 },
  );

  useEffect(() => {
    const handleMove = event => {
      const touchish =
        "ontouchstart" in window || (navigator.maxTouchPoints ?? 0) > 0;

      let clientX;
      let clientY;
      if (touchish && event.touches?.length) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else if (!touchish) {
        clientX = event.clientX;
        clientY = event.clientY;
      } else {
        return;
      }

      setPosition({ x: clientX, y: clientY });
    };

    globalThis.addEventListener("mousemove", handleMove);
    globalThis.addEventListener("touchstart", handleMove, { passive: true });
    globalThis.addEventListener("touchmove", handleMove, { passive: true });

    return () => {
      globalThis.removeEventListener("mousemove", handleMove);
      globalThis.removeEventListener("touchstart", handleMove);
      globalThis.removeEventListener("touchmove", handleMove);
    };
  }, []);

  return position;
};
