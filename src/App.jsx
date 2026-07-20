import { useState, useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { ThemeProvider } from "./theme/ThemeProvider";
import Onboarding from "./Onboarding";
import AppShell from "./AppShell";
import CoreReading from "./CoreReading";
import PWAUpdatePrompt from "./PWAUpdatePrompt";

// Version from package.json (injected at build time)
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || "2.4.0";

export default function App() {
  const [isOnboarded, setIsOnboarded] = useState(null); // null = loading
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  // PWA Update Registration
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("[ABIDE] SW Registered:", r);
      // Check for updates every 60 seconds so users with the app
      // already open see the banner within a minute of a new deploy
      if (r) {
        setInterval(() => {
          console.log("[ABIDE] Checking for update...");
          r.update();
        }, 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.log("[ABIDE] SW registration error:", error);
    },
    onNeedRefresh() {
      console.log("[ABIDE] New version available!");
      setShowUpdatePrompt(true);
    },
    onOfflineReady() {
      console.log("[ABIDE] App ready to work offline");
    },
  });

  // Onboarding handled by Flutter app — PWA goes straight to reader
  useEffect(() => {
    setIsOnboarded(true);
  }, []);

  function handleUpdate() {
    console.log("[ABIDE] User accepted update");
    setShowUpdatePrompt(false);
    updateServiceWorker(true); // Skip waiting and reload
  }

  function handleDismissUpdate() {
    console.log("[ABIDE] User dismissed update");
    setShowUpdatePrompt(false);
    setNeedRefresh(false);
  }

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
    <>
      <ThemeProvider>
        <AppShell>
          <CoreReading />
        </AppShell>
      </ThemeProvider>

      {/* Update Prompt */}
      {showUpdatePrompt && (
        <PWAUpdatePrompt
          onUpdate={handleUpdate}
          onDismiss={handleDismissUpdate}
        />
      )}
    </>
  );
}
