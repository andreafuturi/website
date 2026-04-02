import SVGPathCommander from "../lib/svgPathCommander.js";
import Merge from "../components/tools/Merge.jsx";

export default function getSize(of) {
  const lastSetting = globalThis.retroCompatible;
  globalThis.retroCompatible = true;
  const paths = Merge({}, of()).props.d;
  const size = SVGPathCommander.getPathBBox(paths);
  globalThis.retroCompatible = lastSetting;
  return size;
}
