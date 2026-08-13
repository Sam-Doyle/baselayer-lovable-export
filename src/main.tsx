import { useLayoutEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { hideSnapshotConsentBanner } from "./lib/prerenderHandoff.ts";
import "./index.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing #root element");
}

const prerenderSnapshot = document.getElementById("bl-prerender-root");

// This bootstrap-only component intentionally lives beside createRoot so the
// prerender handoff stays atomic; it is not part of the hot-reload surface.
// eslint-disable-next-line react-refresh/only-export-components
const ClientReady = ({ onReady }: { onReady: () => void }) => {
  useLayoutEffect(() => {
    const frame = requestAnimationFrame(onReady);
    return () => cancelAnimationFrame(frame);
  }, [onReady]);

  return <App />;
};

if (prerenderSnapshot && window.location.pathname === "/") {
  const revealClientApp = () => {
    // The snapshot and live app initially contain identical consent banners.
    // Once React is ready, only the live copy may remain visible; otherwise a
    // closed live banner exposes the inert snapshot banner underneath it.
    hideSnapshotConsentBanner(prerenderSnapshot);

    // Keep the inert snapshot as a one-viewport visual shell instead of
    // deleting its nodes; deletion is scored as a layout shift even when an
    // identical client node sits beneath it. The shell scrolls away naturally,
    // while the live client tree receives pointer and keyboard interaction.
    prerenderSnapshot.style.pointerEvents = "none";
    prerenderSnapshot.setAttribute("aria-hidden", "true");
    prerenderSnapshot.inert = true;
  };

  createRoot(root).render(<ClientReady onReady={revealClientApp} />);
} else {
  createRoot(root).render(<App />);
}
