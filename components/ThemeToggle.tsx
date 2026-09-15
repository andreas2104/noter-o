"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import {
  subscribeTheme,
  getThemeSnapshot,
  getServerThemeSnapshot,
  setTheme,
} from "@/lib/theme";

export default function ThemeToggle() {
  const dark = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );

  const toggle = () => setTheme(!dark);

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      aria-label={dark ? "Activer le mode clair" : "Activer le mode sombre"}
    >
      {dark ? (
        <Sun className="w-5 h-5 text-zinc-400" />
      ) : (
        <Moon className="w-5 h-5 text-zinc-500" />
      )}
    </button>
  );
}