import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/*
 * ROUTE-LEVEL ERROR BOUNDARY
 *
 * Wrapped around each <Route> element in App.tsx (via the `Wrap` helper),
 * not around the whole app. Every page renders its own <Navbar>/<Footer>
 * as part of the same component tree (see src/pages/*.tsx) — there is no
 * shared chrome above <Routes> to protect. What IS above <Routes> and would
 * die if this boundary sat higher up: the cookie-consent banner, the
 * Shopify cart drawer, and MetaRouterTracker. Scoping the boundary to each
 * route means a render-time throw on, say, /articles/some-slug, replaces
 * only that page's content — the cart drawer and consent banner (and every
 * other route) keep working. A single top-of-tree boundary would take all
 * of that down for one broken page.
 *
 * Composition with Suspense: this boundary wraps Suspense (not the other
 * way around), matching the standard React pattern — Suspense's fallback
 * is the loading spinner while a lazy chunk fetches; if the chunk fails to
 * load or the loaded component throws during render, the error propagates
 * up through Suspense to this boundary, which are two different failure
 * modes and need two different fallbacks.
 *
 * PRERENDER SAFETY (vite.config.ts Puppeteer step): before capturing a
 * page's HTML into dist/, the build waits for a <nav> AND a <footer> to
 * exist inside #root, up to a 20s timeout; if that wait times out the page
 * is marked failed and the pre-JS skeleton ships instead of any React
 * output. Because Navbar/Footer are rendered by the same page component
 * that would throw, a real crash during prerender makes that wait time out
 * -- the skeleton ships, never this fallback. This fallback additionally
 * renders no <nav>/<footer> itself, so it can never accidentally satisfy
 * that check either. Nothing below touches window/document at module
 * scope or in the constructor — only inside the reload button's onClick,
 * which never runs during prerender (Puppeteer doesn't click anything).
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // No error-reporting service wired up in this repo — console is the
    // only sink available without adding a dependency.
    console.error("[ErrorBoundary] caught a render error:", error, info.componentStack);
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E8E4DC] px-6 py-20">
        <div className="max-w-md w-full text-center">
          <h1 className="font-heading text-2xl md:text-3xl font-black uppercase tracking-tight text-[#1A2F4C] mb-4">
            Something broke.
          </h1>
          <p className="font-body text-sm md:text-base text-[#1A2F4C]/70 leading-relaxed mb-8">
            This page hit an error. Reload it, or head back to the store.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto font-heading text-xs font-bold uppercase tracking-[0.1em] px-8 py-3 rounded-[4px] bg-brand text-white hover:bg-brand-hover transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A2F4C]"
            >
              Reload
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto font-heading text-xs font-bold uppercase tracking-[0.1em] px-8 py-3 rounded-[4px] border-2 border-[#1A2F4C] text-[#1A2F4C] hover:bg-[#1A2F4C] hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A2F4C]"
            >
              Back to the store
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
