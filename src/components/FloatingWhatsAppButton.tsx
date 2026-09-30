import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  ShoppingBag,
  ExternalLink,
  MapPin,
  Clock,
  Sparkles,
  Phone,
  CheckCircle2,
  FileText,
  MessageSquare,
  Building2,
  User,
  Navigation,
  CreditCard,
  Compass,
  AlertCircle,
  SlidersHorizontal,
} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../services/products';
import { WHATSAPP_NUMBERS, generateWhatsAppUrl, OrderAudience } from '../utils/whatsapp';

export default function FloatingWhatsAppButton() {
  const {
    cart,
    totalItems,
    subtotal,
    deliveryFee,
    grandTotal,
    deliveryDetails,
    setDeliveryDetails,
    openWhatsAppOrder,
  } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<'eldoret' | 'iten'>('eldoret');
  const [orderType, setOrderType] = useState<OrderAudience>(
    deliveryDetails.customerType === 'b2b' ? 'b2b' : 'personal'
  );

  const [customerName, setCustomerName] = useState(deliveryDetails.fullName || '');
  const [outletName, setOutletName] = useState(deliveryDetails.businessName || '');
  const [phone, setPhone] = useState(deliveryDetails.phone || '');
  const [deliveryLocation, setDeliveryLocation] = useState(
    deliveryDetails.townArea || 'Eldoret CBD'
  );

  // GPS Pinning state
  const [isLocating, setIsLocating] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
  } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Payment Message state
  const [paymentMessage, setPaymentMessage] = useState('');
  const [mpesaReceipt, setMpesaReceipt] = useState('');

  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle GPS location pin
  const handlePinLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('GPS not supported by browser.');
      return;
    }
    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
        };
        setGpsLocation(coords);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setGpsError('Could not get GPS. Please type location.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSendCartOrder = () => {
    // Save details to context
    setDeliveryDetails((prev) => ({
      ...prev,
      customerType: orderType === 'b2b' ? 'b2b' : 'retail',
      fullName: customerName,
      businessName: outletName,
      phone,
    }));

    const url = generateWhatsAppUrl({
      phoneKey: selectedBranch,
      orderType,
      items: cart,
      subtotal,
      deliveryFee,
      grandTotal,
      customerName: customerName.trim(),
      outletName: outletName.trim(),
      phone: phone.trim(),
      deliveryLocation: deliveryLocation.trim(),
      gpsLocation,
      paymentMethod: paymentMessage || mpesaReceipt ? 'mpesa_attached' : 'unpaid',
      paymentMessage: paymentMessage.trim(),
      mpesaReceipt: mpesaReceipt.trim().toUpperCase(),
      messageType: 'cart_order',
    });
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleQuickInquiry = (type: 'price_list' | 'bulk_order' | 'inquiry') => {
    const url = generateWhatsAppUrl({
      phoneKey: selectedBranch,
      orderType,
      customerName: customerName.trim(),
      outletName: outletName.trim(),
      phone: phone.trim(),
      deliveryLocation: deliveryLocation.trim(),
      gpsLocation,
      paymentMessage: paymentMessage.trim(),
      messageType: type,
    });
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <div
      ref={popoverRef}
      className="fixed bottom-6 right-4 sm:right-6 z-40 select-none flex flex-col items-end"
    >
      {/* 1. Interactive Animated Popover Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 16, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="absolute bottom-16 sm:bottom-18 right-0 w-[calc(100vw-2rem)] sm:w-[410px] bg-white rounded-3xl shadow-2xl border border-neutral-200/90 overflow-hidden flex flex-col z-50 text-neutral-800"
          >
            {/* Header with WhatsApp Emerald Palette & Modern Icon */}
            <div className="bg-gradient-to-r from-[#075E54] via-[#128C7E] to-[#25D366] text-white p-4 flex items-center justify-between relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />

              <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-inner border border-white/20">
                  <WhatsAppIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm tracking-wide">Cyden WhatsApp Desk</h3>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300" />
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-100 font-medium">
                    B2B & Personal Orders • Pin GPS • Payment Confirmation
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-black/15 hover:bg-black/30 text-white flex items-center justify-center transition-colors cursor-pointer relative z-10"
                aria-label="Close WhatsApp Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 space-y-3.5 max-h-[78vh] overflow-y-auto">
              {/* Branch Hotline Switcher */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Dispatch Branch:
                  </label>
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    EABL North Rift Depot
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedBranch('eldoret')}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer text-xs ${
                      selectedBranch === 'eldoret'
                        ? 'border-[#128C7E] bg-emerald-50 text-[#075E54] font-bold shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50/70 text-neutral-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#128C7E]" />
                      <span className="font-bold text-[11px]">Eldoret Central</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 font-mono mt-0.5 font-semibold">
                      {WHATSAPP_NUMBERS.eldoret.display}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedBranch('iten')}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer text-xs ${
                      selectedBranch === 'iten'
                        ? 'border-[#128C7E] bg-emerald-50 text-[#075E54] font-bold shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50/70 text-neutral-600'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#3AA88C]" />
                      <span className="font-bold text-[11px]">Iten Sub-Store</span>
                    </div>
                    <p className="text-[10px] text-neutral-500 font-mono mt-0.5 font-semibold">
                      {WHATSAPP_NUMBERS.iten.display}
                    </p>
                  </button>
                </div>
              </div>

              {/* B2B vs PERSONAL TOGGLE */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                  Ordering For:
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setOrderType('b2b')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      orderType === 'b2b'
                        ? 'bg-[#128C7E] text-white shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>🏢 B2B Commercial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType('personal')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      orderType === 'personal'
                        ? 'bg-[#128C7E] text-white shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>👤 Personal / Home</span>
                  </button>
                </div>
              </div>

              {/* DYNAMIC FIELDS: Outlet or Customer */}
              <div className="space-y-1.5">
                {orderType === 'b2b' ? (
                  <>
                    <input
                      type="text"
                      placeholder="Outlet / Bar Name (e.g. Highlands Lounge)"
                      value={outletName}
                      onChange={(e) => setOutletName(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#128C7E]"
                    />
                    <input
                      type="text"
                      placeholder="Contact Person (e.g. Kiprop / Manager)"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#128C7E]"
                    />
                  </>
                ) : (
                  <input
                    type="text"
                    placeholder="Your Full Name (e.g. Joy Chebet)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#128C7E]"
                  />
                )}
                <input
                  type="tel"
                  placeholder="WhatsApp Phone (e.g. 0722 000 000)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#128C7E]"
                />
              </div>

              {/* PIN DELIVERY LOCATION & GPS */}
              <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#E8582F]" />
                    Delivery Destination:
                  </span>
                  <button
                    type="button"
                    onClick={handlePinLocation}
                    disabled={isLocating}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer transition-colors ${
                      gpsLocation
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-[#128C7E] hover:bg-[#075E54] text-white'
                    }`}
                  >
                    <Navigation className={`w-2.5 h-2.5 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? 'Pinning...' : gpsLocation ? '📍 GPS Pinned' : '📍 Pin GPS'}</span>
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Delivery Town / Estate / Street (e.g. Pioneer, Gate 4)"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#128C7E]"
                />

                {gpsLocation && (
                  <p className="text-[10px] text-emerald-700 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Pinned: {gpsLocation.lat.toFixed(4)}°, {gpsLocation.lng.toFixed(4)}° (±{gpsLocation.accuracy}m)</span>
                  </p>
                )}
                {gpsError && <p className="text-[10px] text-amber-700">{gpsError}</p>}
              </div>

              {/* ATTACH PAYMENT MESSAGE / M-PESA SMS */}
              <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-[#3AA88C]" />
                    Attach Payment Message (Optional):
                  </span>
                  <span className="text-[9px] font-bold font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                    Till: 882201
                  </span>
                </div>

                <textarea
                  rows={2}
                  placeholder="Paste M-Pesa SMS confirmation or enter code (e.g. QK84M19XYZ Confirmed. Ksh 12,400 paid to CYDEN...)"
                  value={paymentMessage}
                  onChange={(e) => setPaymentMessage(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#128C7E]"
                />
              </div>

              {/* CART STATE: Submit Selected Items via WhatsApp */}
              {totalItems > 0 ? (
                <div className="p-3 rounded-2xl bg-gradient-to-b from-emerald-50 to-white border border-emerald-300/80 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-emerald-950">
                        {totalItems} items in cart
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-[#075E54]">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>

                  <div className="space-y-1 text-[10px] text-neutral-600 max-h-24 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex justify-between items-center py-0.2">
                        <span className="truncate pr-2 font-medium">
                          {item.quantity}× {item.product.name}
                        </span>
                        <span className="font-mono text-neutral-600 font-bold flex-shrink-0">
                          {formatCurrency(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Submit to WhatsApp Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendCartOrder}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#25D366] to-[#20BD5A] hover:from-[#20BD5A] hover:to-[#1DA850] text-white font-extrabold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-white" />
                    <span>Send Order to WhatsApp</span>
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      openWhatsAppOrder(orderType);
                    }}
                    className="w-full text-center text-[10px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center justify-center gap-1 cursor-pointer pt-0.5"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>Open Full Order Customizer Modal</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickInquiry('inquiry')}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#25D366] to-[#20BD5A] hover:from-[#20BD5A] hover:to-[#1DA850] text-white font-extrabold text-xs tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-white" />
                    <span>Send WhatsApp Inquiry with Location</span>
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      openWhatsAppOrder(orderType);
                    }}
                    className="w-full text-center text-[10px] text-[#128C7E] hover:text-[#075E54] font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>Open Full WhatsApp Order Builder</span>
                  </button>
                </div>
              )}

              {/* Quick Inquiry Actions */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                  Quick Actions:
                </span>

                <button
                  type="button"
                  onClick={() => handleQuickInquiry('price_list')}
                  className="w-full p-2 rounded-xl border border-neutral-200 hover:border-[#128C7E] bg-white hover:bg-emerald-50/40 text-left transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-xs text-neutral-700">
                    <div className="w-5 h-5 rounded-md bg-emerald-100 text-[#075E54] flex items-center justify-center">
                      <FileText className="w-3 h-3" />
                    </div>
                    <span className="font-semibold text-[11px]">Request Wholesale Price List</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-neutral-400 group-hover:text-[#128C7E]" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickInquiry('bulk_order')}
                  className="w-full p-2 rounded-xl border border-neutral-200 hover:border-[#128C7E] bg-white hover:bg-emerald-50/40 text-left transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-xs text-neutral-700">
                    <div className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center">
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <span className="font-semibold text-[11px]">Bar & Commercial Stocking Inquiry</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-neutral-400 group-hover:text-[#128C7E]" />
                </button>
              </div>

              {/* Hours / Trust footer */}
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-neutral-400" />
                  Open Everyday to 8:30 PM
                </span>
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  Avg reply &lt; 5 mins
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Floating Animated Trigger Button (Right Aligned) */}
      <div className="relative">
        <motion.span
          animate={{ scale: [1, 1.35, 1.6], opacity: [0.6, 0.25, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
          className="absolute inset-0 rounded-full bg-[#25D366] pointer-events-none"
        />
        <motion.span
          animate={{ scale: [1, 1.2, 1.4], opacity: [0.4, 0.15, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.8, ease: 'easeOut' }}
          className="absolute inset-0 rounded-full bg-[#25D366] pointer-events-none"
        />

        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.button
            id="floating-whatsapp-trigger"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsOpen(!isOpen)}
            className="relative flex items-center gap-2.5 pl-3.5 pr-4 py-3 rounded-full bg-gradient-to-r from-[#25D366] to-[#20BD5A] hover:from-[#20BD5A] hover:to-[#1DA850] text-white shadow-xl hover:shadow-2xl hover:shadow-emerald-500/30 border-2 border-white cursor-pointer transition-all group"
            aria-label="Open WhatsApp Order Desk"
          >
            <div className="relative flex items-center justify-center">
              <WhatsAppIcon className="w-6 h-6 text-white group-hover:rotate-6 transition-transform" />

              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs"
                >
                  {totalItems}
                </motion.span>
              )}
            </div>

            <div className="text-left leading-tight hidden xs:block sm:block">
              <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-950/80">
                {totalItems > 0 ? 'Send Order' : 'Order On'}
              </div>
              <div className="text-xs font-black text-white flex items-center gap-1">
                <span>WhatsApp</span>
                {totalItems > 0 && (
                  <span className="text-[10px] font-bold text-emerald-100 bg-black/20 px-1.5 py-0.2 rounded-full">
                    {totalItems}
                  </span>
                )}
              </div>
            </div>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
