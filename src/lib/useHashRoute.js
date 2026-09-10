import { useEffect, useState } from "react";

function currentRoute() {
  const h = window.location.hash.replace(/^#\/?/, "");
  return h || "dashboard"; // default landing page
}

export function useHashRoute() {
  const [route, setRoute] = useState(currentRoute);
  useEffect(() => {
    const onChange = () => setRoute(currentRoute());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}