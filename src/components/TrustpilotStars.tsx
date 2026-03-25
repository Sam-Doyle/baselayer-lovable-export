/**
 * Trustpilot-style green square stars.
 * Renders 5 filled squares with white star SVG inside.
 * The 5th star is partially filled to represent 4.8.
 */
const TrustpilotStars = ({ size = 14, className = "" }: { size?: number; className?: string }) => {
  const s = `${size}px`;
  const pad = `${size * 0.16}px`;
  return (
    <span className={`inline-flex items-center gap-[2px] ${className}`}>
      {[1, 2, 3, 4].map(i => (
        <span key={i} className="inline-block rounded-[2px] bg-[#00B67A] relative" style={{ width: s, height: s }}>
          <svg viewBox="0 0 24 24" fill="white" className="absolute inset-0 w-full h-full" style={{ padding: pad }}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </span>
      ))}
      <span className="inline-block rounded-[2px] bg-[#00B67A]/25 relative overflow-hidden" style={{ width: s, height: s }}>
        <span className="absolute left-0 top-0 w-[80%] h-full bg-[#00B67A] rounded-[2px]" />
        <svg viewBox="0 0 24 24" fill="white" className="absolute inset-0 w-full h-full z-10" style={{ padding: pad }}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </span>
    </span>
  );
};

export default TrustpilotStars;
