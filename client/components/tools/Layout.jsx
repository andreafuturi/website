import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import { inlineImport } from "../../../lib/framework-utils.jsx";
import getAutoBBox from "../../functions/getAutoBBox.js";
import getChildrenBBox from "../../functions/getChildrenBBox.js";
import getChildrenPaths from "../../functions/getChildrenPaths.js";
//in the future the script tag should be a component that does some compiling optimization to the funcion (and also caching?)
// implement pan and zoom and automatically filter out paths that are not visible (checking the bounding box of the path with the new modified viewBox)
function Layout({ children, viewBoxWidth, viewBoxHeight, width, height, m, cover, noimage, frontend, withLight = true, ...attrs }) {
  const ref = useRef();
  const filteredContentRef = useRef();
  const [autoWidth, autoHeight] = useDimensions(ref);
  let childrenBBox = { x: 0, y: 0, width: 0, height: 0 };
  if (!globalThis.isBrowser) {
    const childrenPaths = getChildrenPaths(children);
    childrenBBox = getChildrenBBox(childrenPaths);
    
  }
  const image = (
    <g
      ref={filteredContentRef}
      filter={withLight ? "url(#HighRelief)" : undefined}
      transform={`translate(${-childrenBBox.x}, ${-childrenBBox.y})`}>
      {children}
    </g>
  );
  const viewBox = viewBoxWidth && viewBoxHeight ? `0 0 ${viewBoxWidth} ${viewBoxHeight}` : `0 0 ${autoWidth || childrenBBox.width} ${autoHeight || childrenBBox.height}`;

  return (
    <>
      <svg
        ref={ref}
        viewBox={viewBox}
        style={"margin:" + m + "px"}
        width={noimage ? undefined : width || "100%"}
        height={noimage ? undefined : height || "100%"}
        xmlns={noimage ? undefined : "http://www.w3.org/2000/svg"}
        preserveAspectRatio={cover ? "xMidYMid slice" : undefined}
        {...attrs}>
        <Light
          lightSpaceRef={filteredContentRef}
          width={autoWidth || childrenBBox.width}
          height={autoHeight || childrenBBox.height}
        />
        {image}
      </svg>
      {inlineImport({ src: getAutoBBox, selfExecute: true })}
    </>
  );
}

const Light = ({ lightSpaceRef, ...props }) => {
  const isDesktopRef = useRef(true);
  const [lightPos, setLightPos] = useState(() => ({
    x: (props.width ?? 0) / 2,
    y: (props.height ?? 0) / 2,
    z: 10000,
  }));

  const isDesktop =
    globalThis.isBrowser &&
    globalThis.matchMedia("(min-device-width: 960px)").matches;
  isDesktopRef.current = isDesktop;

  useEffect(() => {
    if (!globalThis.isBrowser) return;
    const mq = globalThis.matchMedia("(min-device-width: 960px)");
    const check = () => setLightPos(p => ({ ...p, z: mq.matches ? 10000 : 15000 }));
    check();
    mq.addEventListener("change", check);
    return () => mq.removeEventListener("change", check);
  }, []);

  useEffect(() => {
    if (!globalThis.isBrowser) return;
    const handleMove = e => {
      const el = lightSpaceRef.current;
      const root = el?.ownerSVGElement;
      if (!el || !root?.createSVGPoint) return;
      const ctm = el.getScreenCTM();
      if (!ctm) return;
      const pt = root.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const p = pt.matrixTransform(ctm.inverse());
      setLightPos(prev => ({ ...prev, x: p.x, y: p.y }));
    };
    globalThis.addEventListener("mousemove", handleMove);
    return () => globalThis.removeEventListener("mousemove", handleMove);
  }, []);

  useEventListener("wheel", event => {
    if (!isDesktopRef.current) return;
    if (event.deltaY < 0) {
      setLightPos(p => ({ ...p, z: Math.min(p.z + 2000, 80000) }));
    } else {
      setLightPos(p => ({ ...p, z: Math.max(p.z - 2000, 1000) }));
    }
  });

  const { x: mouseX, y: mouseY, z } = lightPos;

  return (
    <>
      <filter id="HighRelief">
        {/* <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" /> */}
        <feDiffuseLighting in="blur" surfaceScale="0.5">
          <fePointLight x={mouseX} y={mouseY} z={z} />
        </feDiffuseLighting>

        <feComposite in="SourceGraphic" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" />
      </filter>
      <filter id="LowRelief">
        <feGaussianBlur in="SourceAlpha" stdDeviation="0.08" result="blur" />
        <feDiffuseLighting in="blur" surfaceScale="-25">
          <fePointLight z="20" />
        </feDiffuseLighting>
        <feComposite in="SourceGraphic" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" />
      </filter>
    </>
  );
};

function useDimensions(ref) {
  const [autoWidth, setWidth] = useState();
  const [autoHeight, setHeight] = useState();
  useLayoutEffect(() => {
    const box = ref.current.getBBox();
    setWidth(Math.round(box.width));
    setHeight(Math.round(box.height));
  });
  return [autoWidth, autoHeight];
}
export default Layout;

//const [visiblePaths, setVisiblePaths] = useState(image);
//const onload = globalThis.isBrowser ? {} : {onload: 'getAutoBBox(evt)'}

// Hook
/** No `= window` default — that runs during SSR (Deno) where `window` is undefined. */
function useEventListener(eventName, handler, element) {
  const savedHandler = useRef();
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  useEffect(
    () => {
      const target = element ?? (typeof window !== "undefined" ? window : undefined);
      if (!target?.addEventListener) return;
      const eventListener = event => savedHandler.current(event);
      target.addEventListener(eventName, eventListener);
      return () => {
        target.removeEventListener(eventName, eventListener);
      };
    },
    [eventName, element],
  );
}
