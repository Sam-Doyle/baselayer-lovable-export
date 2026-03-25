import { useState, useEffect, useCallback } from 'react';

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (e.clientY < 10 && !dismissed && !submitted) {
      if (!sessionStorage.getItem('bl_exit_shown')) {
        setShow(true);
        sessionStorage.setItem('bl_exit_shown', 'true');
      }
    }
  }, [dismissed, submitted]);

  useEffect(() => {
    if (window.innerWidth > 768) {
      document.addEventListener('mouseleave', handleMouseLeave);
      return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }
  }, [handleMouseLeave]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.from('waitlist').insert({ email: email.trim(), source: 'exit_intent' });
    } catch {}
    setSubmitted(true);
  };

  if (!show || dismissed) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => setDismissed(true)}>
      <div className="bg-white max-w-md mx-4 p-8 relative" onClick={e => e.stopPropagation()}>
        <button onClick={() => setDismissed(true)}
          className="absolute top-3 right-4 text-[#6B7280] hover:text-[#1A2F4C] text-2xl leading-none" aria-label="Close">&times;</button>
        {!submitted ? (
          <>
            <h3 className="font-heading font-bold text-2xl text-[#1A2F4C] uppercase tracking-wide mb-2">
              NOT READY YET?
            </h3>
            <p className="text-[15px] text-[#4A5568] mb-6 font-body">
              We get it. Drop your email and we'll let you know when Batch 01 ships. One email. No spam.
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Your email"
                aria-label="Email address"
                className="flex-1 border border-[#E2E8F0] px-4 py-3 text-sm font-body focus:outline-none focus:border-[#1A2F4C] bg-white" />
              <button type="submit"
                className="bg-[#D94E12] text-white font-heading font-bold text-xs tracking-wider uppercase px-6 py-3 hover:bg-[#C04510] whitespace-nowrap">
                NOTIFY ME
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="text-3xl mb-2">✓</div>
            <p className="font-heading font-bold text-lg text-[#1A2F4C]">You're on the list.</p>
            <p className="font-body text-sm text-[#6B7280] mt-1">We'll reach out when it's time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
