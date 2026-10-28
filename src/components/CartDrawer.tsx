import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  MessageCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../services/products';
import { generateWhatsAppUrl } from '../utils/whatsapp';
import WhatsAppIcon from './WhatsAppIcon';

interface CartDrawerProps {
  onNavigateToCatalogue?: () => void;
}

export default function CartDrawer({ onNavigateToCatalogue }: CartDrawerProps) {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    subtotal,
    deliveryFee,
    grandTotal,
    openCheckout,
    openWhatsAppOrder,
  } = useCart();

  // Close on Escape key and prevent background scroll when open
  useEffect(() => {
    if (!isCartOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCartOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
        />

        {/* Slide-over panel - fixed to right, 100% width on mobile, max 420px on tablet/desktop */}
        <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] max-w-full flex justify-end z-50 pointer-events-none">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="w-full h-full max-h-screen bg-white shadow-2xl flex flex-col justify-between pointer-events-auto overflow-hidden"
          >
            {/* 1. Header with explicit Cancel button */}
            <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-neutral-200/80 bg-[#1B3E6F] text-white flex items-center justify-between gap-2 flex-shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#3AA88C] flex-shrink-0">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5 truncate">
                    <span>Your Drink Cart</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#3AA88C] text-white text-[10px] sm:text-[11px] font-extrabold flex-shrink-0">
                      {totalItems} {totalItems === 1 ? 'item' : 'items'}
                    </span>
                  </h2>
                  <p className="text-[10px] sm:text-[11px] text-neutral-300 truncate">
                    Retail & Commercial • Lipa Na M-Pesa STK
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-neutral-300 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
                    title="Empty Cart"
                    aria-label="Empty Cart"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                {/* Cancel / Close button */}
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white text-xs font-bold transition-all cursor-pointer border border-white/20"
                  aria-label="Cancel and close cart"
                  title="Close Cart"
                >
                  <X className="w-4 h-4" />
                  <span className="text-[11px] font-semibold">Cancel</span>
                </button>
              </div>
            </div>

            {/* 2. Cart Items List */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-neutral-500">
                  <div className="w-16 h-16 rounded-3xl bg-neutral-100 flex items-center justify-center text-neutral-400">
                    <ShoppingBag className="w-8 h-8 stroke-1" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#1B3E6F]">Your Cart is Empty</h3>
                    <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                      Select drinks from our portfolio. Both individual customers and bars can add multiple products and checkout with M-Pesa.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      if (onNavigateToCatalogue) onNavigateToCatalogue();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#1B3E6F] hover:bg-[#122B4E] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    Browse Beverage Catalogue
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-2.5">
                    {cart.map(({ product, quantity }) => {
                      return (
                        <motion.div
                          key={product.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="p-3 rounded-2xl border border-neutral-200/80 bg-[#F8F7F4]/60 hover:bg-[#F8F7F4] transition-colors space-y-2"
                        >
                          <div className="flex items-center gap-3">
                            {/* Thumbnail */}
                            <div className="w-14 h-14 rounded-xl bg-white border border-neutral-200/70 p-1 flex items-center justify-center flex-shrink-0">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  onError={(e) => {
                                    if (product.fallback_image_url) {
                                      e.currentTarget.src = product.fallback_image_url;
                                    }
                                  }}
                                  className="w-full h-full object-contain mix-blend-multiply"
                                />
                              ) : (
                                <ShoppingBag className="w-5 h-5 text-neutral-400" />
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-[#E8582F] truncate">
                                  {product.brand}
                                </span>
                                <span className="text-[9px] text-neutral-500 bg-neutral-200/70 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                                  {product.size}
                                </span>
                              </div>

                              <h4 className="text-xs font-bold text-[#1B3E6F] truncate" title={product.name}>
                                {product.name}
                              </h4>

                              <p className="text-xs font-extrabold text-[#222222] mt-0.5">
                                {formatCurrency(product.price)}
                                <span className="text-[10px] font-normal text-neutral-500 ml-1">each</span>
                              </p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <div className="flex items-center border border-neutral-300 rounded-lg bg-white shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(product.id, quantity - 1)}
                                  className="w-6 h-6 flex items-center justify-center text-neutral-600 hover:text-[#1B3E6F] hover:bg-neutral-100 rounded-l-lg transition-colors cursor-pointer"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center text-xs font-bold text-[#222222]">
                                  {quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(product.id, quantity + 1)}
                                  className="w-6 h-6 flex items-center justify-center text-neutral-600 hover:text-[#1B3E6F] hover:bg-neutral-100 rounded-r-lg transition-colors cursor-pointer"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <span className="text-[11px] font-bold text-[#3AA88C]">
                                {formatCurrency(product.price * quantity)}
                              </span>
                            </div>
                          </div>

                          {/* Authentic EABL Guarantee & Remove */}
                          <div className="pt-1.5 border-t border-neutral-200/60 flex items-center justify-between text-[10px]">
                            <span className="text-neutral-500 font-medium flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#3AA88C]"></span>
                              <span>Authentic EABL Sealed Direct Dispatch</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFromCart(product.id)}
                              className="text-neutral-400 hover:text-red-600 transition-colors font-semibold cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Informational Banner */}
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl text-[11px] text-emerald-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <Truck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Eldoret & Iten Fast Delivery</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 leading-snug">
                      Orders are dispatched directly from our central godowns at Rupa or Sitet Iten. Free delivery applies for orders over KSH 4,000.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* 3. Footer / Checkout & Cancel Triggers */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-neutral-200 bg-white space-y-2.5 sm:space-y-3 shadow-lg flex-shrink-0">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="font-semibold text-neutral-800">{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="flex items-center justify-between text-neutral-600">
                    <span className="flex items-center gap-1">
                      Delivery
                      {deliveryFee === 0 && (
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 rounded">
                          FREE
                        </span>
                      )}
                    </span>
                    <span className="font-semibold text-neutral-800">
                      {deliveryFee === 0 ? 'KSH 0' : formatCurrency(deliveryFee)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-sm">
                    <span className="font-bold text-[#1B3E6F]">Total Payable</span>
                    <span className="text-base sm:text-lg font-extrabold text-[#222222]">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>

                <div className="pt-1 space-y-2">
                  {/* Unified Direct Cyden Distributors Checkout Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openCheckout()}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#3AA88C] hover:bg-[#2C856E] text-white font-extrabold text-xs sm:text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Cyden Direct Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>

                  {/* Instant WhatsApp Order Submission Button */}
                  <button
                    type="button"
                    onClick={() => openWhatsAppOrder()}
                    className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-extrabold text-xs sm:text-sm tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-white" />
                    <span>Submit via WhatsApp (B2B / Personal • Pin GPS)</span>
                  </button>

                  {/* Explicit Cancel / Continue Shopping Button */}
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full py-2.5 px-3 rounded-xl border border-neutral-300 hover:border-neutral-400 bg-neutral-100/80 hover:bg-neutral-200 text-neutral-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Cancel & Continue Shopping</span>
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-500 pt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Direct Fulfillment by Cyden Distributors • Lipa na M-Pesa STK</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

