import { useSpring } from "react-spring";
import SVGPathCommander from "../lib/svgPathCommander.js";

const midPoint = (a, b, t) => {
  const [ax, ay] = a;
  const [bx, by] = b;
  return [ax + (bx - ax) * t, ay + (by - ay) * t];
};
const splitCubic = (pts /* , ratio */) => {
  const t = /* ratio || */ 0.5;
  const p0 = pts.slice(0, 2);
  const p1 = pts.slice(2, 4);
  const p2 = pts.slice(4, 6);
  const p3 = pts.slice(6, 8);
  const p4 = midPoint(p0, p1, t);
  const p5 = midPoint(p1, p2, t);
  const p6 = midPoint(p2, p3, t);
  const p7 = midPoint(p4, p5, t);
  const p8 = midPoint(p5, p6, t);
  const p9 = midPoint(p7, p8, t);

  return [
    ["C", ...p4, ...p7, ...p9],
    ["C", ...p8, ...p6, ...p3],
  ];
};
export default function getMorph(from, to, morph, config) {
  if (morph) {
    const processedPaths = equalizeSegments(from, to);
    from = SVGPathCommander.pathToString(processedPaths[0]);
    to = SVGPathCommander.pathToString(processedPaths[1]);
  }
  const springProps = useSpring({
    from: { d: from },
    to: { d: to },
    config: { mass: 0.3, tension: 280, friction: 80, ...config },
    loop: { reverse: true },
  });
  return { ...springProps, originalD: from, transformeD: to };
}

function getCurveArray(source) {
  return SVGPathCommander.pathToCurve(
    SVGPathCommander.splitPath(SVGPathCommander.pathToAbsolute(source))[0]
  ).map((segment, i, pathArray) => {
    const segmentData = i && [
      ...pathArray[i - 1].slice(-2),
      ...segment.slice(1),
    ];
    const curveLength = i ? segmentCubicFactory(...segmentData).length : 0;

    let subsegs;
    if (i) {
      // must be [segment,segment]
      subsegs = curveLength ? splitCubic(segmentData) : [segment, segment];
    } else {
      subsegs = [segment];
    }

    return {
      s: segment,
      ss: subsegs,
      l: curveLength,
    };
  });
}
/**
 * Returns two `curveArray` with same amount of segments.
 * @param {SVGPath.curveArray} path1 the first `curveArray`
 * @param {SVGPath.curveArray} path2 the second `curveArray`
 * @param {number} TL the maximum `curveArray` length
 * @returns {SVGPath.curveArray[]} equalized segments
 */
function equalizeSegments(path1, path2, TL) {
  const c1 = getCurveArray(path1);
  const c2 = getCurveArray(path2);
  const L1 = c1.length;
  const L2 = c2.length;
  const l1 = c1.filter((x) => x.l).length;
  const l2 = c2.filter((x) => x.l).length;
  const m1 = c1.filter((x) => x.l).reduce((a, { l }) => a + l, 0) / l1 || 0;
  const m2 = c2.filter((x) => x.l).reduce((a, { l }) => a + l, 0) / l2 || 0;
  const tl = TL || Math.max(L1, L2);
  const mm = [m1, m2];
  const dif = [tl - L1, tl - L2];
  let canSplit = 0;
  const result = [c1, c2].map((x, i) =>
    x.l === tl
      ? x.map((y) => y.s)
      : x
          .map((y, j) => {
            canSplit = j && dif[i] && y.l >= mm[i];
            dif[i] -= canSplit ? 1 : 0;
            return canSplit ? y.ss : [y.s];
          })
          .flat()
  );

  return result[0].length === result[1].length
    ? result
    : equalizeSegments(result[0], result[1], tl);
}
const getPointAtCubicSegmentLength = (
  x1,
  y1,
  c1x,
  c1y,
  c2x,
  c2y,
  x2,
  y2,
  t
) => {
  const t1 = 1 - t;
  return {
    x:
      t1 ** 3 * x1 +
      3 * t1 ** 2 * t * c1x +
      3 * t1 * t ** 2 * c2x +
      t ** 3 * x2,
    y:
      t1 ** 3 * y1 +
      3 * t1 ** 2 * t * c1y +
      3 * t1 * t ** 2 * c2y +
      t ** 3 * y2,
  };
};
const distanceSquareRoot = (a, b) => {
  return Math.sqrt(
    (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1])
  );
};
const segmentCubicFactory = (x1, y1, c1x, c1y, c2x, c2y, x2, y2, distance) => {
  const distanceIsNumber = typeof distance === "number";
  let x = x1;
  let y = y1;
  let LENGTH = 0;
  let prev = [x, y, LENGTH];
  let cur = [x, y];
  let t = 0;
  let POINT = { x: 0, y: 0 };
  let POINTS = [{ x, y }];

  if (distanceIsNumber && distance <= 0) {
    POINT = { x, y };
  }

  const sampleSize = 300;
  for (let j = 0; j <= sampleSize; j += 1) {
    t = j / sampleSize;

    ({ x, y } = getPointAtCubicSegmentLength(
      x1,
      y1,
      c1x,
      c1y,
      c2x,
      c2y,
      x2,
      y2,
      t
    ));
    POINTS = [...POINTS, { x, y }];
    LENGTH += distanceSquareRoot(cur, [x, y]);
    cur = [x, y];

    if (distanceIsNumber && LENGTH > distance && distance > prev[2]) {
      const dv = (LENGTH - distance) / (LENGTH - prev[2]);

      POINT = {
        x: cur[0] * (1 - dv) + prev[0] * dv,
        y: cur[1] * (1 - dv) + prev[1] * dv,
      };
    }
    prev = [x, y, LENGTH];
  }

  if (distanceIsNumber && distance >= LENGTH) {
    POINT = { x: x2, y: y2 };
  }

  return {
    length: LENGTH,
    point: POINT,
    min: {
      x: Math.min(...POINTS.map((n) => n.x)),
      y: Math.min(...POINTS.map((n) => n.y)),
    },
    max: {
      x: Math.max(...POINTS.map((n) => n.x)),
      y: Math.max(...POINTS.map((n) => n.y)),
    },
  };
};
