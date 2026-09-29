import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  ChevronRight,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Layers,
  Database,
  Check,
} from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { getProducts, getCategories, getBrands, formatCurrency, syncProductsFromTheBar, getLastSyncTime } from '../services/products';
import { fetchCategories } from '../services/productsService';
import ProductCard from '../components/ProductCard';
import AmbientBackground from '../components/AmbientBackground';
import { useCart } from '../context/CartContext';

interface CataloguePageProps {
  initialCategory?: string;
  onNavigate: (route: string) => void;
  onOpenOrderModal: (product?: Product) => void;
}

export default function CataloguePage({
  initialCategory,
  onNavigate,
  onOpenOrderModal,
}: CataloguePageProps) {
  const { openCheckout, setIsCartOpen, totalItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [lastSyncText, setLastSyncText] = useState<string>(getLastSyncTime());

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Available brands & categories
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>(['All', ...getCategories()]);

  // Load backend categories
  useEffect(() => {
    fetchCategories().then((cats) => {
      if (cats && cats.length > 0) {
        const uniqueNames = Array.from(new Set(cats.map((c) => c.name)));
        setCategories(['All', ...uniqueNames]);
      }
    });
  }, []);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Sync with TheBar live action
  const handleSyncTheBar = async () => {
    setSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await syncProductsFromTheBar();
      setLastSyncText(res.timestamp ? new Date(res.timestamp).toLocaleTimeString() : 'Just now');
      setSyncFeedback(res.message);
      setRefreshTrigger((prev) => prev + 1);
      setTimeout(() => setSyncFeedback(null), 5000);
    } catch (err) {
      setSyncFeedback('Could not complete live sync. Using verified catalogue cache.');
      setTimeout(() => setSyncFeedback(null), 4000);
    } finally {
      setSyncing(false);
    }
  };

  // Load brands and initial products
  useEffect(() => {
    getBrands().then((b) => setAvailableBrands(b));
  }, [refreshTrigger]);

  // Listen for global sync events
  useEffect(() => {
    const handleGlobalSync = () => {
      setLastSyncText(getLastSyncTime());
      setRefreshTrigger((prev) => prev + 1);
    };
    window.addEventListener('cyden:thebar-synced', handleGlobalSync);
    return () => window.removeEventListener('cyden:thebar-synced', handleGlobalSync);
  }, []);

  // Fetch filtered products through the product service adapter
  useEffect(() => {
    setLoading(true);
    getProducts({
      category: selectedCategory === 'All' ? undefined : selectedCategory,
      brand: selectedBrand === 'All' ? undefined : selectedBrand,
      searchQuery: searchQuery,
      inStockOnly: inStockOnly ? true : undefined,
    }).then((data) => {
      // Sorting
      const sorted = [...data].sort((a, b) => {
        if (sortBy === 'featured') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        return 0;
      });

      setProducts(sorted);
      setCurrentPage(1); // Reset to page 1 on filter change
      setLoading(false);
    });
  }, [selectedCategory, selectedBrand, searchQuery, inStockOnly, sortBy, refreshTrigger]);

  // Update category when prop changes
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Calculate Paginated slice
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return products.slice(start, start + itemsPerPage);
  }, [products, currentPage]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedBrand('All');
    setSearchQuery('');
    setInStockOnly(false);
    setSortBy('featured');
  };

  return (
    <div className="space-y-8 pb-16 overflow-hidden">
      {/* 1. PAGE HEADER & BREADCRUMBS */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1B3E6F] to-[#122B4E] text-white py-12 lg:py-16">
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
            <span className="text-[#3AA88C] font-semibold">Product Catalogue</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-2 max-w-2xl"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3AA88C]/20 text-xs font-bold text-[#3AA88C]">
                <Layers className="w-3.5 h-3.5" />
                <span>Retail & Wholesale Beverage Ordering</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Beverage Catalogue & Fast Delivery
              </h1>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Add multiple drinks to your cart, specify your delivery estate or lounge in Eldoret & Iten, and pay instantly via Safaricom Lipa Na M-Pesa STK Push.
              </p>
            </motion.div>

            {/* Ordering & Live TheBar Sync control */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-col items-start sm:items-end gap-2"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:px-4 sm:py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-neutral-200 w-full sm:w-auto">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#3AA88C]/20 flex items-center justify-center text-[#3AA88C] flex-shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <span>TheBar Live Sync</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3AA88C] animate-pulse" />
                    </div>
                    <span className="text-[10px] text-neutral-300">
                      Prices & Packshots: {lastSyncText}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSyncTheBar}
                  disabled={syncing}
                  className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-[#E8582F] hover:bg-[#C53F19] disabled:opacity-50 text-white font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm flex-shrink-0"
                  title="Synchronize prices and images directly with ke.thebar.com"
                >
                  <RotateCcw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                  <span>{syncing ? 'Syncing...' : 'Sync with TheBar'}</span>
                </button>
              </div>

              {syncFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[11px] font-medium"
                >
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>{syncFeedback}</span>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. FILTER & SEARCH CONTROL BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-xs space-y-4"
        >
          {/* Top Row: Search Bar & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search Tusker, Blue Label, Gin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8F7F4] border border-neutral-200 rounded-xl text-sm text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#3AA88C] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Brand Dropdown & Sort */}
            <div className="w-full sm:w-auto flex flex-wrap items-center gap-2.5">
              {/* Brand Selector */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-neutral-500 font-semibold hidden md:inline">Brand:</span>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="px-3 py-2 bg-[#F8F7F4] border border-neutral-200 rounded-xl text-xs font-medium text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
                >
                  <option value="All">All Brands</option>
                  {availableBrands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-neutral-500 font-semibold hidden md:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 bg-[#F8F7F4] border border-neutral-200 rounded-xl text-xs font-medium text-[#222222] focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
                >
                  <option value="featured">Featured / Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>

              {/* In-Stock Only Toggle */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setInStockOnly(!inStockOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 cursor-pointer transition-colors ${
                  inStockOnly
                    ? 'bg-[#3AA88C] text-white border-[#3AA88C]'
                    : 'bg-[#F8F7F4] text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${inStockOnly ? 'opacity-100' : 'opacity-0'}`} />
                <span>In Stock Only</span>
              </motion.button>

              {/* Reset Button */}
              {(selectedCategory !== 'All' || selectedBrand !== 'All' || searchQuery || inStockOnly || sortBy !== 'featured') && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleResetFilters}
                  className="px-3 py-2 text-xs text-[#E8582F] hover:bg-rose-50 rounded-xl font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Bottom Row: Category Pills Strip */}
          <div className="pt-2 border-t border-neutral-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex-shrink-0 mr-1">
              Category:
            </span>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <motion.button
                  key={cat}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1B3E6F] text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {cat}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* 3. PRODUCT GRID WITH ANIMATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-neutral-500 font-medium">
            Showing <strong className="text-neutral-900">{products.length}</strong> items in catalogue
            {selectedCategory !== 'All' && ` (${selectedCategory})`}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-400 hidden sm:inline">Pricing currency: KSH</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 bg-neutral-200/60 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedCategory}-${selectedBrand}-${currentPage}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {paginatedProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onRequestOrder={onOpenOrderModal}
                  index={index}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-12 text-center max-w-lg mx-auto border border-neutral-200 space-y-4"
          >
            <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-neutral-900">No matching products found</h3>
            <p className="text-xs text-neutral-500">
              We couldn’t find beverages matching your search filters. Try clearing your search term or selecting another category.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-[#3AA88C] text-white font-semibold text-xs shadow-xs cursor-pointer"
            >
              Reset Filters
            </button>
          </motion.div>
        )}

        {/* 4. PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage((p) => Math.max(p - 1, 1));
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </motion.button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <motion.button
                key={pageNum}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCurrentPage(pageNum);
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-[#1B3E6F] text-white'
                    : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {pageNum}
              </motion.button>
            ))}

            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={currentPage === totalPages}
              onClick={() => {
                setCurrentPage((p) => Math.min(p + 1, totalPages));
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </motion.button>
          </div>
        )}
      </section>

      {/* 5. DIRECT CYDEN DISTRIBUTORS CHECKOUT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-neutral-900 via-[#15325b] to-[#1B3E6F] rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 border border-neutral-800 shadow-md"
        >
          <div className="space-y-1.5 text-left">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3AA88C] inline-block animate-pulse" />
              <span className="text-xs uppercase font-bold tracking-wider text-[#F2A93B]">
                Direct Depot Fulfillment
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">
              Direct Ordering with Cyden Distributors
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-xl">
              Order single bottles or complete commercial crates with direct warehouse dispatch from Rupa Godowns (Eldoret) or Sitet Building (Iten). Pay securely via Lipa Na M-Pesa.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (totalItems > 0) {
                  openCheckout('retail');
                } else {
                  setIsCartOpen(true);
                }
              }}
              className="px-6 py-3 rounded-xl bg-[#3AA88C] hover:bg-[#2C856E] text-white font-bold text-xs tracking-wide transition-all shadow-md flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{totalItems > 0 ? 'Proceed to Direct Checkout' : 'View Direct Cart'}</span>
            </motion.button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
