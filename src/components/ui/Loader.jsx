const Loader = ({ fullScreen = false, size = "md" }) => {
    const sizes = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };
  
    const spinner = (
      <div className={`${sizes[size]} animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500`} />
    );
  
    if (fullScreen) {
      return (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center z-50">
          {spinner}
        </div>
      );
    }
  
    return (
      <div className="flex items-center justify-center p-8">
        {spinner}
      </div>
    );
  };
  
  export default Loader;
  