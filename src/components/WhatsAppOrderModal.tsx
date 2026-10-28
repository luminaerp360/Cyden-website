import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  MapPin,
  Navigation,
  CheckCircle2,
  Building2,
  User,
  Phone,
  CreditCard,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  ShoppingBag,
  Store,
  Compass,
} from 'lucide-react';
import { useCart, POPULAR_DELIVERY_AREAS } from '../context/CartContext';
import { formatCurrency } from '../services/products';
import { WHATSAPP_NUMBERS, generateWhatsAppUrl, OrderAudience } from '../utils/whatsapp';
import WhatsAppIcon from './WhatsAppIcon';

export default function WhatsAppOrderModal() {
  const {
    cart,
    subtotal,
    deliveryFee,
    grandTotal,
    totalItems,
    isWhatsAppModalOpen,
    setIsWhatsAppModalOpen,
    deliveryDetails,
    setDeliveryDetails,
  } = useCart();

  // Selected Branch
  const [selectedBranch, setSelectedBranch] = useState<'eldoret' | 'iten'>('eldoret');

  // Order Audience: 'b2b' vs 'personal'
  const [orderType, setOrderType] = useState<OrderAudience>(
    deliveryDetails.customerType === 'b2b' ? 'b2b' : 'personal'
  );

  // Form Fields
  const [customerName, setCustomerName] = useState(deliveryDetails.fullName || '');
  const [outletName, setOutletName] = useState(deliveryDetails.businessName || '');
  const [outletType, setOutletType] = useState('Bar / Lounge');
  const [phone, setPhone] = useState(deliveryDetails.phone || '');
  const [townArea, setTownArea] = useState(deliveryDetails.townArea || 'Eldoret CBD / Town Centre');
  const [customArea, setCustomArea] = useState('');
  const [landmarkAddress, setLandmarkAddress] = useState(deliveryDetails.streetAddress || '');
  const [orderNotes, setOrderNotes] = useState(deliveryDetails.deliveryNotes || '');

  // Pinned GPS Geolocation state
  const [isLocating, setIsLocating] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
  } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Attached Payment Message State
  const [paymentOption, setPaymentOption] = useState<'mpesa_attached' | 'pay_on_delivery' | 'pending'>(
    'mpesa_attached'
  );
  const [mpesaReceiptCode, setMpesaReceiptCode] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Keep state synced with context
  useEffect(() => {
    if (deliveryDetails.fullName && !customerName) setCustomerName(deliveryDetails.fullName);
    if (deliveryDetails.businessName && !outletName) setOutletName(deliveryDetails.businessName);
    if (deliveryDetails.phone && !phone) setPhone(deliveryDetails.phone);
    if (deliveryDetails.townArea && !townArea) setTownArea(deliveryDetails.townArea);
  }, [deliveryDetails]);

  if (!isWhatsAppModalOpen) return null;

  // Handle GPS Pinning
  const handlePinLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser or device.');
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
        };
        setGpsLocation(coords);
        setIsLocating(false);

        // Pre-fill landmark if empty with GPS notation
        if (!landmarkAddress) {
          setLandmarkAddress(`Pinned GPS (±${coords.accuracy}m)`);
        }
      },
      (error) => {
        setIsLocating(false);
        console.warn('Geolocation error:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsError('Location permission was declined. You can type your location/estate manually below.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsError('GPS signal temporarily unavailable. Please type your landmark/estate.');
            break;
          case error.TIMEOUT:
            setGpsError('Location request timed out. Please try again or type manually.');
            break;
          default:
            setGpsError('Unable to pin location. Please type your delivery estate/landmark.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  const effectiveDeliveryLocation = [
    townArea === 'Other (North Rift)' ? customArea : townArea,
    landmarkAddress ? `Landmark: ${landmarkAddress}` : '',
  ]
    .filter(Boolean)
    .join(' — ');

  const googleMapsUrl = gpsLocation
    ? `https://maps.google.com/?q=${gpsLocation.lat},${gpsLocation.lng}`
    : '';

  // Generate the formatted WhatsApp link
  const getWhatsAppUrl = () => {
    return generateWhatsAppUrl({
      phoneKey: selectedBranch,
      orderType,
      items: cart,
      subtotal,
      deliveryFee,
      grandTotal,
      customerName: customerName.trim(),
      outletName: outletName.trim(),
      outletType: orderType === 'b2b' ? outletType : undefined,
      phone: phone.trim(),
      deliveryLocation: effectiveDeliveryLocation,
      gpsLocation,
      googleMapsUrl,
      paymentMethod: paymentOption,
      paymentMessage: paymentMessage.trim(),
      mpesaReceipt: mpesaReceiptCode.trim().toUpperCase(),
      notes: orderNotes.trim(),
      messageType: cart.length > 0 ? 'cart_order' : 'inquiry',
    });
  };

  const handleSendOrder = () => {
    // Save details to context for persistence
    setDeliveryDetails((prev) => ({
      ...prev,
      customerType: orderType === 'b2b' ? 'b2b' : 'retail',
      fullName: customerName,
      businessName: outletName,
      phone,
      townArea: townArea === 'Other (North Rift)' ? customArea : townArea,
      streetAddress: landmarkAddress,
      deliveryNotes: orderNotes,
    }));

    const url = getWhatsAppUrl();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyText = () => {
    const url = getWhatsAppUrl();
    // Extract text query param
    try {
      const parsedUrl = new URL(url);
      const text = parsedUrl.searchParams.get('text') || '';
      navigator.clipboard.writeText(text);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header with WhatsApp Branding & Close */}
        <div className="bg-gradient-to-r from-[#075E54] via-[#128C7E] to-[#0A4D44] text-white p-4 sm:p-5 flex items-center justify-between relative overflow-hidden flex-shrink-0">
          <div className="absolute right-0 -top-6 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner flex-shrink-0">
              <WhatsAppIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                  Cyden WhatsApp Order Desk
                </h3>
                <span className="hidden xs:inline-flex items-center gap-1 bg-[#25D366] text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live Dispatch
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium">
                B2B & Personal Direct Orders • Pinned GPS • Attached Payment
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsWhatsAppModalOpen(false)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer relative z-10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* 1. ORDER AUDIENCE TOGGLE: B2B COMMERCIAL VS PERSONAL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                1. Select Order Type:
              </label>
              <span className="text-[11px] text-neutral-500 font-medium">
                {orderType === 'b2b' ? 'Outlet / Commercial' : 'Home / Personal Delivery'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* B2B Commercial Button */}
              <button
                type="button"
                onClick={() => setOrderType('b2b')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  orderType === 'b2b'
                    ? 'border-[#128C7E] bg-emerald-50/80 text-[#075E54] ring-2 ring-[#128C7E]/20 shadow-xs'
                    : 'border-neutral-200 bg-neutral-50/60 hover:bg-neutral-100 text-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      orderType === 'b2b' ? 'bg-[#128C7E] text-white' : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs block">🏢 B2B Commercial</span>
                    <span className="text-[10px] opacity-80 block">Bar, Liquor Store, Hotel, Club</span>
                  </div>
                </div>
              </button>

              {/* Personal / Individual Button */}
              <button
                type="button"
                onClick={() => setOrderType('personal')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  orderType === 'personal'
                    ? 'border-[#128C7E] bg-emerald-50/80 text-[#075E54] ring-2 ring-[#128C7E]/20 shadow-xs'
                    : 'border-neutral-200 bg-neutral-50/60 hover:bg-neutral-100 text-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      orderType === 'personal' ? 'bg-[#128C7E] text-white' : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs block">👤 Personal / Home</span>
                    <span className="text-[10px] opacity-80 block">Party, Resident, Private Consumption</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 2. RECIPIENT INFORMATION (DYNAMIC BASED ON B2B / PERSONAL) */}
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 block">
              2. {orderType === 'b2b' ? 'Business & Contact Person' : 'Customer Contact Details'}
            </span>

            {orderType === 'b2b' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                    Outlet / Business Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Store className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Highlands Lounge & Grill"
                      value={outletName}
                      onChange={(e) => setOutletName(e.target.value)}
                      className="w-full text-xs pl-8 pr-2.5 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#128C7E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                    Outlet Category
                  </label>
                  <select
                    value={outletType}
                    onChange={(e) => setOutletType(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#128C7E]"
                  >
                    <option value="Bar / Lounge">Bar / Lounge</option>
                    <option value="Wines & Spirits Retailer">Wines & Spirits Retailer</option>
                    <option value="Hotel / Restaurant">Hotel / Restaurant</option>
                    <option value="Nightclub / Entertainment">Nightclub / Entertainment</option>
                    <option value="Event / Wedding Organizer">Event / Wedding Organizer</option>
                    <option value="Supermarket / General Store">Supermarket / General Store</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                    Contact Person Name
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Kiprop (Manager / Owner)"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs pl-8 pr-2.5 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#128C7E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                    WhatsApp Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="e.g. 0722 000 000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs pl-8 pr-2.5 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#128C7E]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Joy Chebet"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs pl-8 pr-2.5 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#128C7E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                    WhatsApp Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="e.g. 0722 000 000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs pl-8 pr-2.5 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#128C7E]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. PIN DELIVERY LOCATION & GPS INTEGRATION */}
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E8582F]" />
                3. Pin Delivery Location & Area
              </span>
              <span className="text-[10px] text-neutral-500 font-semibold">
                Van & Boda Express
              </span>
            </div>

            {/* GPS PINNING ACTION CARD */}
            <div className="p-3 rounded-xl bg-white border border-emerald-300/80 shadow-2xs space-y-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-[#128C7E]" />
                    Pin Exact GPS Coordinates
                  </span>
                  <p className="text-[11px] text-neutral-500">
                    Pins your current physical location for dispatch van GPS navigation
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handlePinLocation}
                  disabled={isLocating}
                  className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all flex-shrink-0 ${
                    gpsLocation
                      ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                      : 'bg-[#128C7E] hover:bg-[#075E54] text-white shadow-xs'
                  }`}
                >
                  <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>
                    {isLocating
                      ? 'Acquiring GPS...'
                      : gpsLocation
                      ? 'Re-Pin GPS'
                      : 'Pin My Location'}
                  </span>
                </motion.button>
              </div>

              {/* Live GPS Pinned Banner */}
              {gpsLocation && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-900">
                        GPS Location Pinned!
                      </span>
                      <span className="text-emerald-700 ml-1 font-mono text-[11px]">
                        ({gpsLocation.lat.toFixed(4)}°, {gpsLocation.lng.toFixed(4)}° • ±{gpsLocation.accuracy}m)
                      </span>
                    </div>
                  </div>

                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#128C7E] hover:underline font-bold flex items-center gap-1 flex-shrink-0"
                  >
                    <span>Preview Map</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {gpsError && (
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
                  <span>{gpsError}</span>
                </div>
              )}
            </div>

            {/* Area & Landmark Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                  Eldoret / Iten Delivery Area <span className="text-red-500">*</span>
                </label>
                <select
                  value={townArea}
                  onChange={(e) => setTownArea(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#128C7E]"
                >
                  {POPULAR_DELIVERY_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                  <option value="Other (North Rift)">Other Area (Specify below)</option>
                </select>
              </div>

              {townArea === 'Other (North Rift)' ? (
                <div>
                  <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                    Specific Town / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Turbo / Moiben / Eldama Ravine"
                    value={customArea}
                    onChange={(e) => setCustomArea(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#128C7E]"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                    Estate / Street / Landmark / Gate <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Boma Inn, Black Gate #4, Off Nandi Rd"
                    value={landmarkAddress}
                    onChange={(e) => setLandmarkAddress(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#128C7E]"
                  />
                </div>
              )}
            </div>

            {townArea === 'Other (North Rift)' && (
              <div>
                <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                  Estate / Street / Landmark / Gate <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Boma Inn, Black Gate #4, Off Nandi Rd"
                  value={landmarkAddress}
                  onChange={(e) => setLandmarkAddress(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#128C7E]"
                />
              </div>
            )}
          </div>

          {/* 4. ATTACH PAYMENT MESSAGE / M-PESA CONFIRMATION */}
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#3AA88C]" />
                4. Attach Payment Confirmation
              </span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                Till: 882201
              </span>
            </div>

            {/* Official Cyden Buy Goods Info Banner */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-900 to-[#075E54] text-white text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-medium text-emerald-200 text-[11px]">
                  Official EABL Safaricom M-Pesa Buy Goods:
                </span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">
                  Cyden Distributors Ltd
                </span>
              </div>
              <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg border border-white/10">
                <span className="text-emerald-100 font-semibold text-[11px]">
                  Lipa na M-Pesa Till Number:
                </span>
                <span className="text-base sm:text-lg font-black font-mono tracking-widest text-[#F2A93B]">
                  882201
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentOption('mpesa_attached')}
                className={`p-2 rounded-lg border text-center text-xs font-bold transition-all cursor-pointer ${
                  paymentOption === 'mpesa_attached'
                    ? 'border-[#128C7E] bg-emerald-50 text-[#075E54]'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Attach M-Pesa SMS
              </button>

              <button
                type="button"
                onClick={() => setPaymentOption('pay_on_delivery')}
                className={`p-2 rounded-lg border text-center text-xs font-bold transition-all cursor-pointer ${
                  paymentOption === 'pay_on_delivery'
                    ? 'border-[#128C7E] bg-emerald-50 text-[#075E54]'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Pay on Delivery
              </button>

              <button
                type="button"
                onClick={() => setPaymentOption('pending')}
                className={`p-2 rounded-lg border text-center text-xs font-bold transition-all cursor-pointer ${
                  paymentOption === 'pending'
                    ? 'border-[#128C7E] bg-emerald-50 text-[#075E54]'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Inquire / Confirm First
              </button>
            </div>

            {/* Input field when 'mpesa_attached' */}
            {paymentOption === 'mpesa_attached' && (
              <div className="space-y-2 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                    M-Pesa Transaction Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. QK84M19XYZ"
                    value={mpesaReceiptCode}
                    onChange={(e) => setMpesaReceiptCode(e.target.value.toUpperCase())}
                    className="w-full text-xs font-mono font-bold uppercase px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#128C7E]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                    Paste Full M-Pesa SMS Confirmation Message
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Paste the received M-Pesa confirmation SMS here (e.g. QK84M19XYZ Confirmed. Ksh 12,400 paid to CYDEN DISTRIBUTORS LTD on 21/09/2026 at...)"
                    value={paymentMessage}
                    onChange={(e) => setPaymentMessage(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#128C7E] leading-relaxed"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Our accounts & dispatch desk will verify the attached message instantly before release.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 5. SELECT DISPATCH DEPOT */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-600 block">
              5. Cyden Dispatch Depot:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedBranch('eldoret')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedBranch === 'eldoret'
                    ? 'border-[#128C7E] bg-emerald-50 text-[#075E54] font-bold shadow-xs'
                    : 'border-neutral-200 bg-white text-neutral-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#128C7E]" />
                  <span>Eldoret Central</span>
                </div>
                <span className="text-[11px] text-neutral-500 block font-mono mt-0.5">
                  {WHATSAPP_NUMBERS.eldoret.display}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedBranch('iten')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedBranch === 'iten'
                    ? 'border-[#128C7E] bg-emerald-50 text-[#075E54] font-bold shadow-xs'
                    : 'border-neutral-200 bg-white text-neutral-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#3AA88C]" />
                  <span>Iten Sub-Store</span>
                </div>
                <span className="text-[11px] text-neutral-500 block font-mono mt-0.5">
                  {WHATSAPP_NUMBERS.iten.display}
                </span>
              </button>
            </div>
          </div>

          {/* 6. ORDER SUMMARY PREVIEW */}
          {cart.length > 0 ? (
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-neutral-800">
                <span>Selected Items ({totalItems} units)</span>
                <span className="text-[#075E54] font-extrabold text-sm">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1 text-[11px] text-neutral-600 border-t border-neutral-200 pt-1.5 pr-1">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center py-0.5">
                    <span className="truncate pr-2 font-medium">
                      {item.quantity}× {item.product.name}
                    </span>
                    <span className="font-mono text-neutral-700 font-bold flex-shrink-0">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">
                Drinks or Products to Inquire/Order
              </label>
              <textarea
                rows={2}
                placeholder="e.g. 5 crates Tusker Lager, 2 bottles Johnnie Walker Black Label..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#128C7E]"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-neutral-50 border-t border-neutral-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Copy the order message to clipboard"
            >
              {copiedNotification ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Message Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Copy Message</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsWhatsAppModalOpen(false)}
              className="px-3 py-2 rounded-xl text-neutral-500 hover:text-neutral-800 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleSendOrder}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#25D366] to-[#20BD5A] hover:from-[#20BD5A] hover:to-[#1DA850] text-white font-extrabold text-xs sm:text-sm tracking-wide transition-all shadow-md hover:shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 text-white" />
            <span>Send Order via WhatsApp</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
