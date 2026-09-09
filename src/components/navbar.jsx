import { useEffect, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

// Read the saved choice, else follow the OS setting.
function getInitialTheme() {
  try {
    const saved = localStorage.getItem("ember-theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch { /* ignore */ }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const Navbar = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  // Whenever theme changes: stamp <html> and remember the choice.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("ember-theme", theme); } catch { /* ignore */ }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <nav className="bg-[var(--surface)] border-b border-[var(--border)] px-4 py-3">
      <div className="container mx-auto flex justify-between items-center">
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-[var(--text)]">
          ember
        </h2>
        <div className="flex items-center gap-6">
          <ul className="flex gap-6 text-[var(--muted)]">
            <li><a href="#" className="hover:text-[var(--text)] transition-colors">Home</a></li>
            <li><a href="#" className="hover:text-[var(--text)] transition-colors">Tasks</a></li>
            <li><a href="#" className="hover:text-[var(--text)] transition-colors">About</a></li>
          </ul>
          <button
            onClick={toggle}
            aria-label="Toggle light or dark theme"
            className="grid place-items-center w-9 h-9 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--border-strong)] transition-colors"
          >
            {theme === "dark" ? <FiSun /> : <FiMoon />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
