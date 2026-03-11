

# Add Blog with Sanity CMS to Base Layer

## Overview

Add a headless-CMS-powered blog to the existing Base Layer skincare site. Content is managed in Sanity Studio (external) and fetched at runtime via Sanity's CDN API -- no redeploy needed to publish new posts.

## New Dependencies

- `@sanity/client` -- lightweight fetch client for Sanity's Content API
- `@portabletext/react` -- renders Sanity's Portable Text (rich text) as React components
- `@sanity/image-url` -- generates optimized image URLs from Sanity image assets

## Sanity Project Setup (Manual, Outside Lovable)

You will need a Sanity project with a dataset containing a `post` schema. Typical fields:

- `title` (string)
- `slug` (slug)
- `excerpt` (text)
- `mainImage` (image)
- `body` (array of blocks -- Portable Text)
- `publishedAt` (datetime)
- `author` (string or reference)

The Sanity Project ID and Dataset name are public/read-only values and will be stored as constants in the codebase (no secrets needed for read-only access with a public dataset).

## File Changes

### 1. New: `src/lib/sanity.ts` -- Sanity client + helpers

- Initialize `@sanity/client` with project ID, dataset, API version, and `useCdn: true`
- Export GROQ query functions:
  - `getAllPosts()` -- fetches list of posts (title, slug, excerpt, mainImage, publishedAt) ordered by date
  - `getPostBySlug(slug)` -- fetches single post with full body
- Export `urlFor(source)` helper using `@sanity/image-url` for responsive image URLs

### 2. New: `src/pages/Blog.tsx` -- Blog listing page (`/blog`)

- Uses `@tanstack/react-query` to fetch all posts via `getAllPosts()`
- Displays a grid of post cards (image, title, excerpt, date)
- Each card links to `/blog/:slug`
- Includes Navbar and Footer for consistent layout
- Fires Meta Pixel `ViewContent` event with `content_name: "Blog"` on mount
- Loading skeleton state while posts load

### 3. New: `src/pages/BlogPost.tsx` -- Individual post page (`/blog/:slug`)

- Uses `useParams` to get slug, fetches post via `getPostBySlug(slug)`
- Renders hero image, title, date, and rich text body via `@portabletext/react`
- Custom Portable Text components for images, links, headings
- Fires Meta Pixel `ViewContent` event with `content_name: post.title`
- SEO: Sets `document.title` and meta description dynamically via `useEffect`
- Back link to `/blog`

### 4. Update: `src/App.tsx` -- Add routes

- Add lazy-loaded imports for `Blog` and `BlogPost`
- Add routes:
  - `/blog` -> `<Blog />`
  - `/blog/:slug` -> `<BlogPost />`

### 5. Update: `src/components/Navbar.tsx` -- Add Blog nav link

- Add "Blog" link in both desktop and mobile navigation menus

### 6. Update: `src/analytics/MetaRouterTracker.tsx` -- No changes needed

- `ViewContent` events will be fired from the blog pages directly; the existing `PageView` tracker already handles route-level tracking

## Meta Pixel Tracking

- **PageView**: Already handled by `MetaRouterTracker` on every route change (covers `/blog` and `/blog/:slug`)
- **ViewContent**: Fired from each blog page using the existing `track()` helper from `src/analytics/metaPixel.ts`

## Technical Notes

- Sanity's public API requires no authentication for read-only access, so no secrets or edge functions are needed
- Content is served from Sanity's global CDN with caching handled by `react-query` (stale time of ~5 minutes)
- The `@tailwindcss/typography` dev dependency is already installed and will be used for the `prose` class on blog post body text
- No database changes required

