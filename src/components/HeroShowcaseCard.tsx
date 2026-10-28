import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';

export interface HeroShowcaseSlide {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  /** Product packshot image (bottle on transparent background) from CDN */
  image: string;
  /** Dramatic AI-generated hero backdrop image */
  heroImage: string;
  category: string;
  accentColor: string;
  accentHex: string;
  price: string;
  bgGradient: string;
  glowColor: string;
}

const SHOWCASE_SLIDES: HeroShowcaseSlide[] = [
  {
    id: 'tusker',
    tag: "Kenya's #1 Flagship Lager",
    title: 'Tusker Lager',
    subtitle: '500ml Bottle x6',
    price: 'KSH 1,260',
    image: 'https://lumina360.sfo3.digitaloceanspaces.com/eccomerse/cyden/products/P764354_tusker_lager_500ml_bottle_x6.png',
    heroImage: '/hero/tusker-hero.jpg',
    category: 'Beer',
    accentColor: 'text-amber-400',
    accentHex: '#F59E0B',
    bgGradient: 'from-amber-900/90 via-amber-950/80 to-[#0A1626]/95',
    glowColor: 'bg-amber-500/30',
  },
  {
    id: 'jw-black',
    tag: 'Prestige Scotch Whisky',
    title: 'Johnnie Walker',
    subtitle: 'Black Label 12YO 375ml',
    price: 'KSH 4,550',
    image: 'https://lumina360.sfo3.digitaloceanspaces.com/eccomerse/cyden/products/636862_johnnie_walker_black_label_375ml_bottle_.png',
    heroImage: '/hero/johnnie-walker-hero.jpg',
    category: 'Whisky',
    accentColor: 'text-amber-300',
    accentHex: '#FCD34D',
    bgGradient: 'from-orange-900/90 via-amber-950/80 to-[#0A1626]/95',
    glowColor: 'bg-orange-500/30',
  },
  {
    id: 'gilbeys',
    tag: 'Distilled London Dry Gin',
    title: "Gilbey\u2019s Special",
    subtitle: 'Dry Gin 750ml',
    price: 'KSH 1,550',
    image: 'https://lumina360.sfo3.digitaloceanspaces.com/eccomerse/cyden/products/604021_gilbey_s_special_dry_gin_750ml_bottle_.png',
    heroImage: '/hero/gilbeys-hero.jpg',
    category: 'Gin',
    accentColor: 'text-emerald-300',
    accentHex: '#6EE7B7',
    bgGradient: 'from-emerald-900/90 via-teal-950/80 to-[#0A1626]/95',
    glowColor: 'bg-emerald-500/30',
  },
  {
    id: 'smirnoff',
    tag: '10x Charcoal Filtered Spirit',
    title: 'Smirnoff Red',
    subtitle: 'Vodka 750ml',
    price: 'KSH 1,550',
    image: 'https://lumina360.sfo3.digitaloceanspaces.com/eccomerse/cyden/products/650278_smirnoff_red_vodka_750ml_bottle_.png',
    heroImage: '/hero/smirnoff-hero.jpg',
    category: 'Vodka',
    accentColor: 'text-red-400',
    accentHex: '#F87171',
    bgGradient: 'from-red-900/90 via-red-950/80 to-[#0A1626]/95',
    glowColor: 'bg-red-500/30',
  },
  {
    id: 'guinness',
    tag: 'Roasted Barley Stout',
    title: 'Guinness FES',
    subtitle: 'Foreign Extra Stout 500ml x6',
    price: 'KSH 1,500',
    image: 'https://lumina360.sfo3.digitaloceanspaces.com/eccomerse/cyden/products/P764356_guinness_foreign_extra_stout_500ml_bottl.png',
    heroImage: '/hero/tusker-hero.jpg',
    category: 'Beer',
    accentColor: 'text-amber-500',
    accentHex: '#F59E0B',
    bgGradient: 'from-yellow-900/90 via-amber-950/80 to-[#0A1626]/95',
    glowColor: 'bg-amber-600/30',
  },
  {
    id: 'tanqueray',
    tag: 'Fresh Citrus Botanicals',
    title: 'Tanqueray',
    subtitle: 'London Dry Gin 750ml',
    price: 'KSH 5,100',
    image: 'https://lumina360.sfo3.digitaloceanspaces.com/eccomerse/cyden/products/629285_tanqueray_london_dry_gin_750ml_bottle_.png',
    heroImage: '/hero/gilbeys-hero.jpg',
    category: 'Gin',
    accentColor: 'text-teal-300',
    accentHex: '#5EEAD4',
    bgGradient: 'from-teal-900/90 via-teal-950/80 to-[#0A1626]/95',
    glowColor: 'bg-teal-500/30',
  },
];

interface HeroShowcaseCardProps {
  onNavigate: (route: string, filterCategory?: string) => void;
}

export default function HeroShowcaseCard({ onNavigate }: HeroShowcaseCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  // Proactively preload all images
  useEffect(() => {
    SHOWCASE_SLIDES.forEach((slide) => {
      // Preload packshot
      const img1 = new Image();
      img1.src = slide.image;
      const markLoaded = () => setLoadedImages((prev) => ({ ...prev, [slide.id]: true }));
      if (img1.complete) markLoaded();
      else img1.onload = markLoaded;

      // Preload hero backdrop
      const img2 = new Image();
      img2.src = slide.heroImage;
    });
  }, []);

  // Auto-rotation
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % SHOWCASE_SLIDES.length;
      setDirection(1);
      setCurrentIndex(nextIndex);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, currentIndex]);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + SHOWCASE_SLIDES.length) % SHOWCASE_SLIDES.length);
  };

  const currentSlide = SHOWCASE_SLIDES[currentIndex];

  // Slide animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="lg:col-span-5 relative mt-2 lg:mt-0 flex flex-col justify-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Hidden preloader */}
      <div className="hidden" aria-hidden="true">
        {SHOWCASE_SLIDES.map((slide) => (
          <React.Fragment key={slide.id}>
            <img src={slide.image} alt="" loading="eager" fetchPriority="high" decoding="async" />
            <img src={slide.heroImage} alt="" loading="eager" decoding="async" />
          </React.Fragment>
        ))}
      </div>

      {/* Dynamic ambient halo */}
      <div className={`absolute -inset-2 rounded-3xl blur-2xl opacity-40 transition-colors duration-700 pointer-events-none ${currentSlide.glowColor}`} />

      {/* Main Showcase Container */}
      <div className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md">
        
        {/* Hero Stage — Full dramatic showcase */}
        <div
          onClick={() => onNavigate('/catalogue', currentSlide.category)}
          className="relative h-64 sm:h-72 lg:h-80 overflow-hidden group cursor-pointer select-none"
          title={`View ${currentSlide.title} in Catalogue`}
        >
          {/* Background Hero Image with Cross-Fade */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlide.id + '-bg'}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              {/* AI-generated dramatic hero backdrop */}
              <img
                src={currentSlide.heroImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-60"
                loading="eager"
              />
              {/* Gradient overlay for readability */}
              <div className={`absolute inset-0 bg-gradient-to-r ${currentSlide.bgGradient}`} />
              {/* Extra vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
            </motion.div>
          </AnimatePresence>

          {/* Content Layer */}
          <div className="absolute inset-0 z-10 flex">
            {/* Left side — Product Packshot with dramatic presentation */}
            <div className="relative w-[45%] flex items-center justify-center">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentSlide.id + '-bottle'}
                  custom={direction}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  {/* Radial glow behind bottle */}
                  <div
                    className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full blur-3xl opacity-60"
                    style={{ backgroundColor: currentSlide.accentHex + '40' }}
                  />
                  {/* Bottle packshot */}
                  <img
                    src={currentSlide.image}
                    alt={currentSlide.title}
                    loading="eager"
                    className="relative z-10 max-h-[85%] max-w-[85%] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Reflection underneath */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-2 bg-black/70 rounded-[100%] blur-[3px]" />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right side — Text Content with CTA */}
            <div className="relative w-[55%] flex flex-col justify-center pr-4 sm:pr-6 py-4">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentSlide.id + '-text'}
                  custom={direction}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.45, ease: 'easeOut', delay: 0.15 }}
                  className="space-y-2 sm:space-y-3"
                >
                  {/* Tag badge */}
                  <div className={`inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${currentSlide.accentColor}`}>
                    <Sparkles className="w-3 h-3 flex-shrink-0" />
                    <span>{currentSlide.tag}</span>
                  </div>

                  {/* Product name — large, bold, promotional */}
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white uppercase tracking-tight leading-none">
                    {currentSlide.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 font-medium">
                    {currentSlide.subtitle}
                  </p>

                  {/* Price tag — Prominent */}
                  <div className="pt-1">
                    <span
                      className="inline-block text-lg sm:text-xl lg:text-2xl font-black tracking-tight"
                      style={{ color: currentSlide.accentHex }}
                    >
                      {currentSlide.price}
                    </span>
                  </div>

                  {/* Disclaimer line */}
                  <p className="text-[9px] sm:text-[10px] text-neutral-400 uppercase tracking-widest font-semibold pt-0.5">
                    Enjoy Responsibly | Official EABL Stock
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Top overlay bar — Status & Dots */}
          <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 text-[10px] text-white font-medium shadow-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3AA88C] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3AA88C]" />
              </span>
              <span>Official EABL Stock</span>
            </div>

            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/15 shadow-md">
              {SHOWCASE_SLIDES.map((s, dotIdx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDirection(dotIdx > currentIndex ? 1 : -1);
                    setCurrentIndex(dotIdx);
                  }}
                  className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                    dotIdx === currentIndex ? 'w-3.5 bg-[#3AA88C]' : 'w-1 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Slide ${dotIdx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-20"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-20"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Bottom "View" indicator */}
          <div className="absolute bottom-3 right-3 z-20 pointer-events-auto">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-white/15 group-hover:bg-[#3AA88C] text-white flex items-center justify-center transition-colors shadow-md backdrop-blur-sm">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Compact Category Quick-Jump Pill Bar */}
        <div className="grid grid-cols-4 gap-1.5 p-2 sm:p-3">
          {[
            { name: 'Beer', label: 'Tusker & Beer' },
            { name: 'Whisky', label: 'Scotch Whisky' },
            { name: 'Gin', label: 'Gilbeys Gin' },
            { name: 'Vodka', label: 'Smirnoff' },
          ].map((cat) => {
            const isCurrent = currentSlide.category === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => {
                  const targetIdx = SHOWCASE_SLIDES.findIndex((s) => s.category === cat.name);
                  if (targetIdx !== -1) {
                    setDirection(targetIdx > currentIndex ? 1 : -1);
                    setCurrentIndex(targetIdx);
                  }
                  onNavigate('/catalogue', cat.name);
                }}
                className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold transition-all border cursor-pointer text-center truncate ${
                  isCurrent
                    ? 'bg-[#3AA88C]/20 border-[#3AA88C] text-[#3AA88C]'
                    : 'bg-white/5 hover:bg-white/10 text-neutral-300 border-white/10 hover:border-white/20'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
