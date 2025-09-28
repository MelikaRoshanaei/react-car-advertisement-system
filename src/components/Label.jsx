function Label({ children, id, variant = "primary", className = "" }) {
  const baseStyle = "block mb-1 text-sm font-medium";
  const variants = {
    primary: "text-gray-700",
    error: "text-red-500",
  };

  return (
    <label
      htmlFor={id}
      className={`${baseStyle} ${
        variants[variant] || variants.primary
      } ${className}`}
    >
      {children}
    </label>
  );
}

export default Label;
