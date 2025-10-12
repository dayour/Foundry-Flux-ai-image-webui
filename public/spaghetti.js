// On page load or when changing themes, best to add inline in `head` to avoid FOUC
// Only mutate the DOM if the desired theme differs from the currently
// rendered state. This prevents a hydration mismatch when the server has
// already rendered `class="dark"` on <html>.
try {
    const prefersDark =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

    const desiredTheme = (() => {
        if (localStorage.theme === "dark") return "dark";
        if (localStorage.theme === "light") return "light";
        return prefersDark ? "dark" : "light";
    })();

    const hasDark = document.documentElement.classList.contains("dark");
    // For a unified server-first dark experience we avoid removing the
    // `dark` class on initial load — removing it here would create a
    // hydration mismatch if the server rendered `class="dark"`.
    if (desiredTheme === "dark" && !hasDark) {
        document.documentElement.classList.add("dark");
    }
} catch (e) {
    // If anything goes wrong (e.g., localStorage not available), do nothing
    // to avoid causing hydration mismatches or runtime errors in the page.
    console.warn("theme init skipped:", e);
}

// Expose helper functions so other scripts can change the theme without
// accidentally overwriting the user's choice on every page load.
function setThemeLight() {
    localStorage.setItem('theme', 'light');
    // Keep HS theme key in sync with other theme switcher script
    localStorage.setItem('hs_theme', 'default');
    document.documentElement.classList.remove('dark');
}

function setThemeDark() {
    localStorage.setItem('theme', 'dark');
    // Keep HS theme key in sync with other theme switcher script
    localStorage.setItem('hs_theme', 'dark');
    document.documentElement.classList.add('dark');
}

function setThemeAuto() {
    localStorage.removeItem('theme');
    localStorage.setItem('hs_theme', 'auto');
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

// Make helpers available on window for other scripts or dev tooling to call.
window.themeHelpers = { setThemeLight, setThemeDark, setThemeAuto };
