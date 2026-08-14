const skinProfiles = [
  {
    title: "Oily + combination",
    eyebrow: "For visible shine",
    description: "Lightweight hydration with a matte finish, plus 5% niacinamide.",
  },
  {
    title: "Breakout-prone",
    eyebrow: "For a simpler routine",
    description: "Designed to be non-comedogenic. Patch test first if your skin is reactive.",
  },
  {
    title: "Post-shave + sensitive",
    eyebrow: "For easily irritated skin",
    description: "Two percent panthenol and centella support comfortable-feeling skin.",
  },
  {
    title: "Dry + dehydrated",
    eyebrow: "For tight-feeling skin",
    description: "Squalane and hyaluronic acid help hold moisture without a heavy feel.",
  },
] as const;

/**
 * Informational audience profiles, not navigation.
 *
 * The cards react to hover and keyboard focus on larger screens, while their
 * useful copy stays visible on touch devices. They intentionally do not carry
 * link or button semantics because selecting a profile has no destination or
 * downstream state change.
 */
const SkinProfileCards = () => (
  <section aria-labelledby="skin-profiles-heading" className="mx-auto max-w-[1200px] px-6 py-14 md:py-20">
    <div className="mx-auto mb-9 max-w-[620px] text-center md:mb-12">
      <h2 id="skin-profiles-heading" className="font-heading text-2xl font-bold uppercase tracking-wide text-[#1A2F4C] md:text-3xl">
        Who This Is For
      </h2>
      <p className="mt-3 font-body text-[14px] leading-[1.6] text-[#6B7280] md:text-[15px]">
        Four common skin profiles. One lightweight daily formula.
      </p>
    </div>

    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
      {skinProfiles.map((profile, index) => (
        <li key={profile.title}>
          <article
            tabIndex={0}
            className="group relative min-h-[156px] overflow-hidden border border-[#D8DDE5] bg-white p-5 shadow-[0_1px_2px_rgba(26,47,76,0.04)] transition-[border-color,background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-[#1A2F4C] hover:bg-[#F7F4EE] hover:shadow-[0_8px_24px_rgba(26,47,76,0.09)] focus-visible:-translate-y-0.5 focus-visible:border-[#1A2F4C] focus-visible:bg-[#F7F4EE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2F4C] focus-visible:ring-offset-2 md:min-h-[174px] md:p-6"
          >
            <span className="font-heading text-[10px] font-bold uppercase tracking-[0.16em] text-[#6B7280] transition-colors group-hover:text-brand group-focus-visible:text-brand">
              {profile.eyebrow}
            </span>
            <div className="mt-8 flex items-end justify-between gap-4 md:mt-10">
              <div>
                <h3 className="font-heading text-[16px] font-bold uppercase leading-[1.15] text-[#1A2F4C] md:text-[18px]">
                  {profile.title}
                </h3>
                <p className="mt-2 max-w-[420px] font-body text-[13px] leading-[1.55] text-[#4A5568] md:text-[14px]">
                  {profile.description}
                </p>
              </div>
              <span aria-hidden="true" className="font-heading text-[18px] text-[#596779] transition-[color,transform] duration-200 group-hover:-translate-y-1 group-hover:text-brand group-focus-visible:-translate-y-1 group-focus-visible:text-brand">
                0{index + 1}
              </span>
            </div>
          </article>
        </li>
      ))}
    </ul>
  </section>
);

export default SkinProfileCards;
