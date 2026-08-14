import { useLayoutEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import {
  hideSnapshotConsentBanner,
  hideSnapshotFixedUi,
  retirePrerenderSnapshot,
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
  const isSingleBottleOffer =
    isFaceCreamHandoff && new URLSearchParams(window.location.search).get("offer") === "single";
  const isMobileSingleBottleOffer =
    isSingleBottleOffer && window.matchMedia("(max-width: 768px)").matches;

  if (isFaceCreamHandoff) {
    root.dataset.prerenderHandoff = "active";
    if (isMobileSingleBottleOffer) {
      // The build snapshot uses the direct-PDP two-bottle default. Acquisition
      // links that explicitly promise one bottle keep only the identical
      // navigation + gallery portion of that snapshot; the live $38 offer is
      // visible below it from the first frame, so $68 and $38 never conflict.
      prerenderSnapshot.style.height = "515px";
    }
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

    if (isFaceCreamHandoff) {
      const interactionEvents = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
      const completeFaceCreamHandoff = () => {
        // Reveal the live gallery and retire the identical shell in one task,
        // before the next paint. The initiating input also closes the browser's
        // LCP window, so an interacted-with PDP cannot manufacture a late LCP.
        delete root.dataset.prerenderHandoff;
        retirePrerenderSnapshot(prerenderSnapshot);
        interactionEvents.forEach((eventName) => {
          window.removeEventListener(eventName, completeFaceCreamHandoff, true);
        });
      };

      // On desktop the offer copy shares the first row with the gallery, so a
      // partial shell cannot isolate it. Retire the shell as soon as React is
      // ready; desktop remains fast, while the selected $38 state is truthful.
      if (isSingleBottleOffer && !isMobileSingleBottleOffer) {
        completeFaceCreamHandoff();
        return;
      }

      interactionEvents.forEach((eventName) => {
        window.addEventListener(eventName, completeFaceCreamHandoff, {
          capture: true,
          once: true,
          passive: eventName === "wheel" || eventName === "touchstart",
        });
      });
    }
  };

  createRoot(root).render(<ClientReady onReady={revealClientApp} />);
} else {
  createRoot(root).render(<App />);
}
