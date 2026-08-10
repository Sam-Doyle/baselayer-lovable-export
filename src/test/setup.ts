import "@testing-library/jest-dom";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// jsdom@20 in this sandbox doesn't expose a working window.localStorage
// (it resolves to Node's own gated experimental global instead), which
// breaks zustand's `persist` middleware (cartStore.ts) since it reads the
// bare `localStorage` identifier. Polyfill with a minimal in-memory Storage
// only when the real one isn't usable, so persisted-store tests exercise
// the actual persist/partialize config rather than a mock of it.
function hasWorkingStorage(getStorage: () => Storage | undefined): boolean {
  try {
    const storage = getStorage();
    if (!storage) return false;
    storage.setItem("__probe__", "1");
    storage.removeItem("__probe__");
    return true;
  } catch {
    return false;
  }
}

class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear(): void {
    this.store.clear();
  }
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

if (!hasWorkingStorage(() => window.localStorage)) {
  const memoryLocalStorage = new MemoryStorage();
  Object.defineProperty(window, "localStorage", { value: memoryLocalStorage, writable: true, configurable: true });
  Object.defineProperty(globalThis, "localStorage", { value: memoryLocalStorage, writable: true, configurable: true });
}
