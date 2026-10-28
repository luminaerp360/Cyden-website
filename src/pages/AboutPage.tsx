import React from 'react';
import { motion } from 'motion/react';
import {
  Award,
  Target,
  Compass,
  CheckCircle2,
  Building,
  TrendingUp,
  CreditCard,
  Truck,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { COMPANY_INFO, MILESTONES } from '../data/companyData';
import AmbientBackground from '../components/AmbientBackground';

interface AboutPageProps {
  onNavigate: (route: string) => void;
  onOpenOrderModal: () => void;
}

export default function AboutPage({ onNavigate, onOpenOrderModal }: AboutPageProps) {
  return (
    <div className="space-y-16 lg:space-y-20 pb-16 overflow-hidden">
      {/* 1. PAGE HEADER & BREADCRUMBS WITH AMBIENT BACKGROUND */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1B3E6F] to-[#122B4E] text-white py-14 lg:py-20">
        <AmbientBackground variant="hero" />

        <div className="w-full px-4 sm:px-6 lg:px-8 space-y-4 text-left relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-xs text-white/70 font-medium" aria-label="Breadcrumb">
            <button
              onClick={() => onNavigate('/')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
            <span className="text-[#3AA88C] font-semibold">About Us</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-2 max-w-3xl"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-[#F2A93B]">
              <Award className="w-3.5 h-3.5" />
              <span>EABL Gold Distributor 2024</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Who We Are — Delivering Quality Drinks Across the Region
            </h1>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed pt-1">
              From our Eldoret central logistics depot to our Iten branch, Cyden Distributors Limited powers over 600 retail and hospitality businesses with world-class EABL beverages.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. OUR STORY NARRATIVE */}
      <section className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3AA88C]">
                Our Background & Foundation
              </span>
              <h2 className="text-3xl font-extrabold text-[#1B3E6F]">
                Our Story: Built on Service & Reliability
              </h2>
            </div>

            <div className="space-y-4 text-neutral-700 text-sm sm:text-base leading-relaxed">
              <p>{COMPANY_INFO.story}</p>
              <p>
                Our operational model pairs modern fleet tracking with hands-on account management. Whether supplying major hospitality hotels in Eldoret CBD, sports bars in Kapsabet, or scenic resorts in Iten overlooking the Kerio Valley, our route trucks adhere to predictable delivery schedules, ensuring outlets never face empty coolers or missed revenue.
              </p>
            </div>

            {/* Quick Regional Badges */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <motion.div whileHover={{ y: -3 }} className="p-3.5 bg-white rounded-xl border border-neutral-200/80 shadow-xs">
                <div className="text-xs text-neutral-500 font-medium">Primary Hub</div>
                <div className="text-base font-bold text-[#1B3E6F]">Eldoret Main Depot</div>
                <div className="text-[11px] text-neutral-500">Rupa Godowns</div>
              </motion.div>
              <motion.div whileHover={{ y: -3 }} className="p-3.5 bg-white rounded-xl border border-neutral-200/80 shadow-xs">
                <div className="text-xs text-neutral-500 font-medium">Regional Depository</div>
                <div className="text-base font-bold text-[#1B3E6F]">Iten Sub-Store</div>
                <div className="text-[11px] text-neutral-500">Sitet Building</div>
              </motion.div>
              <motion.div whileHover={{ y: -3 }} className="p-3.5 bg-white rounded-xl border border-neutral-200/80 shadow-xs">
                <div className="text-xs text-neutral-500 font-medium">Network Reach</div>
                <div className="text-base font-bold text-[#3AA88C]">600+ Outlets</div>
                <div className="text-[11px] text-neutral-500">3 Regional Counties</div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 bg-white p-2">
              <img
                src="/about/cyden-team.jpg"
                alt="Cyden Distributors authorized EABL beverage operations and customer service"
                className="w-full h-80 sm:h-96 object-cover rounded-2xl"
              />
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1B3E6F]">
                  <Truck className="w-4 h-4 text-[#3AA88C]" />
                  <span>Distribution Operations & Direct Fulfillment</span>
                </div>
                <p className="text-xs text-neutral-600">
                  Authentic EABL beverage stock, counter service, and fleet staging in Eldoret & Iten, directly supplying over 600 retail and hospitality partners.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. MISSION & VISION (TWO-COLUMN CARDS) */}
      <section className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -6 }}
            className="bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-xs hover:shadow-xl transition-all space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#3AA88C]/15 text-[#2C856E] flex items-center justify-center font-bold">
              <Target className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#3AA88C] block">
              Core Purpose
            </span>
            <h3 className="text-2xl font-extrabold text-[#1B3E6F]">Our Mission</h3>
            <p className="text-neutral-700 text-base leading-relaxed italic border-l-4 border-[#3AA88C] pl-4 py-1">
              "{COMPANY_INFO.mission}"
            </p>
            <p className="text-xs text-neutral-500 leading-relaxed pt-1">
              We gauge our performance by our customers' profitability, promptness of route fulfillment, and continuous adherence to EABL’s premier distribution standards.
            </p>
          </motion.div>

          {/* Vision Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -6 }}
            className="bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-xs hover:shadow-xl transition-all space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#E8582F]/15 text-[#E8582F] flex items-center justify-center font-bold">
              <Compass className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#E8582F] block">
              Strategic Aspiration
            </span>
            <h3 className="text-2xl font-extrabold text-[#1B3E6F]">Our Vision</h3>
            <p className="text-neutral-700 text-base leading-relaxed italic border-l-4 border-[#E8582F] pl-4 py-1">
              "{COMPANY_INFO.vision}"
            </p>
            <p className="text-xs text-neutral-500 leading-relaxed pt-1">
              Setting the regional benchmark for technology-enabled FMCG operations, inventory visibility, and long-term sustainable partner growth.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 4. KEY MILESTONES & ACHIEVEMENTS (ANIMATED TIMELINE) */}
      <section className="bg-white py-16 border-y border-neutral-200/80 relative overflow-hidden">
        <AmbientBackground variant="light" />

        <div className="w-full px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3AA88C]">
              Historical Growth & Accolades
            </span>
            <h2 className="text-3xl font-extrabold text-[#1B3E6F]">
              Key Milestones and Achievements
            </h2>
            <p className="text-sm text-neutral-600">
              A timeline of dedication, technological innovation, and partnerships shaping Cyden into an EABL Gold Distributor.
            </p>
          </div>

          {/* Timeline Layout with Staggered Scroll Motion */}
          <div className="relative border-l-2 border-[#3AA88C]/30 ml-4 md:ml-32 space-y-10 py-4">
            {MILESTONES.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.45, delay: idx * 0.05 }}
                className="relative pl-8 md:pl-10 group"
              >
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 transition-all ${
                    item.highlight
                      ? 'bg-[#F2A93B] border-[#1B3E6F] ring-4 ring-[#F2A93B]/30 scale-125'
                      : 'bg-white border-[#3AA88C] group-hover:bg-[#3AA88C]'
                  }`}
                />

                {/* Left floating year label for large screens */}
                <div className="hidden md:block absolute -left-28 top-1 text-right w-20">
                  <span className={`text-sm font-black tracking-tight ${item.highlight ? 'text-[#E8582F]' : 'text-[#1B3E6F]'}`}>
                    {item.year}
                  </span>
                </div>

                {/* Content Box */}
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`p-5 rounded-2xl border transition-all ${
                    item.highlight
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50/60 border-amber-300 shadow-md'
                      : 'bg-[#F8F7F4] border-neutral-200/80 hover:bg-white hover:shadow-xs'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <span className="md:hidden inline-block text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#1B3E6F] text-white">
                      {item.year}
                    </span>
                    <h4 className="text-lg font-bold text-[#1B3E6F]">
                      {item.title}
                    </h4>
                    {item.highlight && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F2A93B] text-neutral-900 shadow-xs">
                        {item.badgeText?.toLowerCase().includes('target') ? (
                          <TrendingUp className="w-3 h-3 text-neutral-900" />
                        ) : (
                          <Award className="w-3 h-3 text-neutral-900" />
                        )}
                        {item.badgeText || 'Gold Distinction'}
                      </span>
                    )}
                  </div>
                  {item.details && item.details.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {item.details.map((detail, dIdx) => (
                        <div key={dIdx} className="text-sm text-neutral-700 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#1B3E6F]/10 text-[#1B3E6F] shrink-0 self-start">
                            {detail.label}
                          </span>
                          <span className="text-neutral-600 leading-relaxed">{detail.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FINANCIAL & RETAIL CREDIT PARTNERS */}
      <section className="w-full px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-[#122B4E] text-white rounded-3xl p-8 lg:p-12 shadow-xl space-y-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#3AA88C]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl space-y-2 relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F2A93B]">
              Empowering Bar & Outlet Growth
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Retail Financing & Institutional Backing
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed">
              We collaborate with premier financial institutions to provide our 600+ partner outlets with trade financing, seasonal stock working capital, and flexible merchant repayment structures.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
            {COMPANY_INFO.financialPartners.map((partner) => (
              <motion.div
                key={partner.name}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-white/10 rounded-2xl p-4 border border-white/10 flex flex-col justify-between space-y-2 transition-colors hover:border-[#3AA88C]/50"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#3AA88C]" />
                  <span className="font-bold text-white text-base">{partner.name}</span>
                </div>
                <span className="text-xs text-neutral-300 leading-snug">
                  {partner.role}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 6. GET IN TOUCH BANNER */}
      <section className="w-full px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-[#1B3E6F] to-[#3AA88C] rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl"
        >
          <div className="space-y-2 text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Partner with Cyden Distributors
            </h3>
            <p className="text-sm text-white/90 max-w-xl">
              Are you opening a new bar, restaurant, or retail outlet in Eldoret or Iten? Join over 600 satisfied partners enjoying priority delivery and credit terms.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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
              onClick={onOpenOrderModal}
              className="px-6 py-3.5 rounded-xl bg-[#E8582F] hover:bg-[#D04620] text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
            >
              Request Direct Stock
            </motion.button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
