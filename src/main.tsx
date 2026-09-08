import { useLayoutEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import {
  hideSnapshotConsentBanner,
  hideSnapshotFixedUi,
} from "./lib/prerenderHandoff.ts";
import "./index.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing #root element");
}

const prerenderSnapshot = document.getElementById("bl-prerender-root");
const hasMatchingPrerenderSnapshot =
  prerenderSnapshot?.dataset.prerenderPath === window.location.pathname;

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

if (prerenderSnapshot && hasMatchingPrerenderSnapshot) {
  const isFaceCreamHandoff = window.location.pathname === "/face-cream";

  if (isFaceCreamHandoff) {
    root.dataset.prerenderHandoff = "active";
  }

  const revealClientApp = () => {
    // The snapshot and live app initially contain identical consent banners.
    // Once React is ready, only the live copy may remain visible; otherwise a
    // closed live banner exposes the inert snapshot banner underneath it.
    hideSnapshotConsentBanner(prerenderSnapshot);
    // Fixed snapshot UI does not scroll with the shell and gets clipped into
    // stale fragments under the live header. React owns all fixed UI now.
    hideSnapshotFixedUi(prerenderSnapshot);

    // Keep the inert snapshot as a one-viewport visual shell instead of
    // deleting its nodes; deletion is scored as a layout shift even when an
    // identical client node sits beneath it. The shell scrolls away naturally,
    // while the live client tree receives pointer and keyboard interaction.
    prerenderSnapshot.style.pointerEvents = "none";
    prerenderSnapshot.setAttribute("aria-hidden", "true");
    prerenderSnapshot.inert = true;
  };

  // App can commit its Suspense fallback before the lazy PDP exists. Only the
  // PDP's own layout effect can safely reveal its live offer and gallery.
  createRoot(root).render(isFaceCreamHandoff ? <App /> : <ClientReady onReady={revealClientApp} />);
} else {
  createRoot(root).render(<App />);
}
