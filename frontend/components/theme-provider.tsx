"use client";

import * as React from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(
  undefined,
);

function applyTheme(theme: Theme) {
  const root = window.document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;
  localStorage.setItem("theme", theme);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // The pre-paint script in the document head has already resolved and applied
  // the real theme, so starting at "light" can never flash and never mismatches.
  const [theme, setThemeState] = React.useState<Theme>("light");

  React.useEffect(() => {
    const current: Theme = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
    setThemeState(current);
  }, []);

  // Keep multiple tabs in agreement.
  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== "theme") return;
      const next: Theme = event.newValue === "dark" ? "dark" : "light";
      applyTheme(next);
      setThemeState(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setTheme = React.useCallback((next: Theme) => {
    applyTheme(next);
    setThemeState(next);
  }, []);

  const toggleTheme = React.useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      return next;
    });
  }, []);

  const value = React.useMemo(
    () => ({ theme, toggleTheme, setTheme }),
    [theme, toggleTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
