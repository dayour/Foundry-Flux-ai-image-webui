"use client";

import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Force dark mode on mount. This runs only on the client to avoid
    // hydration mismatches caused by the server rendering a different
    // `class` attribute on <html> than the client.
    if (!document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.add("dark");
    }
    // Ensure the browser uses dark color scheme for built-in UI
    document.documentElement.style.colorScheme = "dark";
  }, []);

  return <>{children}</>;
}
