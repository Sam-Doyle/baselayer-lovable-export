import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { retirePrerenderSnapshot } from "@/lib/prerenderHandoff";

/**
 * A prerender shell is useful only for the route that supplied its initial
 * paint. Once the SPA leaves that route, keeping it visible would overlay stale
 * pixels on the destination. A layout effect retires it before the new route
 * is painted, so there is no mixed-page transition frame.
 */
const PrerenderSnapshotRouteGuard = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const snapshot = document.getElementById("bl-prerender-root");
    if (snapshot?.dataset.prerenderPath === pathname) return;
    if (snapshot) retirePrerenderSnapshot(snapshot);
  }, [pathname]);

  return null;
};

export default PrerenderSnapshotRouteGuard;
