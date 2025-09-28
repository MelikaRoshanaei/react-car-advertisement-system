function Button({
  children,
  className = "",
  variant = "primary",
  type = "button",
  disabled = false,
  ...props
}) {
  const baseStyle =
    "px-4 py-2 border rounded-md font-medium transition-colors duration-200";
  const variants = {
    primary:
      "cursor-pointer bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300",
    secondary:
      "cursor-pointer bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-2 focus:ring-gray-400",
    danger:
      "cursor-pointer bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-300",
  };

  const style = disabled
    ? "bg-gray-300 text-gray-500 opacity-50 cursor-not-allowed"
    : variants[variant] || variants.primary;

  return (
    <button
      className={`${baseStyle} ${style} ${className}`}
      type={type}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
