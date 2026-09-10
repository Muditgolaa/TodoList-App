import Navbar from "./components/navbar";
import { useHashRoute } from "./lib/useHashRoute";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import About from "./pages/About";

function App() {
  const route = useHashRoute();
  return (
    <>
      <Navbar />
      {route === "tasks" ? <Tasks /> : route === "about" ? <About /> : <Dashboard />}
    </>
  );
}

export default App;