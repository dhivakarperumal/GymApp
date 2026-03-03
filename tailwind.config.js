/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#e11d1d",
        secondary: "#0EA5E9",
        background: "#F8FAFC",
        card: "#000000",
        textPrimary: "#111827",
        textSecondary: "#6B7280",
        success: "#22C55E",
        danger: "#EF4444",
      },
    },
  },
  plugins: [],
}
