import { useState, useEffect } from "react";
import { ThemeProvider } from "./theme/ThemeProvider";
import Onboarding from "./Onboarding";
import AppShell from "./AppShell";
import CoreReading from "./CoreReading";

export default function App() {
  const [isOnboarded, setIsOnboarded] = useState(null); // null = loading

  useEffect(() => {
    // Check if user has completed onboarding
    const onboarded = localStorage.getItem("abide_onboarded");
    setIsOnboarded(onboarded === "true");
  }, []);

  // Loading state (prevents flash)
  if (isOnboarded === null) {
    return null;
  }

  // Show onboarding if not completed (no ThemeProvider - uses Classic hardcoded)
  if (!isOnboarded) {
    return <Onboarding onComplete={() => setIsOnboarded(true)} />;
  }

  // Show main app with ThemeProvider
  return (
    <ThemeProvider>
      <AppShell>
        <CoreReading />
      </AppShell>
    </ThemeProvider>
  );
}
