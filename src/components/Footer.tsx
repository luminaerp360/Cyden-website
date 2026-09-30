import React from 'react';
import { Phone, Mail, MapPin, ExternalLink, ShieldCheck, Instagram, Facebook, Award } from 'lucide-react';
import Logo from './Logo';
import { COMPANY_INFO } from '../data/companyData';
import { THEBAR_STOREFRONT_URL } from '../services/thebar';

// Custom SVG Icons for Twitter / X and TikTok
function XIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TikTokIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.73 1.5-.03 2.82-1.07 3.21-2.52.17-.55.22-1.13.21-1.71V.02z" />
    </svg>
  );
}

interface FooterProps {
  onNavigate: (route: string) => void;
  onResetAgeGate?: () => void;
}

export default function Footer({ onNavigate, onResetAgeGate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleNav = (route: string) => {
    onNavigate(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#122B4E] text-white pt-16 pb-12 border-t border-[#1B3E6F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Responsible Drinking & Gold Recognition Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1B3E6F] via-[#3AA88C]/30 to-[#1B3E6F] border border-[#3AA88C]/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full bg-[#F2A93B]/20 text-[#F2A93B] flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Official EABL Gold Distributor (2024)</h4>
              <p className="text-xs text-neutral-300">
                Authorized distribution partner for East African Breweries Limited across Uasin Gishu, Elgeyo Marakwet & Nandi.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => handleNav('/catalogue')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#3AA88C] hover:bg-[#2C856E] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <span>Order Drinks Online</span>
            </button>
          </div>
        </div>

        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Company Profile */}
          <div className="space-y-4">
            <Logo variant="dark" size="md" />
            <p className="text-sm text-neutral-300 leading-relaxed">
              Your trusted partner for quality products and exceptional service across all our branches. Supplying over 600 retail outlets, bars, and hospitality venues since 2013.
            </p>
            <div className="pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#F2A93B] block mb-2">
                Connect With Us
              </span>
              <div className="flex items-center gap-3">
                <a
                  href={COMPANY_INFO.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#E8582F] text-white flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href={COMPANY_INFO.socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#1B3E6F] text-white flex items-center justify-center transition-colors"
                  aria-label="X (Twitter)"
                >
                  <XIcon className="w-4 h-4" />
                </a>
                <a
                  href={COMPANY_INFO.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#3AA88C] text-white flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href={COMPANY_INFO.socials.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-neutral-800 text-white flex items-center justify-center transition-colors"
                  aria-label="TikTok"
                >
                  <TikTokIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#3AA88C]">
              Quick Links
            </h5>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>
                <button
                  onClick={() => handleNav('/')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/about-us')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  About Us & Story
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/catalogue')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Product Catalogue
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/branches')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Branches & Depots
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/contact-us')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Beverage Categories */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#3AA88C]">
              Featured Categories
            </h5>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>
                <button
                  onClick={() => handleNav('/catalogue')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Beer & Stouts (Tusker, Guinness)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/catalogue')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Finest Gins (Gilbeys, Gordons, Tanqueray)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/catalogue')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Vodka (Smirnoff, Chrome)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/catalogue')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Scotch Whisky (Johnnie Walker, Singleton)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/catalogue')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Rum & Spirits (Captain Morgan)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/catalogue')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Liqueurs & Cream (Baileys)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#3AA88C]">
              Contact Us
            </h5>
            <ul className="space-y-3 text-sm text-neutral-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#E8582F] flex-shrink-0 mt-0.5" />
                <span>Rupa Godowns, P.O Box 1629-30100, Eldoret, Kenya</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#3AA88C] flex-shrink-0" />
                <a href={`tel:${COMPANY_INFO.contact.primaryPhoneRaw}`} className="hover:text-white transition-colors">
                  {COMPANY_INFO.contact.primaryPhone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#F2A93B] flex-shrink-0" />
                <a href={`mailto:${COMPANY_INFO.contact.email}`} className="hover:text-white transition-colors">
                  {COMPANY_INFO.contact.email}
                </a>
              </li>
              <li className="text-xs text-neutral-400 pt-1">
                <strong>Sub-Store:</strong> Sitet Building, Iten — 0754 722 746
              </li>
              <li className="text-xs text-emerald-400 pt-1 flex items-center gap-1.5 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Open Everyday to 8:30 PM</span>
              </li>
            </ul>
          </div>
        </div>

        

        {/* Responsible Drinking Policy & Bottom Legal Strip */}
        <div className="border-t border-white/10 pt-8 space-y-4">
          <div className="p-4 rounded-xl bg-black/20 border border-white/5 text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F2A93B] mb-1">
              <ShieldCheck className="w-4 h-4 text-[#3AA88C]" />
              <span>Drink Responsibly</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Excessive alcohol consumption is harmful to your health. Strictly not for sale to persons under the age of 18 years. Cyden Distributors is committed to responsible beverage trade and compliance with national alcohol regulations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
              <p>© {currentYear} Cyden Distributors Limited. All rights reserved.</p>
              <span className="hidden sm:inline text-neutral-600">•</span>
              <a
                href="https://www.eco360.co.ke"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-[#3AA88C] transition-colors group"
              >
                <span>Powered by</span>
                <span className="font-semibold text-neutral-200 group-hover:text-white underline decoration-white/20 underline-offset-2 transition-colors">
                  eco360
                </span>
                <ExternalLink className="w-3 h-3 text-neutral-500 group-hover:text-[#3AA88C] transition-colors" />
              </a>
            </div>

            <div className="flex items-center gap-4">
              <span>Eldoret, Kenya</span>
              <span>•</span>
              <span>EABL Gold Distributor 2024</span>
              {onResetAgeGate && (
                <>
                  <span>•</span>
                  <button
                    onClick={onResetAgeGate}
                    className="hover:text-[#F2A93B] underline cursor-pointer"
                    title="Test or reset the 18+ Age Gate verification modal"
                  >
                    Reset Age Gate (Tester)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
