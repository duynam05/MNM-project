function MaterialIcon({ children, className = '', fill = false }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {children}
    </span>
  );
}

export default MaterialIcon;
