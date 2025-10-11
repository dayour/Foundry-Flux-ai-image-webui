// On page load or when changing themes, best to add inline in `head` to avoid FOUC
if (
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
) {
    document.documentElement.classList.add("dark");
} else {
    document.documentElement.classList.remove("dark");
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
