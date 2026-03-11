import { Instagram } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-16 pb-28 px-8 border-t border-border bg-[#E8EAE6]">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
          {/* Shop */}
          <div>
            <h3 className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-[#121212] mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><Link to="/face-cream" className="font-body text-xs text-[#7A8077] hover:text-[#121212] transition-colors py-2 inline-block">Daily Face Cream</Link></li>
              <li><Link to="/matte-moisturizer-for-men" className="font-body text-xs text-[#7A8077] hover:text-[#121212] transition-colors py-2 inline-block">Matte Moisturizer</Link></li>
              <li><Link to="/non-greasy-moisturizer-for-men" className="font-body text-xs text-[#7A8077] hover:text-[#121212] transition-colors py-2 inline-block">Non-Greasy Moisturizer</Link></li>
              <li><Link to="/all-in-one-skincare-for-men" className="font-body text-xs text-[#7A8077] hover:text-[#121212] transition-colors py-2 inline-block">All-in-One Skincare</Link></li>
            </ul>
          </div>

          {/* Learn */}
          <div>
            <h3 className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-foreground mb-4">Learn</h3>
            <ul className="space-y-2">
              <li><Link to="/articles" className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors py-2 inline-block">Articles</Link></li>
              <li><Link to="/ingredients" className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors py-2 inline-block">Ingredients</Link></li>
              <li><Link to="/skin-concerns" className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors py-2 inline-block">Skin Concerns</Link></li>
              <li><Link to="/comparisons" className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors py-2 inline-block">Compare Moisturizers</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-foreground mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors py-2 inline-block">About</Link></li>
              <li><a href="/#ingredients" className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors py-2 inline-block">Our Story</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-foreground mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="mailto:contact@baselayerskin.co" className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors py-2 inline-block">Contact Us</a></li>
            </ul>
            <div className="flex items-center gap-3 mt-4">
              <a href="https://www.instagram.com/baselayerskin/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors p-2 -m-2" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-muted-foreground tracking-wide">
            © 2026 Base Layer. All rights reserved.
          </p>
          <p className="font-body text-[10px] text-muted-foreground max-w-md text-center md:text-right leading-relaxed">
            These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
