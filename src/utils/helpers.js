/**
 * Format a date string to a human-readable format
 */
export const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  /**
   * Truncate a string to a max length
   */
  export const truncate = (str, max = 80) => {
    if (!str) return "";
    return str.length > max ? str.slice(0, max) + "…" : str;
  };
  
  /**
   * Capitalize first letter
   */
  export const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  
  /**
   * Get initials from a name
   */
  export const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  
  /**
   * Status → color class mapping
   */
  export const statusColor = (status) => {
    const map = {
      open: "text-red-400 bg-red-500/10 border-red-500/20",
      "in-progress": "text-amber-400 bg-amber-500/10 border-amber-500/20",
      resolved: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      closed: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
    };
    return map[status] || "";
  };
  
  /**
   * Priority → color class mapping
   */
  export const priorityColor = (priority) => {
    const map = {
      low: "text-blue-400",
      medium: "text-amber-400",
      high: "text-orange-400",
      critical: "text-red-400",
    };
    return map[priority] || "text-zinc-400";
  };
  