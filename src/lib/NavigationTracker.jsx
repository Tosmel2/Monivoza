import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Simple navigation tracker component
export default function NavigationTracker() {
  const location = useLocation();

  useEffect(() => {
    // Track page views or navigation events
    console.log("Navigated to:", location.pathname);
  }, [location]);

  return null;
}
