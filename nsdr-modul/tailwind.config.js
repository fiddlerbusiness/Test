/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // Alle Farben kommen aus den CSS-Tokens in src/styles.css.
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        surface2: "var(--surface-2)",
        line: "var(--line)",
        linestrong: "var(--line-strong)",
        fg: "var(--fg)",
        fg2: "var(--fg-2)",
        fg3: "var(--fg-3)",
        accent: "var(--accent)",
        accentstrong: "var(--accent-strong)",
        beta: "var(--beta)",
        alpha: "var(--alpha)",
        theta: "var(--theta)",
        delta: "var(--delta)",
        ev: {
          solid: "var(--ev-solid)",
          prelim: "var(--ev-prelim)",
          hypo: "var(--ev-hypo)",
          none: "var(--ev-none)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      maxWidth: {
        prose: "66ch",
        panel: "72rem",
      },
    },
  },
  plugins: [],
};
