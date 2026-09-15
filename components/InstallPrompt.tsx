"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  if (installed || !deferred) return null;

  const handleInstall = async () => {
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      setDeferred(null);
    }
  };

  return (
    <button
      onClick={handleInstall}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
      aria-label="Installer l'application"
    >
      <Download className="w-4 h-4" />
      Installer
    </button>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
