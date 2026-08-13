import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { retirePrerenderSnapshot } from "@/lib/prerenderHandoff";

/**
 * The homepage prerender shell is useful only for the initial homepage paint.
 * Once the SPA leaves `/`, keeping it visible would overlay stale homepage
 * pixels on the destination route. A layout effect retires it before the new
 * route is painted, so there is no mixed-page transition frame.
 */
const PrerenderSnapshotRouteGuard = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    if (pathname === "/") return;

    const snapshot = document.getElementById("bl-prerender-root");
    if (snapshot) retirePrerenderSnapshot(snapshot);
  }, [pathname]);

  return null;
};

export default PrerenderSnapshotRouteGuard;
