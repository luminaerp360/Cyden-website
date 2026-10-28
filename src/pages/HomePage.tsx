import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Sparkles,
  Award,
  ShoppingBag,
  Building2,
  Wine,
  Beer,
  GlassWater,
  CheckCircle2,
} from 'lucide-react';
import { Product } from '../types';
import { getFeaturedProducts } from '../services/products';
import { COMPANY_INFO, BRANDS } from '../data/companyData';
import ProductCard from '../components/ProductCard';
import AmbientBackground from '../components/AmbientBackground';
import HeroBanner from '../components/HeroBanner';
import {
  HeritageGuillochePattern,
  AnimatedBannerRibbon,
} from '../components/AnimatedPatterns';

interface HomePageProps {
  onNavigate: (route: string, filterCategory?: string) => void;
  onOpenOrderModal: (product?: Product) => void;
}

export default function HomePage({ onNavigate, onOpenOrderModal }: HomePageProps) {
  const [featuredDrinks, setFeaturedDrinks] = useState<Product[]>([]);

  useEffect(() => {
    const loadFeatured = () => {
      getFeaturedProducts().then((products) => {
        setFeaturedDrinks(products);
      });
    };
    loadFeatured();

    window.addEventListener('cyden:thebar-synced', loadFeatured);
    return () => window.removeEventListener('cyden:thebar-synced', loadFeatured);
  }, []);

  const categoryCards = [
    {
      name: 'Beer & Cider',
      slug: 'Beer',
      desc: 'Tusker, Guinness, White Cap — Kenya’s most cherished lagers and ciders.',
      count: 'Crates & Kegs',
      image: '/hero/tusker-hero.jpg',
      badge: 'TOP SELLER',
      color: 'from-amber-950/80 via-black/60 to-black/90',
      icon: Beer,
    },
    {
      name: 'Finest Gin',
      slug: 'Gin',
      desc: 'Gilbeys, Gordons, Tanqueray No. TEN — botanical elegance and juniper perfection.',
      count: 'Bottles & Cases',
      image: '/hero/gilbeys-hero.jpg',
      badge: 'POPULAR',
      color: 'from-emerald-950/80 via-black/60 to-black/90',
      icon: Sparkles,
    },
    {
      name: 'Scotch Whisky',
      slug: 'Whisky',
      desc: 'Johnnie Walker Blue, Black & Red Label, Singleton 12YO — Scotland’s finest blends.',
      count: 'Premium & Prestige',
      image: '/hero/johnnie-walker-hero.jpg',
      badge: 'PRESTIGE',
      color: 'from-orange-950/80 via-black/60 to-black/90',
      icon: Wine,
    },
    {
      name: 'Pure Vodka',
      slug: 'Vodka',
      desc: 'Smirnoff No. 21, Smirnoff Vanilla, Chrome — ultra-filtered smooth spirits.',
      count: 'Full Range Sizes',
      image: '/hero/smirnoff-hero.jpg',
      badge: 'SMOOTH',
      color: 'from-red-950/80 via-black/60 to-black/90',
      icon: GlassWater,
    },
    {
      name: 'Rum & Liqueur',
      slug: 'Rum',
      desc: 'Captain Morgan Dark & Spiced, Baileys Irish Cream — indulgent depth.',
      count: 'Retail & Hospitality',
      image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80',
      badge: 'INDULGENT',
      color: 'from-rose-950/80 via-black/60 to-black/90',
      icon: Wine,
    },
  ];

  return (
    <div className="space-y-10 sm:space-y-14 lg:space-y-16 pb-16 overflow-hidden">
      {/* 1. CINEMATIC HERO SHOWCASE CAROUSEL (Matching Reference Banner) */}
      <HeroBanner onNavigate={onNavigate} onOpenOrderModal={onOpenOrderModal} />

      {/* 2. ONLY THE BEST DEALS / TOP CATEGORIES (Matching Reference Image) */}
      <section className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1B3E6F] tracking-tight">
              Only The Best Deals
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              Discover our top commercial &amp; retail deals across Beer, Gin, Whisky, Vodka, and Rum.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/catalogue')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#1B3E6F] hover:text-[#3AA88C] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Category Showcase Cards with Atmospheric Imagery */}
        {/* Mobile / Responsive Auto-Moving Carousel (Moving from Left to Right) */}
        <div className="lg:hidden relative w-full overflow-hidden py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {/* Subtle Edge Fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-neutral-50 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-neutral-50 to-transparent z-10" />

          <motion.div
            className="flex gap-3 sm:gap-4 w-max cursor-grab active:cursor-grabbing hover:[animation-play-state:paused]"
            animate={{ x: ['-50%', '0%'] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: 'loop',
                duration: 25,
                ease: 'linear',
              },
            }}
          >
            {[...categoryCards, ...categoryCards].map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <div key={`${cat.slug}-${idx}`} className="w-[160px] sm:w-[200px] shrink-0">
                  <button
                    onClick={() => onNavigate('/catalogue', cat.slug)}
                    className="relative rounded-2xl overflow-hidden text-left h-44 sm:h-52 w-full group cursor-pointer border border-neutral-200/80 shadow-sm hover:shadow-xl transition-all"
                  >
                    {/* Background Image */}
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />

                    {/* Dark Vignette Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} group-hover:opacity-90 transition-opacity`} />

                    {/* Category Content */}
                    <div className="relative z-10 p-3 sm:p-4 h-full flex flex-col justify-between text-white">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white">
                          {cat.badge}
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-black/40 backdrop-blur-md flex items-center justify-center text-white/90 group-hover:bg-[#3AA88C] transition-colors">
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div>
                        <h3 className="font-black text-base sm:text-lg text-white group-hover:text-amber-300 transition-colors leading-tight">
                          {cat.name}
                        </h3>
                        <p className="text-[11px] text-neutral-300 line-clamp-1 mt-0.5 font-medium">
                          {cat.count}
                        </p>
                        <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#3AA88C] group-hover:text-white transition-colors">
                          <span>Shop Now</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Desktop 5-Column Grid */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-3 sm:gap-4">
          {categoryCards.map((cat, index) => {
            const IconComp = cat.icon;
            return (
              <motion.button
                key={cat.slug}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('/catalogue', cat.slug)}
                className="relative rounded-2xl overflow-hidden text-left h-44 sm:h-52 group cursor-pointer border border-neutral-200/80 shadow-sm hover:shadow-xl transition-all"
              >
                {/* Background Image */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Dark Vignette Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} group-hover:opacity-90 transition-opacity`} />

                {/* Category Content */}
                <div className="relative z-10 p-3 sm:p-4 h-full flex flex-col justify-between text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white">
                      {cat.badge}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-black/40 backdrop-blur-md flex items-center justify-center text-white/90 group-hover:bg-[#3AA88C] transition-colors">
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black text-base sm:text-lg text-white group-hover:text-amber-300 transition-colors leading-tight">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-neutral-300 line-clamp-1 mt-0.5 font-medium">
                      {cat.count}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#3AA88C] group-hover:text-white transition-colors">
                      <span>Shop Now</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* 3. MOST POPULAR DRINKS (FEATURED PRODUCTS) */}
      <section className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1 text-[#E8582F] font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fast-Moving Outlet Favorites</span>
            </div>
            <h2 className="text-3xl font-extrabold text-[#1B3E6F] tracking-tight">
              Most Popular Drinks
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500">
              Top requested beverages across our 600+ partner outlets in the North Rift region.
            </p>
          </div>

          <motion.button
            whileHover={{ x: 3 }}
            onClick={() => onNavigate('/catalogue')}
            className="inline-flex items-center gap-1 text-sm font-bold text-[#1B3E6F] hover:text-[#3AA88C] transition-colors cursor-pointer"
          >
            <span>View Full Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {featuredDrinks.slice(0, 8).map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              onRequestOrder={onOpenOrderModal}
              index={idx}
            />
          ))}
        </div>
      </section>

      {/* 4. EXCELLENCE IN DISTRIBUTION SINCE 2013 */}
      <section className="w-full px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-[#1B3E6F] rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden shadow-xl"
        >
          {/* Animated Heritage Guilloche / Stamp Motif */}
          <HeritageGuillochePattern />

          {/* Background subtle moving glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#3AA88C]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3AA88C]/20 text-[#3AA88C] text-xs font-bold">
                <Award className="w-4 h-4" />
                <span>Proven Industry Leadership</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Excellence in Distribution Since 2013
              </h2>
              <p className="text-sm sm:text-base text-neutral-200 leading-relaxed">
                {COMPANY_INFO.story}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="border-l-2 border-[#3AA88C] pl-3">
                  <div className="text-xl font-bold text-white">600+</div>
                  <div className="text-xs text-neutral-300">Active Outlets</div>
                </div>
                <div className="border-l-2 border-[#F2A93B] pl-3">
                  <div className="text-xl font-bold text-white">3 Counties</div>
                  <div className="text-xs text-neutral-300">Regional Coverage</div>
                </div>
                <div className="border-l-2 border-[#E8582F] pl-3">
                  <div className="text-xl font-bold text-white">Gold 2024</div>
                  <div className="text-xs text-neutral-300">EABL Top Honors</div>
                </div>
              </div>
              <div className="pt-3">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onNavigate('/about-us')}
                  className="px-6 py-3 rounded-xl bg-white text-[#1B3E6F] font-bold text-sm hover:bg-neutral-100 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Learn More About Our Journey</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Full-Height Distribution Operations Photograph */}
            <div className="lg:col-span-5 relative w-full h-full min-h-[360px] lg:min-h-[420px] flex items-stretch">
              <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/15 shadow-2xl group">
                <img
                  src="/cyden-stocking.jpg"
                  alt="Cyden staff verifying and stocking authentic EABL inventory"
                  className="w-full h-full min-h-[360px] lg:min-h-[420px] object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-5 sm:p-6">
                  <div>
                    <div className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Authentic EABL Inventory Management</span>
                    </div>
                    <p className="text-xs text-neutral-300 mt-1">
                      Direct depot stocking, verification &amp; cold dispatch at Rupa Godowns &amp; Sitet Building.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 5. OUR PARTNERS & BRANDS STRIP WITH ANIMATED HOVER */}
      <section className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            World-Class Beverage Brands
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B3E6F]">
            Our Principal Brands & Portfolio
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            Distributing Kenya’s most beloved spirits, beers, and premium imports by East African Breweries Limited.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {BRANDS.map((brand, idx) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.04 }}
              whileHover={{ y: -5, scale: 1.03 }}
              className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs hover:border-[#3AA88C] hover:shadow-md transition-all text-center flex flex-col items-center justify-center space-y-1.5 cursor-pointer"
            >
              <div className="text-lg font-black tracking-wider text-[#1B3E6F]">
                {brand.logoText}
              </div>
              <div className="text-[11px] font-semibold text-[#E8582F]">
                {brand.category}
              </div>
              <p className="text-[10px] text-neutral-500 line-clamp-1">
                {brand.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. GET IN TOUCH CTA BANNER */}
      <section className="w-full px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-[#3AA88C] via-[#2C856E] to-[#1B3E6F] rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden"
        >
          {/* Animated flowing liquid ribbon */}
          <AnimatedBannerRibbon />

          {/* Animated decorative light spot */}
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -right-20 -top-20 w-80 h-80 bg-white/20 rounded-full blur-2xl pointer-events-none"
          />

          <div className="space-y-2 text-left relative z-10">
            <span className="text-xs uppercase font-bold tracking-wider text-[#F2A93B]">
              Ready to stock your bar or retail store?
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Get in Touch with Cyden Sales & Dispatch
            </h3>
            <p className="text-sm text-white/90 max-w-xl">
              Connect with our Eldoret main office or Iten sub-store today. We provide weekly route scheduling, credit facilities, and guaranteed authentic EABL stock.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('/contact-us')}
              className="px-6 py-3.5 rounded-xl bg-white text-[#1B3E6F] font-bold text-sm shadow-md hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Contact Sales Team
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onOpenOrderModal()}
              className="px-6 py-3.5 rounded-xl bg-[#E8582F] hover:bg-[#D04620] text-white font-bold text-sm shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Request Direct Order</span>
            </motion.button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
