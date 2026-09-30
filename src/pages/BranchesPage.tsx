import React from 'react';
import { motion } from 'motion/react';
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  ExternalLink,
  ChevronRight,
  Building2,
  ShieldCheck,
  Truck,
  Compass,
} from 'lucide-react';
import { BRANCHES } from '../data/companyData';
import AmbientBackground from '../components/AmbientBackground';
import RoutesDirectory from '../components/RoutesDirectory';

interface BranchesPageProps {
  onNavigate: (route: string) => void;
  onOpenOrderModal: () => void;
}

export default function BranchesPage({ onNavigate, onOpenOrderModal }: BranchesPageProps) {
  return (
    <div className="space-y-16 lg:space-y-20 pb-16 overflow-hidden">
      {/* 1. PAGE HEADER & BREADCRUMBS WITH AMBIENT BACKGROUND */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1B3E6F] to-[#122B4E] text-white py-14 lg:py-20">
        <AmbientBackground variant="hero" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-left relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-xs text-white/70 font-medium" aria-label="Breadcrumb">
            <button
              onClick={() => onNavigate('/')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
            <span className="text-[#3AA88C] font-semibold">Our Branches</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-2 max-w-3xl"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Our Regional Branches & Field Routes
            </h1>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed pt-1">
              Verified physical locations in Eldoret and Iten, alongside our dedicated fleet delivery routes, van services, and direct dispatch contacts across the North Rift.
            </p>
            <div className="pt-2 flex flex-wrap gap-2.5">
              <a
                href="#field-routes"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#3AA88C] hover:bg-[#2C856E] text-white text-xs font-bold transition-colors shadow-xs"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Explore 12 Delivery Routes & Desks &darr;</span>
              </a>
              <a
                href="#branch-eldoret-main"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs border border-white/15 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-[#3AA88C]" />
                <span>Eldoret Depot Map</span>
              </a>
              <a
                href="#branch-iten-substore"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs border border-white/15 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-[#F2A93B]" />
                <span>Iten Sub-Store Map</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. FIELD DISTRIBUTION ROUTES & DIRECT DESKS DIRECTORY */}
      <section id="field-routes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RoutesDirectory />
      </section>

      {/* 3. PHYSICAL DEPOT BRANCHES & INTERACTIVE GOOGLE MAPS */}
      <section id="branch-maps" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-4">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1B3E6F]/10 text-[#1B3E6F]">
            <Building2 className="w-3.5 h-3.5" />
            Physical Facilities & Depots
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B3E6F]">
            Eldoret Main Depot & Iten Sub-Store Map Pins
          </h2>
          <p className="text-sm text-neutral-600">
            Pinpointed GPS coordinates, warehouse entrance landmarks, and turn-by-turn navigation for stock collections.
          </p>
        </div>

        <div className="space-y-12">
          {BRANCHES.map((branch, index) => (
            <motion.div
              key={branch.id}
              id={branch.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Left Details */}
                <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#3AA88C]/15 text-[#2C856E]">
                        {branch.type}
                      </span>
                      <span className="text-xs font-semibold text-neutral-500">
                        {branch.type === 'Main Office' ? '• Central Dispatch' : '• Regional Sub-Depot'}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B3E6F]">
                      {branch.name}
                    </h2>

                    {/* Address */}
                    <div className="flex items-start gap-3 text-neutral-700 text-sm">
                      <MapPin className="w-5 h-5 text-[#E8582F] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-[#222222]">{branch.address}</p>
                        <p className="text-xs text-neutral-500">{branch.county}</p>
                      </div>
                    </div>

                    {/* Exact GPS Coordinates */}
                    {branch.coordinatesDisplay && (
                      <div className="flex items-center gap-2.5 text-xs text-neutral-600 bg-neutral-50 border border-neutral-200/80 px-3 py-2 rounded-xl">
                        <Compass className="w-4 h-4 text-[#3AA88C] flex-shrink-0" />
                        <div>
                          <span className="font-bold text-neutral-700 mr-1.5">GPS Coordinates:</span>
                          <code className="font-mono text-neutral-800 text-[11px]">
                            {branch.coordinatesDisplay}
                          </code>
                        </div>
                      </div>
                    )}

                    {/* Nearby Landmarks */}
                    {branch.landmarks && branch.landmarks.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                          Location Landmarks:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {branch.landmarks.map((landmark) => (
                            <span
                              key={landmark}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100/80 text-neutral-700 text-xs font-medium border border-neutral-200/60"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#E8582F]" />
                              {landmark}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Phone */}
                    <div className="flex items-center gap-3 text-neutral-700 text-sm">
                      <Phone className="w-4 h-4 text-[#3AA88C] flex-shrink-0" />
                      <a
                        href={`tel:${branch.phone}`}
                        className="font-semibold hover:text-[#3AA88C] transition-colors"
                      >
                        {branch.phoneDisplay}
                      </a>
                    </div>

                    {/* Hours */}
                    <div className="flex items-start gap-3 text-neutral-700 text-sm">
                      <Clock className="w-4 h-4 text-[#F2A93B] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-xs sm:text-sm">{branch.operatingHours}</p>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mt-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          <span>Open Everyday to 8:30 PM</span>
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="pt-2">
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        {branch.description}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <motion.a
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      href={branch.googleMapsDirectionsUrl || branch.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#1B3E6F] hover:bg-[#122B4E] text-white font-semibold text-xs tracking-wide transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs text-center"
                      title="Get turn-by-turn driving directions to this location"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#3AA88C]" />
                      <span>Get Directions</span>
                    </motion.a>

                    <motion.a
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      href={branch.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-neutral-300 hover:border-neutral-400 bg-white text-neutral-800 font-semibold text-xs tracking-wide transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
                      title="View pin on Google Maps"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
                      <span>View Map Pin</span>
                    </motion.a>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={onOpenOrderModal}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#3AA88C] hover:bg-[#2C856E] text-white font-semibold text-xs tracking-wide transition-colors cursor-pointer shadow-xs text-center sm:ml-auto"
                    >
                      Order Stock
                    </motion.button>
                  </div>
                </div>

                {/* Right Map Embed with Pin Overlay */}
                <div className="lg:col-span-6 bg-neutral-100 min-h-[360px] lg:min-h-full border-t lg:border-t-0 lg:border-l border-neutral-200 relative overflow-hidden flex flex-col">
                  {/* Live Pin Header Tag */}
                  <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md shadow-md text-xs font-bold text-[#1B3E6F] border border-neutral-200">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                      <span>Pinned: {branch.name}</span>
                    </span>
                    <a
                      href={branch.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pointer-events-auto px-2.5 py-1.5 rounded-xl bg-[#1B3E6F]/90 hover:bg-[#1B3E6F] text-white text-[11px] font-semibold backdrop-blur-md shadow-md flex items-center gap-1 transition-colors"
                    >
                      <span>Full Map</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <iframe
                    title={`${branch.name} Google Map Location Pin`}
                    src={branch.mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: '380px' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full flex-1 filter contrast-105"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. LOGISTICS COVERAGE HIGHLIGHT WITH MOTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-[#1B3E6F] text-white rounded-3xl p-8 lg:p-10 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left"
        >
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#3AA88C] mb-2 mx-auto md:mx-0">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-white">Daily Outlets Delivery</h3>
            <p className="text-xs text-neutral-300">
              Regular fleet delivery schedules throughout Eldoret CBD, Langas, Huruma, Pioneer, and Iten.
            </p>
          </div>

          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#F2A93B] mb-2 mx-auto md:mx-0">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-white">Direct Warehouse Pickup</h3>
            <p className="text-xs text-neutral-300">
              Outlets can also pick up directly from Rupa Godowns or Sitet Building with pre-cleared payment.
            </p>
          </div>

          <div className="space-y-1">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#3AA88C] mb-2 mx-auto md:mx-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-white">Guaranteed Genuine Stock</h3>
            <p className="text-xs text-neutral-300">
              Direct factory supplies from Kenya Breweries Limited with intact factory seals and tamper-proof caps.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
