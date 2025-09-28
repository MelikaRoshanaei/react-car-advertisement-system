function Form({ children, className = "", ...props }) {
  const baseStyle =
    "flex flex-col gap-4 p-4 bg-white border border-gray-300 rounded-md";

  return (
    <form className={`${baseStyle} ${className}`} {...props}>
      {children}
    </form>
  );
}

export default Form;
