/**
 * The homepage keeps its prerendered first viewport as a visual shell to
 * protect LCP and CLS while React mounts underneath it. Fixed interactive UI
 * must not remain visible in both trees after that handoff: the live copy owns
 * state and interaction from this point forward.
 */
export function hideSnapshotConsentBanner(snapshot: HTMLElement): void {
  const banner = snapshot.querySelector<HTMLElement>('[aria-label="Cookie consent"]');
  if (!banner) return;

  banner.style.display = "none";
  banner.setAttribute("aria-hidden", "true");
}

/**
 * Fixed elements inside the one-viewport snapshot stay fixed to the browser,
 * not to the snapshot's document position. If they survive hydration they get
 * clipped by the snapshot's `overflow:hidden` boundary as the page scrolls,
 * leaving stale header fragments underneath the live UI. The client app owns
 * these elements after handoff; the snapshot should retain only page content.
 */
export function hideSnapshotFixedUi(snapshot: HTMLElement): void {
  snapshot.querySelectorAll<HTMLElement>("[data-prerender-handoff-hide]").forEach((element) => {
    element.style.display = "none";
    element.setAttribute("aria-hidden", "true");
  });
}

/** Permanently retire the initial homepage shell after the SPA leaves `/`. */
export function retirePrerenderSnapshot(snapshot: HTMLElement): void {
  snapshot.style.display = "none";
  snapshot.style.pointerEvents = "none";
  snapshot.setAttribute("aria-hidden", "true");
  snapshot.inert = true;
}
