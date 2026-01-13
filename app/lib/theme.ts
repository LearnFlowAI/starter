import { useEffect } from "react";
import { useLocalState } from "./storage";

export function useTheme() {
  const [isDarkMode, setIsDarkMode, ready] = useLocalState<boolean>(
    "lf_theme_dark",
    false
  );

  useEffect(() => {
    if (!ready || typeof document === "undefined") {
      return;
    }
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode, ready]);

  return {
    isDarkMode,
    ready,
    toggleTheme: () => setIsDarkMode((prev) => !prev)
  };
}
