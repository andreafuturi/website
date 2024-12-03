import { registerComponent } from "./framework-utils.jsx";

// HOC for interactive components
const withHydration = WrappedComponent => {
  // Check if we're on the server
  if (typeof window !== "undefined") return WrappedComponent;

  const withHydration = props => {
    // Get or create stable component ID
    const componentId = WrappedComponent.__componentId || registerComponent(WrappedComponent);
    WrappedComponent.__componentId = componentId;

    const uniqueId = `${componentId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    return (
      <interactive id={uniqueId} data-component={componentId} props={JSON.stringify(props)}>
        <WrappedComponent {...props} />
      </interactive>
    );
  };

  withHydration.displayName = `withHydration(${WrappedComponent.name})`;
  return withHydration;
};
export default withHydration;
