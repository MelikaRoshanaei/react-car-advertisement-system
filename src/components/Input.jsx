function Input({
  type = "text",
  variant = "primary",
  className = "",
  placeholder = "",
  disabled = false,
  ...props
}) {
  const baseStyle =
    "px-4 py-2 border rounded-md font-medium transition-colors duration-200 focus:outline-none";

  const variants = {
    primary:
      "border-gray-300 focus:ring-2 focus:ring-blue-300 focus:border-blue-500",
    error:
      "border-red-500 focus:ring-2 focus:ring-red-300 focus:border-red-500",
  };

  const style = disabled
    ? "bg-gray-100 text-gray-500 opacity-50 cursor-not-allowed"
    : variants[variant] || variants.primary;

  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`${baseStyle} ${style} ${className}`}
      disabled={disabled}
      {...props}
    />
  );
}

export default Input;
