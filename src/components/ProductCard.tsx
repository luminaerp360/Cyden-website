import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Wine, Sparkles, Plus, Minus, Check } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../services/products';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onRequestOrder?: (product: Product) => void;
  index?: number;
}

export default function ProductCard({ product, onRequestOrder, index = 0 }: ProductCardProps) {
  const [currentImg, setCurrentImg] = useState<string | null>(product.image_url || product.fallback_image_url || null);
  const [hasFailedAll, setHasFailedAll] = useState(false);
  const [justAddedAnim, setJustAddedAnim] = useState<number | null>(null);
  const { addToCart, updateQuantity, getItemQuantity, setIsCartOpen } = useCart();

  const quantityInCart = getItemQuantity(product.id);

  const handleImageError = () => {
    if (currentImg === product.image_url && product.fallback_image_url) {
      setCurrentImg(product.fallback_image_url);
    } else {
      setHasFailedAll(true);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (!product.in_stock) return;
    addToCart(product, 1);
    setJustAddedAnim(Date.now());
  };

  return (
    <motion.div
      id={`product-card-${product.id}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.25) }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={product.in_stock ? { scale: 0.985 } : undefined}
      onClick={handleCardClick}
      className={`group flex flex-col bg-white rounded-2xl border transition-all duration-300 overflow-hidden relative select-none ${
        product.in_stock
          ? 'cursor-pointer hover:border-[#3AA88C] shadow-xs hover:shadow-lg'
          : 'cursor-not-allowed opacity-80 border-neutral-200'
      } ${
        quantityInCart > 0
          ? 'border-[#3AA88C] ring-2 ring-[#3AA88C]/20 shadow-sm'
          : 'border-neutral-200/90'
      }`}
      role="button"
      tabIndex={product.in_stock ? 0 : -1}
      aria-label={`${product.name} - ${formatCurrency(product.price)}. Click to add to cart.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick(e as any);
        }
      }}
    >
      {/* Floating "+1" Burst Animation on Click */}
      <AnimatePresence>
        {justAddedAnim && (
          <motion.div
            key={justAddedAnim}
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -36, scale: 1.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none px-3.5 py-1.5 rounded-full bg-[#1B3E6F] text-white text-xs font-black shadow-xl flex items-center gap-1.5 border border-white/30 backdrop-blur-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 text-[#3AA88C] stroke-[3]" />
            <span>Added ({quantityInCart})</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badges Top Bar */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
        {product.featured ? (
          <span className="inline-flex items-center gap-1 bg-[#1B3E6F]/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            Popular
          </span>
        ) : (
          <span />
        )}

        {/* In Cart Indicator or Out of Stock */}
        {!product.in_stock ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-900/80 text-white backdrop-blur-xs shadow-xs">
            Out of Stock
          </span>
        ) : quantityInCart > 0 ? (
          <motion.span
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#3AA88C] text-white shadow-xs"
          >
            <Check className="w-3 h-3 stroke-[3]" />
            <span>{quantityInCart} in cart</span>
          </motion.span>
        ) : (
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3AA88C]/15 text-[#2C856E]">
            Click to add
          </span>
        )}
      </div>

      {/* Product Image Stage */}
      <div className="relative w-full h-36 sm:h-48 md:h-52 bg-gradient-to-b from-[#FAF9F6] to-neutral-100/70 p-2.5 sm:p-4 flex items-center justify-center overflow-hidden">
        {currentImg && !hasFailedAll ? (
          <motion.img
            src={currentImg}
            alt={product.name}
            onError={handleImageError}
            loading="lazy"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full h-full object-contain mix-blend-multiply filter drop-shadow-sm pointer-events-none"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-neutral-400 p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center text-[#3AA88C] mb-2">
              <Wine className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-neutral-500">{product.brand}</span>
          </div>
        )}
      </div>

      {/* Clean Card Content */}
      <div className="p-3 sm:p-4 md:p-5 flex-1 flex flex-col justify-between gap-2 sm:gap-3">
        {/* Brand & Size */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-medium text-neutral-500">
            <span className="text-[#3AA88C] font-bold uppercase tracking-wider text-[11px]">
              {product.brand}
            </span>
            <span className="text-neutral-500 font-semibold text-[11px]">
              {product.size}
            </span>
          </div>

          {/* Product Title */}
          <h3
            className="font-bold text-xs sm:text-sm md:text-base text-neutral-900 group-hover:text-[#3AA88C] transition-colors line-clamp-2"
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* Pricing & Add to Cart Action */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2 mt-auto">
          <div className="min-w-0">
            <span className="text-sm sm:text-base md:text-lg font-black text-neutral-900 tracking-tight whitespace-nowrap">
              {formatCurrency(product.price)}
            </span>
          </div>

          {!product.in_stock ? (
            <span className="px-2.5 py-1.5 rounded-xl bg-neutral-100 text-neutral-400 font-semibold text-xs whitespace-nowrap">
              Unavailable
            </span>
          ) : quantityInCart > 0 ? (
            <div
              className="flex items-center gap-1.5 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center border border-[#3AA88C] rounded-xl bg-emerald-50/70 overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateQuantity(product.id, quantityInCart - 1);
                  }}
                  className="w-7 h-7 flex items-center justify-center text-neutral-800 hover:bg-[#3AA88C] hover:text-white transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-xs font-bold text-neutral-900">
                  {quantityInCart}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product, 1);
                    setJustAddedAnim(Date.now());
                  }}
                  className="w-7 h-7 flex items-center justify-center text-neutral-800 hover:bg-[#3AA88C] hover:text-white transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCartOpen(true);
                }}
                className="w-7 h-7 rounded-xl bg-[#1B3E6F] text-white flex items-center justify-center hover:bg-[#122B4E] transition-colors cursor-pointer"
                title="View in Cart"
                aria-label="View in Cart"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product, 1);
                setJustAddedAnim(Date.now());
              }}
              className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#3AA88C] hover:bg-[#2F8D75] text-white font-bold text-xs tracking-wide transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title={`Add ${product.name} to cart`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
