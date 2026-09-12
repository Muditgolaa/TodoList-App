import { useEffect, useState } from "react";
import { FiSun, FiMoon, FiLogOut } from "react-icons/fi";
import { useHashRoute } from "../lib/useHashRoute";

function getInitialTheme() {
  try {
    const saved = localStorage.getItem("tudum-theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch { /* ignore */ }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const LINKS = [
  { id: "dashboard", label: "Home", href: "#/dashboard" },
  { id: "tasks", label: "Tasks", href: "#/tasks" },
  { id: "about", label: "About", href: "#/about" },
];

const Navbar = ({ user, onSignOut }) => {
  const [theme, setTheme] = useState(getInitialTheme);
  const route = useHashRoute();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("tudum-theme", theme); } catch { /* ignore */ }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <nav className="bg-[var(--surface)] border-b border-[var(--border)] px-4 py-3">
      <div className="container mx-auto flex justify-between items-center">
        <a href="#/dashboard" className="font-display text-2xl font-extrabold tracking-tight text-[var(--text)]">
          TuDummmm
        </a>
        <div className="flex items-center gap-6">
          <ul className="flex gap-6">
            {LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={l.href}
                  className={
                    (route === l.id ? "text-[var(--amber)] font-semibold" : "text-[var(--muted)]") +
                    " hover:text-[var(--text)] transition-colors"
                  }
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <button
            onClick={toggle}
            aria-label="Toggle light or dark theme"
            className="grid place-items-center w-9 h-9 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--border-strong)] transition-colors"
          >
            {theme === "dark" ? <FiSun /> : <FiMoon />}
          </button>
          {user && (
            <button
              onClick={onSignOut}
              title={`Sign out (${user.email})`}
              aria-label="Sign out"
              className="grid place-items-center w-9 h-9 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--amber-2)] hover:border-[var(--border-strong)] transition-colors"
            >
              <FiLogOut />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;