let current = false;
let initialized = false;
const listeners = new Set<() => void>();

export function subscribeTheme(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function getThemeSnapshot(): boolean {
  if (!initialized && typeof document !== "undefined") {
    current = document.documentElement.classList.contains("dark");
    initialized = true;
  }
  return current;
}

export function getServerThemeSnapshot(): boolean {
  return false;
}

export function setTheme(dark: boolean) {
  current = dark;
  initialized = true;
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", dark);
  }
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("noteo-theme", dark ? "dark" : "light");
  }
  listeners.forEach((l) => l());
}