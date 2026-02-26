import { useEffect } from "react";

const icons = {
  success: (
    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20A10 10 0 0112 2z" />
    </svg>
  ),
};

const borderColors = {
  success: "border-l-emerald-500",
  error: "border-l-red-500",
  info: "border-l-indigo-500",
};

const Toast = ({ message, type = "info", onClose, duration = 3500 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div
      className={`
        fixed bottom-5 right-5 z-[100] flex items-start gap-3
        bg-zinc-900 border border-zinc-800 border-l-4 ${borderColors[type]}
        rounded-lg px-4 py-3 shadow-xl min-w-[260px] max-w-sm
        animate-[slideIn_0.2s_ease-out]
      `}
    >
      <span className="mt-0.5 shrink-0">{icons[type]}</span>
      <p className="text-sm text-zinc-200 flex-1">{message}</p>
      <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;
