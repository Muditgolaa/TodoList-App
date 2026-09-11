import { useEffect, useState } from "react";
import Navbar from "./components/navbar";
import { useHashRoute } from "./lib/useHashRoute";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import About from "./pages/About";
import AuthScreen from "./pages/AuthScreen";
import { cloudEnabled, getUser, onAuthChange, signOut } from "./lib/supabase";
import { attachUser } from "./lib/store";

function App() {
  const route = useHashRoute();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!cloudEnabled); // no cloud = ready immediately (local dev)

  useEffect(() => {
    if (!cloudEnabled) { attachUser(null); return; }
    let mounted = true;
    getUser().then((u) => {
      if (!mounted) return;
      setUser(u); attachUser(u); setReady(true);
    });
    const off = onAuthChange((u) => { setUser(u); attachUser(u); setReady(true); });
    return () => { mounted = false; off(); };
  }, []);

  if (cloudEnabled && !ready) {
    return <div className="min-h-screen grid place-items-center text-[var(--muted)]">Loading…</div>;
  }
  if (cloudEnabled && !user) return <AuthScreen />;

  const page = route === "tasks" ? <Tasks /> : route === "about" ? <About /> : <Dashboard />;
  return (
    <>
      <Navbar user={user} onSignOut={() => signOut()} />
      {page}
    </>
  );
}

export default App;