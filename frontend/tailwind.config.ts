import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101010",
        mist: "#f5f1e8",
        ember: "#b6512e",
        pine: "#30473c"
      }
    }
  },
  plugins: []
};

export default config;
