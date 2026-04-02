import { toChildArray } from "preact";

const cache = new WeakMap();

export default function getChildrenPaths(children) {
  if (children && typeof children === "object" && cache.has(children))
    return cache.get(children);

  const paths = [];
  const childArray = toChildArray(children);
  while (childArray.length > 0) {
    const child = childArray.shift();
    if (child.type === "path" || child.type === "use") {
      paths.push(child);
    } else if (child.type === "g") {
      childArray.push(...toChildArray(child.props.children));
    } else if (typeof child.type === "function" && child.props) {
      if (child.props.d?.animation) paths.push(child);
      else childArray.push(...toChildArray(child.type.call(undefined, child.props)));
    }
  }

  if (children && typeof children === "object") cache.set(children, paths);
  return paths;
}
