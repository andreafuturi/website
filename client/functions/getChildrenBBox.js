import SVGPathCommander from "../lib/svgPathCommander.js";

const cache = new WeakMap();

export default function getChildrenBBox(childrenPaths) {
  if (cache.has(childrenPaths)) return cache.get(childrenPaths);

  const bbox = SVGPathCommander.getPathBBox(
    childrenPaths.map(path => path.props.originalD || path.props.d).join(" ")
  );

  cache.set(childrenPaths, bbox);
  return bbox;
}
