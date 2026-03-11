import {
  PortableText as SanityPortableText,
  type PortableTextReactComponents,
} from "@portabletext/react";
import { Link } from "react-router-dom";
import { urlFor } from "@/lib/sanity";
import type { BlockContent } from "@/lib/sanity";

/**
 * Custom Portable Text components for Base Layer Skin.
 *
 * Handles:
 * - Block styles: h2, h3, h4, blockquote, normal
 * - Lists: bullet + numbered
 * - Marks: strong, em, link, ingredientRef, productRef
 * - Inline images with hotspot-aware URLs
 */
const components: Partial<PortableTextReactComponents> = {
  // ── Block-level ─────────────────────────────────────────────
  block: {
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold mt-10 mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold mt-8 mb-3">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg font-semibold mt-6 mb-2">{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-border pl-4 italic my-6 text-muted-foreground">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
  },

  // ── Lists ───────────────────────────────────────────────────
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },

  // ── Inline marks / annotations ─────────────────────────────
  marks: {
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,

    link: ({ value, children }) => {
      const href = value?.href || "#";
      const isInternal = href.startsWith("/");
      const isExternal = href.startsWith("http");
      if (isInternal) {
        return (
          <Link to={href} className="text-primary underline hover:text-primary/80">
            {children}
          </Link>
        );
      }
      return (
        <a
          href={href}
          className="text-primary underline hover:text-primary/80"
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },

    // Inline ingredient mention — links to /ingredients/<slug>
    ingredientRef: ({ value, children }) => {
      const slug = value?.ingredient?.slug?.current;
      if (!slug) return <span>{children}</span>;
      return (
        <Link
          to={`/ingredients/${slug}`}
          className="text-primary underline decoration-dotted hover:text-primary/80"
        >
          {children}
        </Link>
      );
    },

    // Inline product mention — links to /face-cream
    productRef: ({ value, children }) => {
      return (
        <Link
          to="/face-cream"
          className="text-primary underline decoration-dotted hover:text-primary/80"
        >
          {children}
        </Link>
      );
    },
  },

  // ── Custom types ────────────────────────────────────────────
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      return (
        <figure className="my-8">
          <div className="aspect-[16/9] w-full overflow-hidden rounded-lg bg-muted">
            <img
              src={urlFor(value).width(800).auto("format").url()}
              alt={value.alt || ""}
              className="w-full h-full object-cover"
              width={800}
              height={450}
              loading="lazy"
              decoding="async"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
          {value.caption && (
            <figcaption className="text-sm text-muted-foreground mt-2 text-center">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },

    imageFigure: ({ value }) => (
      <figure className={`my-6 ${value.fullWidth ? 'w-full' : 'max-w-2xl mx-auto'}`}>
        {value.image?.asset && (
          <img
            src={urlFor(value.image).width(800).auto("format").url()}
            alt={value.alt || ""}
            className="w-full rounded"
            loading="lazy"
            width={800}
            height={450}
            style={{ aspectRatio: '16/9', objectFit: 'cover' }}
          />
        )}
        {value.caption && <figcaption className="text-sm text-muted-foreground mt-2">{value.caption}</figcaption>}
      </figure>
    ),

    scienceNote: ({ value }) => (
      <div className="bg-card border border-border rounded-lg p-6 my-6">
        <h4 className="font-heading font-semibold mb-2">{value.title || 'The Science'}</h4>
        <p className="text-muted-foreground">{value.body}</p>
        {value.citation?.studyTitle && (
          <p className="text-sm text-muted-foreground/60 mt-3">
            Source:{' '}
            {value.citation.url ? (
              <a href={value.citation.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                {value.citation.studyTitle}
              </a>
            ) : value.citation.studyTitle}
            {value.citation.journal && ` — ${value.citation.journal}`}
            {value.citation.year && ` (${value.citation.year})`}
          </p>
        )}
      </div>
    ),

    proTip: ({ value }) => (
      <div className="bg-card border-l-4 border-primary p-4 my-6">
        <p className="font-heading font-semibold text-primary text-sm mb-1">{value.label || 'Pro Tip'}</p>
        <p className="text-muted-foreground">{value.tip}</p>
      </div>
    ),

    ctaBlock: ({ value }) => (
      <div className="bg-card rounded-lg p-8 my-8 text-center border border-border">
        <h3 className="font-heading text-xl font-bold mb-2">{value.heading}</h3>
        {value.body && <p className="text-muted-foreground mb-4">{value.body}</p>}
        <a href={value.buttonUrl} className="inline-block bg-foreground text-background px-6 py-3 rounded font-heading font-semibold hover:opacity-90 transition-opacity">
          {value.buttonText || 'Shop Now'}
        </a>
      </div>
    ),
  },
};

interface PortableTextProps {
  value: BlockContent | undefined | null;
  className?: string;
}

export default function PortableText({ value, className }: PortableTextProps) {
  if (!value) return null;
  return (
    <div className={className ?? "prose prose-gray max-w-none"}>
      <SanityPortableText value={value as any} components={components} />
    </div>
  );
}
