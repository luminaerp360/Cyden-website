import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Phone,
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  Clock,
  Instagram,
  Facebook,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { COMPANY_INFO, BRANCHES } from '../data/companyData';
import AmbientBackground from '../components/AmbientBackground';
import RoutesDirectory from '../components/RoutesDirectory';

// Custom X and TikTok icons
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

interface ContactPageProps {
  onNavigate: (route: string) => void;
}

export default function ContactPage({ onNavigate }: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    outletName: '',
    inquiryType: 'Wholesale Beverage Distribution',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedBranchIndex, setSelectedBranchIndex] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 600);
  };

  return (
    <div className="space-y-16 lg:space-y-20 pb-16 overflow-hidden">
      {/* 1. PAGE HEADER WITH AMBIENT BACKGROUND */}
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
            <span className="text-[#3AA88C] font-semibold">Contact Us</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-2 max-w-3xl"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Get in Touch with Cyden Distributors
            </h1>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed pt-1">
              Connect with our Eldoret sales desk or Iten depository for beverage wholesale supply, account registration, and scheduled route deliveries.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. FORM & CONTACT DETAILS SPLIT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Contact Details Card & Branches */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Primary Details Box */}
            <div className="bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-xs space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3AA88C]">
                  Direct Contact Channels
                </span>
                <h2 className="text-2xl font-bold text-[#1B3E6F]">
                  Distribution Headquarters
                </h2>
              </div>

              <div className="space-y-4 text-sm text-neutral-700">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#E8582F]/10 text-[#E8582F] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-xs font-bold uppercase text-neutral-400">Main Office & Godown</strong>
                    <span className="font-semibold text-neutral-800">{COMPANY_INFO.contact.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#3AA88C]/10 text-[#2C856E] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-xs font-bold uppercase text-neutral-400">Main Sales Phone</strong>
                    <a
                      href={`tel:${COMPANY_INFO.contact.primaryPhoneRaw}`}
                      className="font-semibold text-neutral-800 hover:text-[#3AA88C] transition-colors block"
                    >
                      {COMPANY_INFO.contact.primaryPhone}
                    </a>
                    <span className="block text-xs text-neutral-500">Secondary: {COMPANY_INFO.contact.secondaryPhone}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#1B3E6F]/10 text-[#1B3E6F] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-xs font-bold uppercase text-neutral-400">Official Inquiries Email</strong>
                    <a
                      href={`mailto:${COMPANY_INFO.contact.email}`}
                      className="font-semibold text-neutral-800 hover:text-[#3AA88C] transition-colors break-all"
                    >
                      {COMPANY_INFO.contact.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#F2A93B]/10 text-[#F2A93B] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <strong className="block text-xs font-bold uppercase text-neutral-400">Operating Hours</strong>
                    <span className="font-semibold text-neutral-800 block">{BRANCHES[0].operatingHours}</span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      <span>Open Everyday to 8:30 PM</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Social Media Link Handles */}
              <div className="pt-4 border-t border-neutral-100">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-3">
                  Follow Us Online
                </span>
                <div className="flex items-center gap-2.5">
                  <motion.a
                    whileHover={{ scale: 1.1, y: -2 }}
                    href={COMPANY_INFO.socials.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-[#1877F2] hover:text-white text-neutral-700 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                    title="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.1, y: -2 }}
                    href={COMPANY_INFO.socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-[#E4405F] hover:text-white text-neutral-700 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.1, y: -2 }}
                    href={COMPANY_INFO.socials.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-black hover:text-white text-neutral-700 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                    title="X / Twitter"
                  >
                    <XIcon className="w-4 h-4" />
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.1, y: -2 }}
                    href={COMPANY_INFO.socials.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-black hover:text-white text-neutral-700 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                    title="TikTok"
                  >
                    <TikTokIcon className="w-4 h-4" />
                  </motion.a>
                </div>
              </div>
            </div>

            {/* Quick Branches Highlight Card */}
            <div className="bg-[#F8F7F4] rounded-3xl p-6 border border-neutral-200/80 space-y-4">
              <h3 className="font-bold text-[#1B3E6F] text-base">
                Looking to visit in person?
              </h3>
              <p className="text-xs text-neutral-600">
                You are welcome to visit our administrative offices or schedule an account onboarding session with our trade representative.
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-white rounded-xl border border-neutral-200">
                  <span className="font-bold text-[#1B3E6F] block">Eldoret Main Depot</span>
                  <span className="text-neutral-500">Rupa Godowns, Eldoret-Malaba Road</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-neutral-200">
                  <span className="font-bold text-[#1B3E6F] block">Iten Sub-Store</span>
                  <span className="text-neutral-500">Sitet Building, Iten-Kabarnet Road</span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate('/branches')}
                className="w-full py-2.5 rounded-xl bg-[#1B3E6F] text-white text-xs font-bold hover:bg-[#122B4E] transition-colors cursor-pointer"
              >
                View Interactive Branch Maps &rarr;
              </motion.button>
            </div>
          </motion.div>

          {/* Right: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7"
          >
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-200/80 shadow-xs space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#E8582F]">
                  Send Message
                </span>
                <h2 className="text-2xl font-bold text-[#1B3E6F]">
                  Contact Sales & Support
                </h2>
                <p className="text-xs text-neutral-500">
                  Fill in your details below and our team will get back to you promptly.
                </p>
              </div>

              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-emerald-900">Message Received!</h3>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong>{formData.name}</strong>. Your inquiry regarding{' '}
                    <em>{formData.inquiryType}</em> has been sent to our Eldoret distribution desk. Our representative will contact you via <strong>{formData.phone || formData.email}</strong>.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setIsSuccess(false);
                        setFormData({
                          name: '',
                          email: '',
                          phone: '',
                          outletName: '',
                          inquiryType: 'Wholesale Beverage Distribution',
                          message: '',
                        });
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      Send Another Message
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-neutral-700">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Samuel Kipchoge"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-neutral-200 rounded-xl text-xs sm:text-sm text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-neutral-700">
                        Phone Number (WhatsApp preferred) *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +254 722 000 000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-neutral-200 rounded-xl text-xs sm:text-sm text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-neutral-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="yourname@gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-neutral-200 rounded-xl text-xs sm:text-sm text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-neutral-700">
                        Bar / Outlet / Business Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Highland Lounge Eldoret"
                        value={formData.outletName}
                        onChange={(e) => setFormData({ ...formData, outletName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-neutral-200 rounded-xl text-xs sm:text-sm text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-neutral-700">
                      Nature of Inquiry
                    </label>
                    <select
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-neutral-200 rounded-xl text-xs sm:text-sm text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
                    >
                      <option value="Wholesale Beverage Distribution">Wholesale Beverage Distribution / Route Delivery</option>
                      <option value="New Outlet Account Registration">New Outlet Account Registration & Credit Terms</option>
                      <option value="Special Events / Bulk Keg Supplies">Special Events / Bulk Keg Supplies (Weddings, Corporate)</option>
                      <option value="TheBar Storefront Inquiries">TheBar Storefront Consumer Ordering</option>
                      <option value="General Partnerships">General Partnerships & Supplier Inquiries</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-neutral-700">
                      Message / Order Details *
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Please let us know which beverage lines you are looking for (Tusker, Guinness, Johnnie Walker, etc.) or your questions..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#F8F7F4] border border-neutral-200 rounded-xl text-xs sm:text-sm text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
                    />
                  </div>

                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 rounded-xl bg-[#E8582F] hover:bg-[#D04620] text-white font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? 'Sending Message...' : 'Submit Inquiry to Cyden Desk'}</span>
                    </motion.button>
                    <p className="text-[11px] text-neutral-400 text-center mt-2">
                      Inquiries are directed to <span className="font-semibold text-neutral-600">{COMPANY_INFO.contact.email}</span>. We typically respond within 2-4 business hours.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. FIELD DISTRIBUTION ROUTES & TILLS DIRECTORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RoutesDirectory />
      </section>

      {/* 4. EMBEDDED MAP SECTION WITH BRANCH SELECTOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden"
        >
          {/* Header & Location Tabs */}
          <div className="p-6 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#3AA88C]">
                  Live Pinned Facility
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#1B3E6F]">
                {BRANCHES[selectedBranchIndex].name}
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                {BRANCHES[selectedBranchIndex].address} • {BRANCHES[selectedBranchIndex].county}
              </p>
            </div>

            {/* Branch Switcher Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {BRANCHES.map((b, idx) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBranchIndex(idx)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedBranchIndex === idx
                      ? 'bg-[#1B3E6F] text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {b.type === 'Main Office' ? '📍 Eldoret Depot' : '📍 Iten Depot'}
                </button>
              ))}
            </div>
          </div>

          {/* Coordinate & Directions Info Strip */}
          <div className="px-6 py-3 bg-[#FAF9F6] border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-neutral-600 font-mono text-[11px]">
              <span className="font-semibold text-neutral-800 font-sans">GPS Coordinates:</span>
              <span className="px-2 py-0.5 rounded bg-white border border-neutral-200">
                {BRANCHES[selectedBranchIndex].coordinatesDisplay}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={BRANCHES[selectedBranchIndex].googleMapsDirectionsUrl || BRANCHES[selectedBranchIndex].googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#1B3E6F] hover:text-[#3AA88C] transition-colors flex items-center gap-1"
              >
                <span>Get Driving Directions</span>
                <span aria-hidden="true">&rarr;</span>
              </a>
              <span className="text-neutral-300">|</span>
              <a
                href={BRANCHES[selectedBranchIndex].googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#3AA88C] hover:underline flex items-center gap-1"
              >
                <span>Open Google Maps</span>
                <span aria-hidden="true">&nearr;</span>
              </a>
            </div>
          </div>

          {/* Map Frame with Location Pin */}
          <div className="w-full h-88 bg-neutral-100 relative">
            <iframe
              key={BRANCHES[selectedBranchIndex].id}
              title={`Cyden Distributors ${BRANCHES[selectedBranchIndex].name} Map Pin`}
              src={BRANCHES[selectedBranchIndex].mapEmbedUrl}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </motion.div>
      </section>
    </div>
  );
}
