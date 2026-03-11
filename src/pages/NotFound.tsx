import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useMetaTags } from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useMetaTags({
    title: "Page Not Found | Base Layer",
    description: "This page doesn't exist. Head back to Base Layer for men's skincare built for real life.",
  });

  useEffect(() => {
    // Add noindex meta for 404 pages
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);

    return () => {
      meta.remove();
    };
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-6">
        <h1 className="font-heading text-7xl md:text-9xl font-black text-foreground mb-4">404</h1>
        <p className="font-body text-lg text-muted-foreground mb-8">This page doesn't exist.</p>
        <Link
          to="/"
          className="inline-block font-body text-sm uppercase tracking-[0.2em] text-foreground border border-foreground px-8 py-3 hover:bg-foreground hover:text-background transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
