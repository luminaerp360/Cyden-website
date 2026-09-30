import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';

export interface HeroShowcaseSlide {
  id: string;
  tag: string;
  title: string;
  image: string;
  category: string;
  accentColor: string;
}

export const SHOWCASE_SLIDES: HeroShowcaseSlide[] = [
  {
    id: 'whisky',
    tag: 'Prestige Reserve',
    title: 'Johnnie Walker & Single Malts',
    image: 'https://images.unsplash.com/photo-1575861218791-1788814b31bf?auto=format&fit=crop&w=800&q=80',
    category: 'Whisky',
    accentColor: 'text-amber-300',
  },
  {
    id: 'beer',
    tag: 'Brewery Cold Chain',
    title: 'Tusker Lager, Cider & Guinness',
    image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=800&q=80',
    category: 'Beer',
    accentColor: 'text-amber-400',
  },
  {
    id: 'spirits',
    tag: 'Master Botanicals & Vodka',
    title: 'Tanqueray, Gilbey’s & Smirnoff',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
    category: 'Gin',
    accentColor: 'text-emerald-300',
  },
  {
    id: 'liqueur',
    tag: 'Indulgence & Rum',
    title: 'Baileys Irish Cream & Captain Morgan',
    image: 'https://images.unsplash.com/photo-1633693571973-8388a2be94c1?auto=format&fit=crop&w=800&q=80',
    category: 'Rum',
    accentColor: 'text-amber-200',
  },
];

interface HeroShowcaseCardProps {
  onNavigate: (route: string, filterCategory?: string) => void;
}

export default function HeroShowcaseCard({ onNavigate }: HeroShowcaseCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);

  // Auto-rotate every 4 seconds
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isPaused]);

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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="lg:col-span-5 relative mt-2 lg:mt-0 flex flex-col justify-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Subtle outer halo */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#3AA88C]/15 to-[#E8582F]/15 rounded-2xl blur-xl opacity-40 pointer-events-none" />

      {/* Compact, Streamlined Showcase Container */}
      <div className="relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-xl backdrop-blur-md p-2 sm:p-3.5 space-y-2 sm:space-y-2.5">
        
        {/* Compact Stage for Changing Images */}
        <div
          onClick={() => onNavigate('/catalogue', currentSlide.category)}
          className="relative h-36 sm:h-48 lg:h-52 rounded-xl overflow-hidden bg-[#0A1728] group cursor-pointer select-none"
          title={`Click to view ${currentSlide.title} in Catalogue`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, scale: 1.05, x: direction > 0 ? 15 : -15 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.97, x: direction > 0 ? -15 : 15 }}
              transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
              className="absolute inset-0"
            >
              <img
                src={currentSlide.image}
                alt={currentSlide.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Shaded overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#09182E] via-[#09182E]/40 to-black/20 flex flex-col justify-between p-3 sm:p-3.5">
                {/* Top status bar badges inside image */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-[10px] text-white font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3AA88C] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3AA88C]" />
                    </span>
                    <span>Live Stock</span>
                  </div>

                  {/* Indicator Dots */}
                  <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                    {SHOWCASE_SLIDES.map((slide, idx) => {
                      const isActive = idx === currentIndex;
                      return (
                        <button
                          key={slide.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDirection(idx > currentIndex ? 1 : -1);
                            setCurrentIndex(idx);
                          }}
                          className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                            isActive ? 'w-3.5 bg-[#3AA88C]' : 'w-1 bg-white/40 hover:bg-white/70'
                          }`}
                          aria-label={`Slide ${idx + 1}`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Bottom title & collection tag */}
                <div>
                  <div className={`flex items-center gap-1 text-[11px] ${currentSlide.accentColor} font-bold mb-0.5`}>
                    <Sparkles className="w-3 h-3" />
                    <span>{currentSlide.tag}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                      {currentSlide.title}
                    </h4>
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 group-hover:bg-[#3AA88C] text-white flex items-center justify-center transition-colors">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Previous / Next Arrow buttons */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center opacity-70 hover:opacity-100 transition-all cursor-pointer z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center opacity-70 hover:opacity-100 transition-all cursor-pointer z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Compact 1-line Category Quick Jump Pill Bar */}
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { name: 'Beer', label: 'Beers' },
            { name: 'Whisky', label: 'Whiskies' },
            { name: 'Spirits', label: 'Spirits' },
            { name: 'Wine', label: 'Wines' },
          ].map((cat, idx) => {
            const isCurrent = currentSlide.category === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx);
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
