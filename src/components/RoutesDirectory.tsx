import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Truck,
  Phone,
  CreditCard,
  Search,
  Check,
  Copy,
  MapPin,
  MessageCircle,
  Building,
  Headphones,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';
import { DISTRIBUTION_ROUTES } from '../data/companyData';
import { RouteCategory } from '../types';

interface RoutesDirectoryProps {
  initialSearch?: string;
  className?: string;
  showTitle?: boolean;
}

export default function RoutesDirectory({
  initialSearch = '',
  className = '',
  showTitle = true,
}: RoutesDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [copiedTillId, setCopiedTillId] = useState<string | null>(null);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  const handleCopyTill = (till: string, id: string, routeName: string) => {
    if (!till) return;
    navigator.clipboard.writeText(till);
    setCopiedTillId(id);
    setCopiedToast(`Copied Till ${till} (${routeName})`);
    setTimeout(() => {
      setCopiedTillId(null);
      setCopiedToast(null);
    }, 2200);
  };

  const categories = [
    { id: 'all', label: 'All Routes & Desks', count: DISTRIBUTION_ROUTES.length },
    { id: 'support', label: 'Support & KSO', count: DISTRIBUTION_ROUTES.filter((r) => r.category === 'support').length },
    { id: 'core_route', label: 'Core Delivery Routes', count: DISTRIBUTION_ROUTES.filter((r) => r.category === 'core_route').length },
    { id: 'van', label: 'UDV Spirits Vans', count: DISTRIBUTION_ROUTES.filter((r) => r.category === 'van').length },
    { id: 'counter', label: 'Depot Counters', count: DISTRIBUTION_ROUTES.filter((r) => r.category === 'counter').length },
  ];

  const quickFilterLocations = [
    'KSO',
    'Support',
    'Town',
    'Langas',
    'Kapsabet',
    'Iten',
    'Metkei',
    'Kesses',
    'Annex',
    'CBD',
  ];

  const filteredRoutes = useMemo(() => {
    return DISTRIBUTION_ROUTES.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.route.toLowerCase().includes(q) ||
        item.site.toLowerCase().includes(q) ||
        item.phoneNumber.replace(/\s+/g, '').includes(q.replace(/\s+/g, '')) ||
        (item.tillNumber && item.tillNumber.includes(q)) ||
        item.categoryLabel.toLowerCase().includes(q) ||
        (item.waypoints && item.waypoints.some((wp) => wp.toLowerCase().includes(q)));

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const getCategoryBadge = (cat: RouteCategory, label: string) => {
    switch (cat) {
      case 'core_route':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#1B3E6F]/10 text-[#1B3E6F] border border-[#1B3E6F]/20">
            <Truck className="w-3 h-3 text-[#1B3E6F]" />
            {label}
          </span>
        );
      case 'van':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
            <Sparkles className="w-3 h-3 text-amber-600" />
            {label}
          </span>
        );
      case 'counter':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <Building className="w-3 h-3 text-emerald-700" />
            {label}
          </span>
        );
      case 'support':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <Headphones className="w-3 h-3 text-purple-700" />
            {label}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Floating Copy Feedback */}
      <AnimatePresence>
        {copiedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 sm:right-8 z-50 bg-[#1B3E6F] text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-white/20"
          >
            <Check className="w-4 h-4 text-[#3AA88C]" />
            <span>{copiedToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header (Refocused on Delivery Routes & Order Lines) */}
      {showTitle && (
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#3AA88C]/15 text-[#2C856E] border border-[#3AA88C]/25">
            <Truck className="w-3.5 h-3.5" />
            <span>Commercial Route Corridors & Direct Dispatch</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1B3E6F] tracking-tight">
            Field Distribution Routes & Order Lines
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-2xl mx-auto">
            Find the dedicated delivery truck, UDV spirits van, or depot counter servicing your commercial outlet. Contact the route team directly to schedule replenishment or place orders.
          </p>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search route name, town, estate, or phone (e.g. Langas, Metkei, Kesses, 0740631102)..."
              className="w-full pl-10 pr-16 py-2.5 bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#3AA88C]/40 focus:border-[#3AA88C] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-400 hover:text-neutral-700 px-1 py-0.5"
              >
                Clear
              </button>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl shrink-0 self-end md:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-[#1B3E6F] shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-[#1B3E6F] shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>
        </div>

        {/* Category Pills & Quick Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-neutral-100">
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-[#1B3E6F] text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === cat.id
                      ? 'bg-white/20 text-white'
                      : 'bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Location Pills */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs text-neutral-500">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-neutral-400 mr-0.5">
              Quick Filter:
            </span>
            {quickFilterLocations.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setSearchQuery(searchQuery === loc ? '' : loc)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                  searchQuery.toLowerCase() === loc.toLowerCase()
                    ? 'bg-[#3AA88C] text-white font-bold'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border border-neutral-200/60'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: ROUTE CARDS GRID */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredRoutes.map((route, idx) => {
              const cleanPhoneDigits = route.phoneRaw.replace('+', '');
              const isCopied = copiedTillId === route.id;

              return (
                <motion.div
                  key={route.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: idx * 0.03 }}
                  className="bg-white rounded-3xl border border-neutral-200/90 shadow-xs hover:shadow-lg transition-all duration-300 p-6 flex flex-col justify-between space-y-5 relative overflow-hidden group hover:border-[#3AA88C]/40"
                >
                  {/* Top Bar: Route Name & Badge */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                          Delivery Route
                        </span>
                        <h3 className="text-2xl font-black text-[#1B3E6F] tracking-tight group-hover:text-[#3AA88C] transition-colors">
                          {route.route}
                        </h3>
                      </div>
                      {getCategoryBadge(route.category, route.categoryLabel)}
                    </div>

                    {/* Coverage & Waypoints Description */}
                    <div className="bg-[#F8F7F4] p-3.5 rounded-2xl border border-neutral-200/60 space-y-2.5">
                      <div className="flex items-start gap-2 text-xs text-neutral-700 leading-relaxed font-medium">
                        <MapPin className="w-4 h-4 text-[#E8582F] shrink-0 mt-0.5" />
                        <span>{route.site}</span>
                      </div>

                      {/* Waypoints breakdown */}
                      {route.waypoints && route.waypoints.length > 0 && (
                        <div className="pt-1 flex flex-wrap gap-1">
                          {route.waypoints.map((wp, wIdx) => (
                            <span
                              key={wIdx}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-neutral-600"
                            >
                              {wp}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Operational Details: Phone & Subtle Till */}
                  <div className="space-y-2.5 pt-2 border-t border-neutral-100">
                    {/* Direct Contact Phone */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
                        <Phone className="w-3.5 h-3.5 text-[#3AA88C]" />
                        <span>Order & Dispatch:</span>
                      </div>
                      <a
                        href={`tel:${route.phoneRaw}`}
                        className="font-bold text-sm text-[#1B3E6F] hover:text-[#3AA88C] transition-colors font-mono tracking-wide"
                      >
                        {route.phoneNumber}
                      </a>
                    </div>

                    {/* Subtle Till Number Metadata (Quiet, Non-intrusive) */}
                    {route.tillNumber && (
                      <div className="flex items-center justify-between gap-2 text-xs text-neutral-500 pt-0.5">
                        <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                          <CreditCard className="w-3 h-3 text-neutral-400" />
                          <span>Till:</span>
                        </span>
                        <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-neutral-700">
                          <span>{route.tillNumber}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyTill(route.tillNumber!, route.id, route.route)}
                            className="p-1 text-neutral-400 hover:text-neutral-700 rounded transition-colors cursor-pointer"
                            title="Copy Till Number"
                          >
                            {isCopied ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Primary Action Buttons (Call & WhatsApp) */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={`tel:${route.phoneRaw}`}
                      className="py-2.5 px-3 rounded-xl bg-[#1B3E6F] hover:bg-[#122B4E] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#3AA88C]" />
                      <span>Call Route</span>
                    </a>
                    <a
                      href={`https://wa.me/${cleanPhoneDigits}?text=${encodeURIComponent(
                        `Hello Cyden Distributors (${route.route} Route). I would like to place an order / check delivery timing for my outlet.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* VIEW MODE 2: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1B3E6F] text-white text-xs uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-5">Route Name</th>
                  <th className="py-3.5 px-5">Coverage & Waypoints</th>
                  <th className="py-3.5 px-4">Order Line</th>
                  <th className="py-3.5 px-4">Till No.</th>
                  <th className="py-3.5 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-xs sm:text-sm">
                {filteredRoutes.map((route) => {
                  const cleanPhoneDigits = route.phoneRaw.replace('+', '');
                  const isCopied = copiedTillId === route.id;

                  return (
                    <tr
                      key={route.id}
                      className="hover:bg-[#FAF9F6] transition-colors group"
                    >
                      {/* Route Name & Badge */}
                      <td className="py-4 px-5 align-top whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="font-extrabold text-sm text-[#1B3E6F] group-hover:text-[#3AA88C] transition-colors">
                            {route.route}
                          </div>
                          <div>{getCategoryBadge(route.category, route.categoryLabel)}</div>
                        </div>
                      </td>

                      {/* Coverage & Stops */}
                      <td className="py-4 px-5 align-top max-w-md">
                        <p className="text-neutral-700 font-medium leading-relaxed text-xs sm:text-sm">
                          {route.site}
                        </p>
                        {route.waypoints && route.waypoints.length > 0 && (
                          <div className="pt-1.5 flex flex-wrap gap-1">
                            {route.waypoints.map((wp, wIdx) => (
                              <span
                                key={wIdx}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600"
                              >
                                {wp}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        <a
                          href={`tel:${route.phoneRaw}`}
                          className="font-mono font-bold text-[#1B3E6F] hover:text-[#3AA88C] transition-colors flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#3AA88C]" />
                          <span>{route.phoneNumber}</span>
                        </a>
                      </td>

                      {/* Quiet Till Number */}
                      <td className="py-4 px-4 align-top whitespace-nowrap">
                        {route.tillNumber ? (
                          <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-700">
                            <span>{route.tillNumber}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyTill(route.tillNumber!, route.id, route.route)}
                              className="p-1 text-neutral-400 hover:text-neutral-700 rounded transition-colors cursor-pointer"
                              title="Copy Till"
                            >
                              {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-neutral-400 text-xs italic">—</span>
                        )}
                      </td>

                      {/* Quick Actions */}
                      <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <a
                            href={`tel:${route.phoneRaw}`}
                            className="p-2 rounded-xl bg-neutral-100 hover:bg-[#1B3E6F] text-neutral-800 hover:text-white transition-colors"
                            title={`Call ${route.route}`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`https://wa.me/${cleanPhoneDigits}?text=${encodeURIComponent(
                              `Hello Cyden Distributors (${route.route} Route). I would like to place an order for my outlet.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 transition-colors"
                            title={`WhatsApp ${route.route}`}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty Search State */}
      {filteredRoutes.length === 0 && (
        <div className="bg-white rounded-3xl border border-neutral-200 p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center mx-auto">
            <Search className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-neutral-800">
            No routes found matching "{searchQuery}"
          </h4>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Try searching by another town, route name, or clearing your search.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-[#1B3E6F] text-white text-xs font-bold hover:bg-[#122B4E] transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Delivery Schedule & Central Dispatch Support Banner */}
      <div className="bg-gradient-to-r from-[#1B3E6F] via-[#16335C] to-[#122B4E] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-[#3AA88C] text-xs font-black uppercase tracking-wider">
            <Truck className="w-4 h-4" />
            <span>Dedicated Field Delivery Network</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Reliable Route Dispatch & Empty-Cooler Prevention
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Our route trucks and specialized UDV vans deliver on predictable weekly schedules to ensure your bar, lounge, or retail store never runs out of authentic EABL stock. Need off-schedule replenishment? Contact your route team or central dispatch.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <a
            href="tel:+254740631373"
            className="px-5 py-2.5 rounded-xl bg-[#3AA88C] hover:bg-[#2C856E] text-white font-bold text-xs tracking-wide transition-all shadow-md flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Central Dispatch</span>
          </a>
        </div>
      </div>
    </div>
  );
}
