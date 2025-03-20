import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--surface-tonal-a30))",
        input: "hsl(var(--surface-tonal-a20))",
        ring: "hsl(var(--primary-a30))",
        background: "hsl(var(--surface-a0))",
        foreground: "hsl(var(--dark-a0))",
        primary: {
          DEFAULT: "hsl(var(--primary-a0))",
          a0: "hsl(var(--primary-a0))",
          a10: "hsl(var(--primary-a10))",
          a20: "hsl(var(--primary-a20))",
          a30: "hsl(var(--primary-a30))",
          a40: "hsl(var(--primary-a40))",
          a50: "hsl(var(--primary-a50))",
          foreground: "hsl(var(--light-a0))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface-a0))",
          a0: "hsl(var(--surface-a0))",
          a10: "hsl(var(--surface-a10))",
          a20: "hsl(var(--surface-a20))",
          a30: "hsl(var(--surface-a30))",
          a40: "hsl(var(--surface-a40))",
          a50: "hsl(var(--surface-a50))",
        },
        "surface-tonal": {
          DEFAULT: "hsl(var(--surface-tonal-a0))",
          a0: "hsl(var(--surface-tonal-a0))",
          a10: "hsl(var(--surface-tonal-a10))",
          a20: "hsl(var(--surface-tonal-a20))",
          a30: "hsl(var(--surface-tonal-a30))",
          a40: "hsl(var(--surface-tonal-a40))",
          a50: "hsl(var(--surface-tonal-a50))",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}

export default config

