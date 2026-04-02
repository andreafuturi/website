/**
 * Default export: svg-path-commander v2 with v1-style constructor defaults (pivot = path bbox
 * center). Upstream v2 uses [0,0,0] unless you pass `origin`; we merge bbox `cx,cy,cz` when
 * `origin` is missing or 2D-only.
 * @see https://github.com/thednp/svg-path-commander — bump `@2.x.x` in the URL for patches.
 */
import Base from "https://esm.sh/svg-path-commander@2.1.11";

function withBBoxOrigin(pathString, config = {}) {
  if (Array.isArray(config.origin) && config.origin.length >= 2) {
    const { cz } = Base.getPathBBox(pathString);
    const z = config.origin.length >= 3 ? config.origin[2] : cz;
    return { ...config, origin: [config.origin[0], config.origin[1], z ?? cz ?? 0] };
  }
  const { cx, cy, cz } = Base.getPathBBox(pathString);
  return { ...config, origin: [cx, cy, cz ?? 0] };
}

/** Pivot merge for pre-parsed segments (avoids bbox on the path string). */
export function withBBoxOriginFromSegments(segments, config = {}) {
  if (Array.isArray(config.origin) && config.origin.length >= 2) {
    const { cz } = Base.getPathBBox(segments);
    const z = config.origin.length >= 3 ? config.origin[2] : cz;
    return { ...config, origin: [config.origin[0], config.origin[1], z ?? cz ?? 0] };
  }
  const { cx, cy, cz } = Base.getPathBBox(segments);
  return { ...config, origin: [cx, cy, cz ?? 0] };
}

export default class SVGPathCommander extends Base {
  constructor(pathString, config = {}) {
    super(pathString, withBBoxOrigin(pathString, config));
  }

  /**
   * One parse + bbox on segments, then hydrate like `new SVGPathCommander` without `super(pathString)`
   * re-parsing. If svg-path-commander adds required instance fields, update here (see import version).
   */
  static fromSegments(segments, config = {}) {
    const merged = withBBoxOriginFromSegments(segments, config);
    const path = Object.create(SVGPathCommander.prototype);
    path.segments = segments;
    path.origin = merged.origin;
    path.round = SVGPathCommander.options.round;
    return path;
  }
}
