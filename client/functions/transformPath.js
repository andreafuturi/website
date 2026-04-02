import SVGPathCommander from "../lib/svgPathCommander.js";

SVGPathCommander.options.round = 0;

/**
 * Applies path transforms using `SVGPathCommander.fromSegments` (one parse, bbox on segments).
 * `reverse` uses svg-path-commander’s `reverse()` (segment order / draw direction), after transforms, before optimize.
 */
export default function transformPath(pathString, transformProps) {
  try {
    const {
      flipX,
      flipY,
      rotate,
      scale,
      scaleX,
      scaleY,
      x = 0,
      y = 0,
      origin,
      optimize,
      reverse,
    } = transformProps;

    const segments = SVGPathCommander.parsePathString(pathString);
    const path = SVGPathCommander.fromSegments(
      segments,
      Array.isArray(origin) && origin.length >= 2 ? { origin } : {},
    );

    if (flipX) path.transform({ rotate: [0, 180, 0], origin });
    if (flipY) path.transform({ rotate: [180, 0, 0], origin });
    if (rotate) path.transform({ rotate, origin });
    if (scale || scaleX || scaleY)
      path.transform({
        origin,
        scale: [scaleX || scale || 1, scaleY || scale || 1],
      });
    if (x || y) path.transform({ translate: [x, y] });

    if (reverse) path.reverse();

    if (optimize) path.optimize().optimize();

    return path.toString();
  } catch (error) {
    console.error("tried to transform an element that was not a path");
    return "";
  }
}
