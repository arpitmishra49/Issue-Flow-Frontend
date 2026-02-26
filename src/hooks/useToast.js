import { useState, useCallback } from "react";

const useToast = () => {
  const [toast, setToast] = useState({ message: "", type: "info" });

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ message: "", type: "info" });
  }, []);

  return { toast, showToast, hideToast };
};

export default useToast;
