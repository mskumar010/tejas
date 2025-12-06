export const APP_COLORS = {
  primary: "#4f46e5", // Indigo 600
  secondary: "#64748b", // Slate 500
  success: "#22c55e", // Green 500
  danger: "#ef4444", // Red 500
  warning: "#f59e0b", // Amber 500

  // Light Mode Defaults
  light: {
    background: "#f9fafb", // Gray 50
    surface: "#ffffff",
    border: "#e5e7eb", // Gray 200
    text: "#111827", // Gray 900
    subtext: "#6b7280", // Gray 500
  },

  // Dark Mode Defaults
  dark: {
    background: "#202020", // Custom Dark
    surface: "#2D2D2D", // Custom Surface
    border: "#404040", // Custom Border
    text: "#f1f1f1", // Off-white
    subtext: "#a1a1a1", // Light Gray
  },

  // Helper to get value based on current theme (if needed in JS logic)
  get: (
    mode: "light" | "dark",
    token: "background" | "surface" | "border" | "text" | "subtext"
  ) => {
    return mode === "dark" ? APP_COLORS.dark[token] : APP_COLORS.light[token];
  },
};
