import Cached from "../components/tools/Cached.jsx";
import Merge from "../components/tools/Merge.jsx";
import Transform from "../components/tools/Transform.jsx";

export default function smart(children, props) {
  let result = children;
  const { x, y, flipX, flipY, rotate, scale, optimize, fill, animated, loop, morph } = props;
  const { id, render, general } = props;
  const transformProps = {
    x,
    y,
    flipX,
    flipY,
    rotate,
    scale,
    optimize,
    fill,
    animated,
    loop,
    morph,
  };
  const cacheProps = { id, render, general };
  result = Transform({ children: result, ...transformProps });
  result = Cached(result, cacheProps);
  if (props.merged) result = Merge({ children: result, dataURI: render === "dataURI" });
  return result;
}
