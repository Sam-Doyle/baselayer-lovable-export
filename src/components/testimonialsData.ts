// Shared testimonial data + FTC material-connection disclosure, split out
// of TestimonialsSection.tsx so both the homepage section and the product
// page can import the same source data without a fast-refresh warning
// (react-refresh/only-export-components) from mixing data exports into a
// component file.

// FTC 16 CFR Part 255 material-connection disclosure: these testers
// received free product. Reused verbatim wherever their testimonials
// appear so the disclosure stays consistent. Do not call them
// "customers", "verified buyers", or "reviews" — they are testers.
export const TESTIMONIAL_DISCLOSURE =
  "Disclosure: The testers pictured received free Base Layer product in exchange for their honest feedback. They are product testers, not paying customers or verified buyers.";

export const testimonials = [
  {
    image: "/images/testimonials/sean.webp",
    fallback: "/images/testimonials/sean.png",
    stars: 5,
    quote: "I used to blot my forehead before every afternoon meeting. After about a week on Base Layer, I just stopped. My skin stays matte all day and it doesn't feel dry or tight.",
    name: "Sean, 34",
    detail: "Oily skin · Denver, CO",
    tag: "BEST FOR OILY SKIN",
  },
  {
    image: "/images/testimonials/marcus.webp",
    fallback: "/images/testimonials/marcus.png",
    stars: 5,
    quote: "My girlfriend kept saying my skin looked different, like clearer and healthier. I hadn't even told her I was trying anything new. That's when I figured it was actually working.",
    name: "Marcus, 28",
    detail: "Combination skin · Austin, TX",
    tag: "MOST NOTICED",
  },
  {
    image: "/images/testimonials/cooper.webp",
    fallback: "/images/testimonials/cooper.png",
    stars: 5,
    quote: "Hotel air, airplane cabins, hiking in January. Everything used to wreck my skin. Now I throw one bottle in my bag and forget about it. Goes on fast, no grease, done.",
    name: "Cooper, 27",
    detail: "Dry skin · Boulder, CO",
    tag: "BEST FOR TRAVEL",
  },
];
