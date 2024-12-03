/**
 * Marks components that shouldn't be hydrated 🚫
 * @param {{ children: any }} props
 */
export function ServerOnly({ children }) {
  return <static>{children}</static>;
}
