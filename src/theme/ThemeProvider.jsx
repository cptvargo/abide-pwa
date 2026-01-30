import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("abide-theme") || "classic",
  );

  useEffect(() => {
    localStorage.setItem("abide-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={`theme-${theme} h-screen w-full`}>{children}</div>
    </ThemeContext.Provider>
  );
}
