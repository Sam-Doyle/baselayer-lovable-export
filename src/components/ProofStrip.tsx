const proofPoints = [
  { value: "Niacinamide + Peptides", label: "Clinical Actives" },
  { value: "15 sec", label: "Full absorption" },
  { value: "30 days", label: "Money-back guarantee" },
  { value: "Free", label: "U.S. shipping" },
];

const ProofStrip = () => {
  return (
    <section aria-label="Product proof" className="border-y border-[#1A2F4C]/12 bg-[#FBF9F5]">
      <dl className="mx-auto grid max-w-[1200px] grid-cols-2 px-4 py-1 md:grid-cols-4 md:px-8">
        {proofPoints.map((point, index) => (
          <div
            key={point.label}
            className={`flex min-h-[82px] flex-col justify-center px-4 py-4 text-center md:min-h-[92px] ${
              index % 2 === 1 ? "border-l border-[#1A2F4C]/12" : ""
            } ${index > 1 ? "border-t border-[#1A2F4C]/12 md:border-t-0" : ""} ${
              index > 1 ? "md:border-l" : index === 1 ? "md:border-l" : ""
            }`}
          >
            <dt className="order-2 mt-1 font-body text-[11px] font-medium text-[#1A2F4C]/70 md:text-[12px]">
              {point.label}
            </dt>
            <dd className="order-1 font-heading text-[18px] font-black uppercase leading-[1.05] tracking-[-0.02em] text-[#1A2F4C] md:text-[21px]">
              {point.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default ProofStrip;
