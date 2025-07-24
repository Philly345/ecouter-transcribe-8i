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
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        "0.5": "0.1rem",
        "1.5": "0.3rem",
        "2.5": "0.5rem",
        "3.5": "0.7rem",
        "4.5": "0.9rem",
        "5.5": "1.1rem",
        "6.5": "1.3rem",
        "7.5": "1.5rem",
        "8.5": "1.7rem",
        "9.5": "1.9rem",
        "11": "2.2rem",
        "13": "2.6rem",
        "15": "3rem",
        "17": "3.4rem",
        "18": "3.6rem",
        "19": "3.8rem",
        "21": "4.2rem",
        "22": "4.4rem",
        "23": "4.6rem",
        "25": "5rem",
        "26": "5.2rem",
        "27": "5.4rem",
        "28": "5.6rem",
        "29": "5.8rem",
        "30": "6rem",
      },
      fontSize: {
        xs: "0.7rem",
        sm: "0.8rem",
        base: "0.9rem",
        lg: "1rem",
        xl: "1.1rem",
        "2xl": "1.3rem",
        "3xl": "1.6rem",
        "4xl": "2rem",
        "5xl": "2.4rem",
        "6xl": "3rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
