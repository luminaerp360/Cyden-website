import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export interface HeroSlide {
  id: string;
  tag: string;
  headlineLine1: string;
  headlineLine2: string;
  subtitle: string;
  packshot: string;
  heroBg: string;
  category: string;
  badgeTop: string;
  badgeBottom: string;
  badgeColor?: string;
  bgGradient: string;
  curtainColor: string;
  legalText: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'jw-black',
    tag: 'EABL PRESTIGE SCOTCH',
    headlineLine1: 'IGNITE THE',
    headlineLine2: 'SMOLDERING RICHNESS',
    subtitle: 'Iconic 12-year-old blended Scotch whisky with layers of dark fruits, sweet vanilla, and signature peat smoke.',
    packshot: 'https://lumina360.sfo3.digitaloceanspaces.com/eccomerse/cyden/products/636862_johnnie_walker_black_label_375ml_bottle_.png',
    heroBg: '/hero/johnnie-walker-hero.jpg',
    category: 'Whisky',
    badgeTop: '20%',
    badgeBottom: 'OFF',
    badgeColor: '#E8582F',
    bgGradient: 'radial-gradient(ellipse at 30% 50%, rgba(245, 158, 11, 0.45) 0%, rgba(180, 83, 9, 0.28) 45%, rgba(18, 8, 2, 0.98) 85%), linear-gradient(135deg, #3D1906 0%, #200E03 50%, #0A1422 100%)',
    curtainColor: 'rgba(255, 255, 255, 0.08)',
    legalText: 'ENJOY RESPONSIBLY | T&C APPLY • 100% FACTORY-SEALED GENUINE EABL',
  },
  {
    id: 'tusker',
    tag: "KENYA'S FLAGSHIP LAGER",
    headlineLine1: 'CRAFTED KENYAN',
    headlineLine2: 'HERITAGE',
    subtitle: 'Brewed with 100% African ingredients: locally malted barley, golden corn starch, and Aberdare mountain water.',
    packshot: 'https://lumina360.sfo3.digitaloceanspaces.com/eccomerse/cyden/products/P764354_tusker_lager_500ml_bottle_x6.png',
    heroBg: '/hero/tusker-hero.jpg',
    category: 'Beer',
    badgeTop: 'KENYA',
    badgeBottom: 'NO. 1',
    badgeColor: '#E8582F',
    bgGradient: 'radial-gradient(ellipse at 30% 50%, rgba(251, 191, 36, 0.45) 0%, rgba(180, 83, 9, 0.28) 45%, rgba(16, 11, 2, 0.98) 85%), linear-gradient(135deg, #352104 0%, #1E1302 50%, #081320 100%)',
    curtainColor: 'rgba(255, 255, 255, 0.08)',
    legalText: 'ENJOY RESPONSIBLY | T&C APPLY • OFFICIAL EABL STOCK',
  },
  {
    id: 'gilbeys',
    tag: 'DISTILLED LONDON DRY GIN',
    headlineLine1: 'DISTILLED BOTANICAL',
    headlineLine2: 'PERFECTION',
    subtitle: 'Crafted from 12 classic botanicals delivering crisp juniper elegance and a refreshing, balanced citrus finish.',
    packshot: 'https://lumina360.sfo3.digitaloceanspaces.com/eccomerse/cyden/products/604021_gilbey_s_special_dry_gin_750ml_bottle_.png',
    heroBg: '/hero/gilbeys-hero.jpg',
    category: 'Gin',
    badgeTop: 'TOP',
    badgeBottom: 'SELLER',
    badgeColor: '#E8582F',
    bgGradient: 'radial-gradient(ellipse at 30% 50%, rgba(58, 168, 140, 0.45) 0%, rgba(16, 185, 129, 0.28) 45%, rgba(3, 20, 15, 0.98) 85%), linear-gradient(135deg, #073527 0%, #031E16 50%, #061320 100%)',
    curtainColor: 'rgba(255, 255, 255, 0.08)',
    legalText: 'ENJOY RESPONSIBLY | T&C APPLY • DIRECT DEPOT DISPATCH',
  },
  {
    id: 'smirnoff',
    tag: 'TRIPLE DISTILLED & 10X FILTERED',
    headlineLine1: 'ULTRA SMOOTH',
    headlineLine2: 'CHARCOAL PURITY',
    subtitle: 'Triple distilled and filtered ten times through seven columns of charcoal for unparalleled smoothness and clean finish.',
    packshot: 'https://lumina360.sfo3.digitaloceanspaces.com/eccomerse/cyden/products/650278_smirnoff_red_vodka_750ml_bottle_.png',
    heroBg: '/hero/smirnoff-hero.jpg',
    category: 'Vodka',
    badgeTop: 'PURE',
    badgeBottom: 'NO. 21',
    badgeColor: '#E8582F',
    bgGradient: 'radial-gradient(ellipse at 30% 50%, rgba(239, 68, 68, 0.45) 0%, rgba(185, 28, 28, 0.28) 45%, rgba(22, 3, 8, 0.98) 85%), linear-gradient(135deg, #420A14 0%, #24050A 50%, #08111E 100%)',
    curtainColor: 'rgba(255, 255, 255, 0.08)',
    legalText: 'ENJOY RESPONSIBLY | T&C APPLY • 100% ORIGINAL GUARANTEED',
  },
  {
    id: 'guinness',
    tag: 'ROASTED BARLEY STOUT',
    headlineLine1: 'DEEP ROASTED',
    headlineLine2: 'EXTRA STOUT',
    subtitle: 'Exclusively brewed with roasted unmalted barley delivering its signature dark ruby character, deep aroma, and rich foam.',
    packshot: 'https://lumina360.sfo3.digitaloceanspaces.com/eccomerse/cyden/products/P764356_guinness_foreign_extra_stout_500ml_bottl.png',
    heroBg: '/hero/guinness-hero.jpg',
    category: 'Beer',
    badgeTop: 'EXTRA',
    badgeBottom: 'STOUT',
    badgeColor: '#E8582F',
    bgGradient: 'radial-gradient(ellipse at 30% 50%, rgba(217, 119, 6, 0.45) 0%, rgba(146, 64, 14, 0.28) 45%, rgba(18, 9, 2, 0.98) 85%), linear-gradient(135deg, #301604 0%, #1A0B02 50%, #07111D 100%)',
    curtainColor: 'rgba(255, 255, 255, 0.08)',
    legalText: 'ENJOY RESPONSIBLY | T&C APPLY • ELDORET & ITEN HUBS',
  },
];

// Scalloped Sunburst 20% OFF / Deal Badge matching chupachap.co.ke
function ScallopedBadge({ top, bottom, color = '#E8582F' }: { top: string; bottom: string; color?: string }) {
  return (
    <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 flex items-center justify-center filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)] select-none">
      <svg viewBox="0 0 100 100" className="w-full h-full transform-gpu">
        <path
          d="M50 0 L58 12 L72 7 L76 21 L90 20 L89 35 L100 40 L94 53 L100 64 L89 71 L90 85 L76 84 L72 98 L58 92 L50 104 L42 92 L28 98 L24 84 L10 85 L11 71 L0 64 L6 53 L0 40 L11 35 L10 20 L24 21 L28 7 L42 12 Z"
          fill={color}
        />
        <circle cx="50" cy="52" r="37" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" strokeDasharray="2 3" />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center leading-none">
        <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tight drop-shadow-md uppercase">
          {top}
        </span>
        <span className="text-xs sm:text-sm md:text-base lg:text-lg font-extrabold tracking-wider drop-shadow-md uppercase mt-0.5">
          {bottom}
        </span>
      </div>
    </div>
  );
}

interface HeroBannerProps {
  onNavigate: (route: string, filterCategory?: string) => void;
  onOpenOrderModal: (product?: any) => void;
}

export default function HeroBanner({ onNavigate, onOpenOrderModal }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Preload all packshots & hero backgrounds on mount
  useEffect(() => {
    HERO_SLIDES.forEach((slide) => {
      const img1 = new Image();
      img1.src = slide.packshot;
      const img2 = new Image();
      img2.src = slide.heroBg;
    });
  }, []);

  // Fast 3.5s rotation (changes every 3 to 4 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  return (
    <div className="relative w-full overflow-hidden select-none bg-[#091524]">
      {/* FULL-WIDTH HERO CAROUSEL BANNER */}
      <div className="relative w-full h-[520px] sm:h-[580px] md:h-[630px] lg:h-[700px] xl:h-[740px] overflow-hidden bg-[#0A1626]">
        
        {/* Pre-mounted Slides with Smooth Cross-Fade */}
        {HERO_SLIDES.map((slide, idx) => {
          const isCurrent = idx === currentIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center ${
                isCurrent ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
              style={{ background: slide.bgGradient }}
            >
              {/* Atmospheric Background Photo (Matching Product Hero Studio) */}
              <img
                src={slide.heroBg}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-luminosity pointer-events-none"
              />

              {/* Vertical Satin Stage Light Columns */}
              <div
                className="absolute inset-0 pointer-events-none opacity-75"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(90deg, 
                      transparent 0%, 
                      transparent 6%, 
                      ${slide.curtainColor} 11%, 
                      transparent 16%, 
                      transparent 22%, 
                      ${slide.curtainColor} 27%, 
                      transparent 32%
                    )
                  `,
                }}
              />

              {/* Edge Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 pointer-events-none" />

              {/* Full-Width Content Layout */}
              <div className="relative z-10 w-full h-full px-8 sm:px-16 md:px-20 lg:px-28 xl:px-36 flex flex-col md:flex-row items-center justify-between">
                
                {/* Left Side: Product Packshot + Scalloped Badge */}
                <div className="w-full md:w-1/2 h-full flex items-center justify-center md:justify-end lg:pr-12 xl:pr-16 relative">
                  
                  {/* Scalloped Badge (Overlapping left shoulder of bottle) */}
                  <div className="absolute top-10 left-4 sm:top-14 sm:left-10 md:top-16 md:left-2 lg:left-6 xl:left-12 z-20 pointer-events-none">
                    <ScallopedBadge
                      top={slide.badgeTop}
                      bottom={slide.badgeBottom}
                      color={slide.badgeColor}
                    />
                  </div>

                  {/* Bottle Packshot */}
                  <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl h-[78%] sm:h-[82%] md:h-[86%] lg:h-[90%] flex items-center justify-center">
                    {/* Pedestal Shadow */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-64 sm:w-80 md:w-96 h-6 bg-black/90 rounded-[100%] blur-[10px] pointer-events-none" />

                    <img
                      src={slide.packshot}
                      alt={`${slide.headlineLine1} ${slide.headlineLine2}`}
                      loading="eager"
                      className="relative z-10 max-h-full max-w-full object-contain drop-shadow-[0_35px_55px_rgba(0,0,0,0.92)] hover:scale-105 transition-transform duration-500 cursor-pointer"
                      onClick={() => onNavigate('/catalogue', slide.category)}
                    />
                  </div>
                </div>

                {/* Right Side: Big Bold White Typography (NO PRICES) */}
                <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left space-y-4 sm:space-y-6 lg:pl-10 xl:pl-16">
                  
                  {/* Category / Collection Tag */}
                  <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{slide.tag}</span>
                  </div>

                  {/* Monumental 2-Line Headline */}
                  <h1 className="text-white font-black text-4xl sm:text-6xl md:text-5xl lg:text-7xl xl:text-8xl tracking-tight leading-[0.92] uppercase drop-shadow-2xl">
                    <span>{slide.headlineLine1}</span>
                    <br />
                    <span>{slide.headlineLine2}</span>
                  </h1>

                  {/* Subtitle Description */}
                  <p className="text-sm sm:text-base lg:text-lg text-neutral-200 max-w-xl font-medium leading-relaxed drop-shadow-md">
                    {slide.subtitle}
                  </p>

                  {/* CTA Buttons */}
                  <div className="pt-2 sm:pt-4 flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <button
                      onClick={() => onNavigate('/catalogue', slide.category)}
                      className="px-8 py-3.5 sm:py-4 rounded-xl bg-[#3AA88C] hover:bg-[#2F8D75] text-white font-black text-sm sm:text-base tracking-wide transition-all shadow-xl flex items-center gap-2 cursor-pointer hover:scale-105"
                    >
                      <span>Explore Drinks</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => onOpenOrderModal()}
                      className="px-8 py-3.5 sm:py-4 rounded-xl bg-[#E8582F] hover:bg-[#D04620] text-white font-black text-sm sm:text-base tracking-wide transition-all shadow-xl flex items-center gap-2 cursor-pointer hover:scale-105"
                    >
                      <Building2 className="w-5 h-5" />
                      <span>Direct Order</span>
                    </button>
                  </div>

                  {/* Legal Disclaimer Line */}
                  <div className="pt-2 text-xs sm:text-sm text-white/80 font-bold uppercase tracking-widest">
                    {slide.legalText}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Circular Left Nav Button */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-3 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/35 hover:bg-black/70 backdrop-blur-md border border-white/35 text-white flex items-center justify-center transition-all cursor-pointer shadow-2xl hover:scale-110 active:scale-95"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>

        {/* Circular Right Nav Button */}
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-3 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/35 hover:bg-black/70 backdrop-blur-md border border-white/35 text-white flex items-center justify-center transition-all cursor-pointer shadow-2xl hover:scale-110 active:scale-95"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>

        {/* Slide Indicators Dots at the Bottom */}
        <div className="absolute bottom-5 inset-x-0 z-20 flex items-center justify-center gap-2.5 pointer-events-auto">
          {HERO_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex ? 'w-10 bg-[#3AA88C]' : 'w-2.5 bg-white/40 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Slim Full-Width Metrics Strip right beneath the banner */}
      <div className="w-full bg-[#0B1A2C] border-y border-white/10 py-3.5 px-6 sm:px-12 lg:px-20">
        <div className="w-full flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-6 sm:gap-12">
            <div>
              <span className="text-lg sm:text-2xl font-black text-[#F2A93B]">600+</span>
              <span className="text-neutral-300 ml-2 font-medium">Outlets Supplied</span>
            </div>
            <div className="h-5 w-px bg-white/20" />
            <div>
              <span className="text-lg sm:text-2xl font-black text-[#3AA88C]">2 Hubs</span>
              <span className="text-neutral-300 ml-2 font-medium">Eldoret &amp; Iten</span>
            </div>
            <div className="h-5 w-px bg-white/20 hidden sm:block" />
            <div className="hidden sm:block">
              <span className="text-lg sm:text-2xl font-black text-white">Since 2013</span>
              <span className="text-neutral-300 ml-2 font-medium">Distribution Excellence</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-neutral-300 text-xs sm:text-sm font-medium">
            <span className="text-amber-400 font-bold">EABL Gold Distributor 2024</span>
            <span className="text-white/30">•</span>
            <span>Same-Day Fleet Dispatch</span>
          </div>
        </div>
      </div>
    </div>
  );
}
