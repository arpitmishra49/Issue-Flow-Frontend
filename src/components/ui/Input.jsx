const Input = ({
    label,
    error,
    className = "",
    type = "text",
    id,
    ...props
  }) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-zinc-300">
            {label}
          </label>
        )}
        <input
          id={id}
          type={type}
          className={`
            w-full px-3 py-2 rounded-lg text-sm
            bg-zinc-900 border text-zinc-100
            placeholder:text-zinc-500
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            transition-all duration-150
            ${error ? "border-red-500" : "border-zinc-700"}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  };
  
  export default Input;
  