import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  Building2,
  Navigation,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Clock,
  ExternalLink,
  Printer,
  Sparkles,
  AlertCircle,
  Plus,
  Minus,
  Trash2,
  Truck,
  FileText,
  MessageCircle,
  Loader2,
  RefreshCw,
  Banknote,
} from 'lucide-react';
import { useCart, POPULAR_DELIVERY_AREAS } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../services/products';
import { generateWhatsAppUrl } from '../utils/whatsapp';
import WhatsAppIcon from './WhatsAppIcon';
import {
  formatKenyanPhone,
  initiateMpesaStkPush,
  verifyMpesaTransaction,
  generateMpesaReceiptCode,
} from '../services/mpesa';
import {
  initiateStkPush as initiateLiveStkPush,
  pollMpesaPayment,
  checkMpesaTransaction,
  findMpesaTransaction,
  normalizeMpesaPhone,
} from '../services/mpesaService';
import { createOrder } from '../services/ordersService';
import { saveOrderToStore } from '../services/orderStore';
import { resolveBackendProductId } from '../services/productsService';
import { Order, OrderItem, CustomerType, DeliveryMethod, MpesaStatus, CustomerAddress } from '../types';
import { DeliveryAddressSelector } from './DeliveryAddressSelector';

interface CheckoutModalProps {
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
}

export default function CheckoutModal({ onOpenAuth }: CheckoutModalProps = {}) {
  const { user, getToken } = useAuth();
  const {
    cart,
    isCheckoutOpen,
    setIsCheckoutOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    deliveryDistanceKm,
    deliveryExplanation,
    isFreeDelivery,
    grandTotal,
    totalItems,
    deliveryDetails,
    setDeliveryDetails,
    saveCompletedOrder,
  } = useCart();

  // Wizard Steps: 1: Review & Type, 2: Location & Contact, 3: Lipa na M-Pesa STK, 4: Receipt
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Individual customer checkout only
  const customerType: CustomerType = 'retail';

  // Sync deliveryMethod and gpsLocation to CartContext for dynamic fee calculation
  useEffect(() => {
    setDeliveryDetails((prev) => ({
      ...prev,
      deliveryMethod,
      gpsCoordinates: gpsLocation || undefined,
    }));
  }, [deliveryMethod, gpsLocation, setDeliveryDetails]);

  // Pre-fill user profile if logged in
  useEffect(() => {
    if (user) {
      if (!fullName) {
        setFullName(user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim());
      }
      if (!phone && user.phoneNumber) {
        setPhone(user.phoneNumber);
      }
      if (!email && user.email) {
        setEmail(user.email);
      }
    }
  }, [user]);

  const [fullName, setFullName] = useState(deliveryDetails.fullName || '');
  const [phone, setPhone] = useState(deliveryDetails.phone || '');
  const [email, setEmail] = useState(deliveryDetails.email || '');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(deliveryDetails.deliveryMethod || 'delivery');
  const [county, setCounty] = useState(deliveryDetails.county || 'Uasin Gishu');
  const [townArea, setTownArea] = useState(deliveryDetails.townArea || 'Eldoret CBD / Town Centre');
  const [customArea, setCustomArea] = useState('');
  const [streetAddress, setStreetAddress] = useState(deliveryDetails.streetAddress || '');
  const [deliveryNotes, setDeliveryNotes] = useState(deliveryDetails.deliveryNotes || '');

  // GPS Geolocation state
  const [isLocating, setIsLocating] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  const handleSelectSavedAddress = (addr: CustomerAddress) => {
    setSelectedAddressId(addr._id || addr.id || '');
    if (addr.street) {
      setStreetAddress(addr.street);
    }
    if (addr.contactPhone && !phone) {
      setPhone(addr.contactPhone);
    }
    if (addr.lat && addr.lng) {
      setGpsLocation({ lat: addr.lat, lng: addr.lng });
    }
    if (addr.deliveryInstructions && !deliveryNotes) {
      setDeliveryNotes(addr.deliveryInstructions);
    }
  };

  // M-Pesa STK Push state
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [showEditMpesaPhone, setShowEditMpesaPhone] = useState(false);
  const [mpesaStatus, setMpesaStatus] = useState<MpesaStatus>('idle');
  const [stkCountdown, setStkCountdown] = useState(60);
  const [pollAttempt, setPollAttempt] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [mpesaReceipt, setMpesaReceipt] = useState('');
  const [stkError, setStkError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Sync phone with mpesaPhone automatically so customer only enters it once
  useEffect(() => {
    if (phone && (!mpesaPhone || !showEditMpesaPhone)) {
      setMpesaPhone(phone);
    }
  }, [phone, mpesaPhone, showEditMpesaPhone]);

  // Handle live countdown for STK Push prompt
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (mpesaStatus === 'pending_stk' && stkCountdown > 0) {
      timer = setInterval(() => {
        setStkCountdown((prev) => prev - 1);
      }, 1000);
    } else if (mpesaStatus === 'pending_stk' && stkCountdown === 0) {
      setMpesaStatus('timeout');
    }
    return () => clearInterval(timer);
  }, [mpesaStatus, stkCountdown]);

  if (!isCheckoutOpen) return null;

  // Handle GPS location click
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
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

        // Friendly description added to streetAddress if empty
        if (!streetAddress) {
          setStreetAddress(`GPS: ${coords.lat.toFixed(4)}° N, ${coords.lng.toFixed(4)}° E (±${coords.accuracy}m)`);
        }
      },
      (error) => {
        setIsLocating(false);
        setGpsError(error.message || 'Unable to retrieve location. Please type your address manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Step 2 Validation - Individual customer
  const canProceedToPayment = () => {
    if (!fullName.trim()) return false;
    const phoneValid = formatKenyanPhone(phone).valid;
    if (!phoneValid) return false;
    if (deliveryMethod === 'delivery') {
      const area = townArea === 'Other (Specify Below)' ? customArea : townArea;
      if (!area.trim() || !streetAddress.trim()) return false;
    }
    return true;
  };

  // Initiate Live STK Push and record order
  const handleInitiateStk = async () => {
    setStkError(null);
    const phoneValid = formatKenyanPhone(mpesaPhone || phone);
    if (!phoneValid.valid) {
      setStkError('Please enter a valid Safaricom phone number (e.g. 0722 000 000 or 0110 000 000)');
      return;
    }

    setMpesaStatus('initiating');
    setPollAttempt(0);
    const orderRef = `CYD-${Math.floor(100000 + Math.random() * 900000)}`;
    const token = getToken();

    const formattedShippingAddress = [
      fullName,
      email ? `email: ${email}` : '',
      `phone: ${phoneValid.formatted || phone}`,
      `delivery: ${deliveryMethod}`,
      deliveryMethod === 'delivery'
        ? `${townArea === 'Other (Specify Below)' ? customArea : townArea}, ${streetAddress}, ${county}`
        : 'Warehouse Self-Pickup (Rupa Godowns, Eldoret)',
      deliveryNotes ? `notes: ${deliveryNotes}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    // 1. Resolve product IDs to backend MongoDB ObjectIds
    let orderItems = [];
    try {
      orderItems = await Promise.all(
        cart.map(async (it) => ({
          productId: await resolveBackendProductId(it.product.id, it.product.name),
          quantity: it.quantity,
          price: it.product.price,
          notes: it.product.name,
        }))
      );
    } catch {
      orderItems = cart.map((it) => ({
        productId: it.product.id,
        quantity: it.quantity,
        price: it.product.price,
        notes: it.product.name,
      }));
    }

    // 2. Record the order on the e-commerce backend API (for both logged-in and guest users)
    try {
      await createOrder(
        {
          items: orderItems,
          shippingAddress: formattedShippingAddress,
          paymentMethod: 'mpesa',
        },
        token || undefined
      );
    } catch (orderErr) {
      console.warn('Backend order recording notice:', orderErr);
    }

    // 3. Initiate live M-Pesa STK push via backend API
    let checkoutId = '';
    try {
      const response = await initiateLiveStkPush(
        {
          phoneNumber: phoneValid.formatted,
          amount: Math.round(grandTotal),
          accountReference: orderRef,
          transactionDesc: `Order ${orderRef}`,
        },
        token
      );

      checkoutId =
        (response as any).checkoutRequestId ||
        response.checkoutRequestId ||
        response.CheckoutRequestID ||
        response.reference ||
        response.MerchantRequestID ||
        '';

      setCheckoutRequestId(checkoutId);
      setMpesaStatus('pending_stk');
      setStkCountdown(60);
    } catch (stkErr: any) {
      console.error('Live STK prompt dispatch error:', stkErr);
      setStkError(
        stkErr.message ||
        'Could not dispatch M-Pesa STK push. Please verify your phone number and try again.'
      );
      setMpesaStatus('failed');
      return;
    }

    // 4. Poll backend for transaction verification automatically
    pollMpesaPayment(phoneValid.formatted, Math.round(grandTotal), {
      attempts: 24,
      intervalMs: 2500,
      checkoutId: checkoutId || undefined,
      token,
      onAttempt: (attempt) => setPollAttempt(attempt),
    }).then((pollResult) => {
      if (pollResult && pollResult.success) {
        handleConfirmPayment(pollResult.receiptNumber || checkoutId);
      } else {
        setMpesaStatus('failed');
        setStkError(pollResult?.message || 'Payment request was cancelled or declined on your phone.');
      }
    });
  };

  // Manual verification if user entered PIN before auto-poll caught it
  const handleManualVerifyPayment = async () => {
    setIsVerifying(true);
    setStkError(null);
    const phoneValid = formatKenyanPhone(mpesaPhone || phone);
    const token = getToken();

    let verifiedReceipt = checkoutRequestId;

    try {
      if (checkoutRequestId) {
        const check = await checkMpesaTransaction(checkoutRequestId, token);
        const status = String((check as any).status || '').toLowerCase();
        const desc = String(
          (check as any).ResponseDescription ?? (check as any).ResultDesc ?? (check as any).message ?? ''
        );
        if (status === 'failed' || /cancel|fail|timeout|declined|reject/i.test(desc)) {
          setIsVerifying(false);
          setMpesaStatus('failed');
          setStkError(desc || 'Payment was cancelled or declined on your phone.');
          return;
        }
        const receipt =
          (check as any).receiptNumber ||
          (check as any).MpesaReceiptNumber ||
          (check as any).receipt;
        if (receipt) verifiedReceipt = receipt;
      }
    } catch {
      // ignore
    }

    if (!verifiedReceipt || verifiedReceipt === checkoutRequestId) {
      try {
        const found = await findMpesaTransaction(phoneValid.formatted, Math.round(grandTotal), token);
        if (found.success && found.transaction) {
          const receipt =
            (found.transaction as any).receiptNumber ||
            (found.transaction as any).MpesaReceiptNumber;
          if (receipt) verifiedReceipt = receipt;
        }
      } catch {
        // ignore
      }
    }

    setIsVerifying(false);
    await handleConfirmPayment(verifiedReceipt || undefined);
  };

  // Complete Order (Instant approval or manual verification)
  const handleConfirmPayment = async (receiptOverride?: string) => {
    setMpesaStatus('initiating');
    const phoneValid = formatKenyanPhone(mpesaPhone || phone);

    try {
      const generatedReceipt = receiptOverride || generateMpesaReceiptCode();
      setMpesaReceipt(generatedReceipt);
      setMpesaStatus('success');

      const shippingAddress =
        deliveryMethod === 'delivery'
          ? `${townArea === 'Other (Specify Below)' ? customArea : townArea}, ${streetAddress}, ${county}`
          : 'Warehouse Self-Pickup (Rupa Godowns, Eldoret)';

      // Create confirmed Order
      const newOrder: Order = {
        order_id: `CYD-${Math.floor(100000 + Math.random() * 900000)}`,
        source: 'web_cart',
        customer_type: 'retail',
        customer_name: fullName,
        customer_phone: phoneValid.display,
        delivery_location: shippingAddress,
        delivery_method: deliveryMethod,
        items: cart.map((item) => ({
          product_id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          size: item.product.size,
          image_url: item.product.image_url,
        })),
        subtotal,
        delivery_fee: deliveryFee,
        total: grandTotal,
        status: 'confirmed',
        payment_method: 'mpesa_stk',
        mpesa_receipt: generatedReceipt,
        created_at: new Date().toISOString(),
        notes: deliveryNotes,
        gps_coords: gpsLocation ? { lat: gpsLocation.lat, lng: gpsLocation.lng } : undefined,
      };

      const userId = user?._id || user?.id || null;
      saveOrderToStore(userId, newOrder);
      setCompletedOrder(newOrder);
      saveCompletedOrder(newOrder);

      // Save delivery details for future convenience
      setDeliveryDetails({
        customerType: 'retail',
        fullName,
        phone,
        email,
        deliveryMethod,
        county,
        townArea,
        streetAddress,
        deliveryNotes,
        gpsCoordinates: gpsLocation || undefined,
      });

      // Clear cart once order is fulfilled
      clearCart();
      setCurrentStep(4);
    } catch (err: any) {
      setMpesaStatus('failed');
      setStkError('M-Pesa payment verification failed. Please try again.');
    }
  };

  // Pay on Delivery (Cash / Till upon Delivery)
  const handlePayOnDelivery = async () => {
    const token = getToken();
    const orderRef = `CYD-${Math.floor(100000 + Math.random() * 900000)}`;
    const phoneValid = formatKenyanPhone(mpesaPhone || phone);
    const formattedShippingAddress = [
      fullName,
      email ? `email: ${email}` : '',
      `phone: ${phoneValid.formatted || phone}`,
      `delivery: ${deliveryMethod}`,
      deliveryMethod === 'delivery'
        ? `${townArea === 'Other (Specify Below)' ? customArea : townArea}, ${streetAddress}, ${county}`
        : 'Warehouse Self-Pickup (Rupa Godowns, Eldoret)',
      deliveryNotes ? `notes: ${deliveryNotes}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    let orderItems = [];
    try {
      orderItems = await Promise.all(
        cart.map(async (it) => ({
          productId: await resolveBackendProductId(it.product.id, it.product.name),
          quantity: it.quantity,
          price: it.product.price,
          notes: it.product.name,
        }))
      );
    } catch {
      orderItems = cart.map((it) => ({
        productId: it.product.id,
        quantity: it.quantity,
        price: it.product.price,
        notes: it.product.name,
      }));
    }

    try {
      await createOrder(
        {
          items: orderItems,
          shippingAddress: formattedShippingAddress,
          paymentMethod: 'cash',
        },
        token || undefined
      );
    } catch (err) {
      console.warn('Backend order recording notice:', err);
    }

    const newOrder: Order = {
      order_id: orderRef,
      source: 'web_cart',
      customer_type: 'retail',
      customer_name: fullName,
      customer_phone: phone,
      delivery_location: formattedShippingAddress,
      delivery_method: deliveryMethod,
      items: cart.map((item) => ({
        product_id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        size: item.product.size,
        image_url: item.product.image_url,
      })),
      subtotal,
      delivery_fee: deliveryFee,
      total: grandTotal,
      status: 'pending',
      payment_method: 'cash_on_delivery',
      created_at: new Date().toISOString(),
      notes: deliveryNotes,
      gps_coords: gpsLocation ? { lat: gpsLocation.lat, lng: gpsLocation.lng } : undefined,
    };

    const userId = user?._id || user?.id || null;
    saveOrderToStore(userId, newOrder);
    setCompletedOrder(newOrder);
    saveCompletedOrder(newOrder);
    clearCart();
    setCurrentStep(4);
  };

  const handleClose = () => {
    if (currentStep === 4) {
      clearCart();
    }
    setIsCheckoutOpen(false);
    setCurrentStep(1);
    setMpesaStatus('idle');
  };

  return (
    <div
      id="cyden-checkout-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className="relative w-full max-w-xl sm:max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto max-h-[94vh] sm:max-h-[90vh]"
      >
        {/* Sleek Modal Header */}
        <div className="bg-[#1B3E6F] text-white px-5 sm:px-7 pt-5 sm:pt-6 pb-4 sm:pb-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#3AA88C] flex-shrink-0">
                {currentStep === 3 ? (
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                ) : currentStep === 4 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ShoppingBag className="w-5 h-5" />
                )}
              </div>
              <div>
                <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-[#3AA88C] block">
                  Cyden Express Direct
                </span>
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  {currentStep === 1 && 'Review Your Order'}
                  {currentStep === 2 && 'Delivery & Contact Details'}
                  {currentStep === 3 && 'M-Pesa Payment'}
                  {currentStep === 4 && 'Order Confirmed'}
                </h2>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Progress */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
            {[
              { step: 1, label: 'Cart' },
              { step: 2, label: 'Delivery' },
              { step: 3, label: 'Payment' },
              { step: 4, label: 'Receipt' },
            ].map(({ step, label }, idx) => (
              <React.Fragment key={step}>
                <div
                  className={`flex items-center gap-1.5 font-bold transition-colors ${
                    currentStep === step
                      ? 'text-[#3AA88C]'
                      : currentStep > step
                      ? 'text-emerald-400'
                      : 'text-white/40'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      currentStep === step
                        ? 'bg-[#3AA88C] text-white shadow-xs'
                        : currentStep > step
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/15 text-white/60'
                    }`}
                  >
                    {currentStep > step ? '✓' : step}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {idx < 3 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 sm:mx-3 transition-colors ${
                      currentStep > step ? 'bg-emerald-500' : 'bg-white/15'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {/* ======================================================== */}
          {/* STEP 1: CART ITEMS & SUMMARY                             */}
          {/* ======================================================== */}
          {currentStep === 1 && (
            <div className="space-y-5">
              {cart.length === 0 ? (
                <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto" />
                  <div>
                    <p className="text-base font-bold text-slate-800">Your drink cart is empty</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Select your favorite beverages from our catalogue to have them delivered cold to your doorstep.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      window.history.pushState({}, '', '/catalogue');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3AA88C] hover:bg-[#2C856E] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Browse Drinks Catalogue</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart List */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                      <span className="font-bold uppercase tracking-wider">
                        Selected Items ({totalItems})
                      </span>
                      <span>Adjust quantities</span>
                    </div>

                    <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
                      {cart.map(({ product, quantity }) => (
                        <div key={product.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/60 p-1 flex items-center justify-center flex-shrink-0">
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
                                <ShoppingBag className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                {product.name}
                              </h4>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                <span>{product.brand}</span>
                                <span>•</span>
                                <span>{product.size}</span>
                                <span>•</span>
                                <span className="font-semibold text-slate-800">{formatCurrency(product.price)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 shadow-xs">
                              <button
                                type="button"
                                onClick={() => updateQuantity(product.id, quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:bg-slate-300 rounded-l-lg transition-colors cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-7 text-center text-xs font-bold text-slate-800 select-none">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(product.id, quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:bg-slate-300 rounded-r-lg transition-colors cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="text-xs sm:text-sm font-bold text-slate-900 min-w-[70px] text-right">
                              {formatCurrency(product.price * quantity)}
                            </span>

                            <button
                              type="button"
                              onClick={() => removeFromCart(product.id)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Clean Order Breakdown Card */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Subtotal ({totalItems} items)</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1">
                        Delivery Fee
                        {deliveryDistanceKm !== null && deliveryMethod === 'delivery' && (
                          <span className="text-[10px] text-slate-500 font-normal">
                            (~{deliveryDistanceKm} km)
                          </span>
                        )}
                      </span>
                      <span>
                        {deliveryMethod === 'pickup' ? (
                          <span className="text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded text-[11px]">
                            FREE (Depot Pickup)
                          </span>
                        ) : deliveryFee === 0 ? (
                          <span className="text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded text-[11px]">
                            FREE (Within 10 km • Order ≥ KES 1,500)
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-900">{formatCurrency(deliveryFee)}</span>
                        )}
                      </span>
                    </div>
                    {deliveryExplanation && (
                      <p className="text-[11px] text-slate-500 italic">
                        💡 {deliveryExplanation}
                      </p>
                    )}
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-black text-slate-900">
                      <span>Total Amount</span>
                      <span className="text-base font-black text-[#1B3E6F]">{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-center"
                    >
                      Continue Shopping
                    </button>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          const url = generateWhatsAppUrl({
                            phoneKey: 'eldoret',
                            items: cart,
                            subtotal,
                            deliveryFee,
                            grandTotal,
                            messageType: 'cart_order',
                          });
                          window.open(url, '_blank', 'noopener,noreferrer');
                        }}
                        className="px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Order directly via WhatsApp"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Order via WhatsApp</span>
                      </button>

                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="px-6 py-3 rounded-xl bg-[#3AA88C] hover:bg-[#2C856E] text-white font-bold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Proceed to Delivery</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: DELIVERY & CONTACT DETAILS                       */}
          {/* ======================================================== */}
          {currentStep === 2 && (
            <div className="space-y-5">
              {/* Delivery Method Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  How would you like to receive your order?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('delivery')}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      deliveryMethod === 'delivery'
                        ? 'bg-[#1B3E6F] text-white border-[#1B3E6F] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>Door Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      deliveryMethod === 'pickup'
                        ? 'bg-[#1B3E6F] text-white border-[#1B3E6F] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Depot Pickup (Free)</span>
                  </button>
                </div>
              </div>

              {/* Cyden Delivery Policy Explainer Banner */}
              {deliveryMethod === 'delivery' && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 text-xs text-teal-900 flex items-start gap-2.5">
                  <Truck className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-0.5 text-xs">
                    <p className="font-bold text-teal-950">
                      Cyden Dispatch Policy (Rupa Godowns, Eldoret):
                    </p>
                    <p className="text-[11px] text-teal-800 leading-relaxed">
                      • Orders <strong>≥ KSh 1,500</strong> within <strong>10 km</strong> from depot: <strong class="text-emerald-800 uppercase">100% Free Delivery</strong>.
                      <br />
                      • Orders &lt; KSh 1,500 within 10 km: Standard base fee of <strong>KSh 150</strong>.
                      <br />
                      • Beyond 10 km: Free/Base rate + <strong>KSh 30 per extra km</strong>.
                      <br />
                      {deliveryDistanceKm !== null ? (
                        <span className="font-semibold text-emerald-900 bg-emerald-100 px-1.5 py-0.5 rounded inline-block mt-1">
                          📍 Pinned Distance: {deliveryDistanceKm} km ({deliveryExplanation})
                        </span>
                      ) : (
                        <span className="italic text-teal-700">
                          Select a saved address or pin on the map below for exact distance calculation.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Customer Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Kamau"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Safaricom M-Pesa Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="07XX XXX XXX or 01XX XXX XXX"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPhone(val);
                        if (!showEditMpesaPhone) {
                          setMpesaPhone(val);
                        }
                      }}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Used for delivery coordination and your M-Pesa payment prompt.
                  </p>
                </div>
              </div>

              {/* Location Details (for Door Delivery) */}
              {deliveryMethod === 'delivery' ? (
                <div className="space-y-3.5 pt-2 border-t border-slate-100">
                  {/* Saved Delivery Locations with Interactive Map Pinning */}
                  <DeliveryAddressSelector
                    selectedAddressId={selectedAddressId}
                    onSelectAddress={handleSelectSavedAddress}
                  />

                  <div className="flex items-center justify-between pt-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#E8582F]" />
                      <span>Delivery Location Details</span>
                    </label>

                    {/* Geolocation Button */}
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={isLocating}
                      className="text-[11px] font-bold text-[#3AA88C] hover:text-[#2C856E] flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                    >
                      <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                      <span>{isLocating ? 'Locating...' : 'Use My GPS Location'}</span>
                    </button>
                  </div>

                  {gpsLocation && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>GPS Tagged: {gpsLocation.lat.toFixed(4)}°, {gpsLocation.lng.toFixed(4)}° (±{gpsLocation.accuracy}m)</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                  )}

                  {gpsError && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      {gpsError}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        County
                      </label>
                      <select
                        value={county}
                        onChange={(e) => setCounty(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
                      >
                        <option value="Uasin Gishu">Uasin Gishu (Eldoret)</option>
                        <option value="Elgeyo Marakwet">Elgeyo Marakwet (Iten / Tambach)</option>
                        <option value="Nandi">Nandi County (Kapsabet)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Town / Area <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={townArea}
                        onChange={(e) => setTownArea(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
                      >
                        {POPULAR_DELIVERY_AREAS.map((area) => (
                          <option key={area} value={area}>
                            {area}
                          </option>
                        ))}
                        <option value="Other (Specify Below)">Other Area (Specify Below)</option>
                      </select>
                    </div>
                  </div>

                  {townArea === 'Other (Specify Below)' && (
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Specify Your Area Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Turbo, Moiben, Sergoit"
                        value={customArea}
                        onChange={(e) => setCustomArea(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Street, Building, Apartment or Landmark <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Near Rupa Mall, Gate 3, House #12 or Uganda Road next to Kobil"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Special Delivery Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Deliver extra chilled; call upon arrival at the gate"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl text-xs space-y-2 text-sky-950">
                  <span className="font-bold block text-sm">Designated Depot Collection Points:</span>
                  <div className="space-y-1.5 text-xs text-sky-900">
                    <p>• <strong>Eldoret Central Depot:</strong> Rupa Godowns, Eldoret-Malaba Road (Opposite Rupa Mills).</p>
                    <p>• <strong>Iten Sub-Store:</strong> Sitet Building, Iten-Kabarnet Road.</p>
                  </div>
                  <p className="text-[11px] text-sky-700 pt-1">
                    Your drinks will be packed and chilled ready for pickup immediately upon order confirmation.
                  </p>
                </div>
              )}

              {/* Step 2 Live Order Breakdown */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    Delivery Fee
                    {deliveryDistanceKm !== null && deliveryMethod === 'delivery' && (
                      <span className="text-[10px] text-slate-500 font-normal">
                        (~{deliveryDistanceKm} km from Depot)
                      </span>
                    )}
                  </span>
                  <span>
                    {deliveryMethod === 'pickup' ? (
                      <span className="text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded text-[11px]">
                        FREE (Depot Pickup)
                      </span>
                    ) : deliveryFee === 0 ? (
                      <span className="text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded text-[11px]">
                        FREE
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-900">{formatCurrency(deliveryFee)}</span>
                    )}
                  </span>
                </div>
                {deliveryExplanation && (
                  <p className="text-[11px] text-slate-500 italic pt-0.5">
                    💡 {deliveryExplanation}
                  </p>
                )}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-black text-slate-900">
                  <span>Total Payable</span>
                  <span className="text-base font-black text-[#1B3E6F]">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Cart</span>
                </button>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="button"
                  disabled={!canProceedToPayment()}
                  onClick={() => {
                    if (!mpesaPhone) setMpesaPhone(phone);
                    setCurrentStep(3);
                  }}
                  className="px-6 py-3 rounded-xl bg-[#3AA88C] hover:bg-[#2C856E] text-white font-bold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: M-PESA PAYMENT & CASH ON DELIVERY               */}
          {/* ======================================================== */}
          {currentStep === 3 && (
            <div className="space-y-5">
              {/* Payment Summary Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-white text-emerald-700 font-black px-2 py-0.5 rounded text-xs tracking-tight shadow-xs">
                      M-PESA
                    </span>
                    <span className="font-bold text-xs text-white/90">LIPA NA M-PESA ONLINE</span>
                  </div>
                  <p className="text-xs text-white/80">Payee: CYDEN DISTRIBUTORS LTD</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-white/80 block">Total Due</span>
                  <span className="text-xl font-black text-white">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* STK Push Active Waiting View */}
              {mpesaStatus === 'pending_stk' ? (
                <div className="space-y-4">
                  <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-emerald-500/30 space-y-4">
                    {/* Status Pill */}
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>Prompt Sent to Your Phone</span>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 font-semibold">
                        {stkCountdown}s
                      </span>
                    </div>

                    {/* Instruction Headline */}
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        Enter Your M-Pesa PIN
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        A prompt has been sent to{' '}
                        <strong className="text-emerald-400 font-bold">
                          {formatKenyanPhone(mpesaPhone || phone).display}
                        </strong>
                        . Enter your M-Pesa PIN on your phone to complete your payment of{' '}
                        <strong className="text-white">{formatCurrency(grandTotal)}</strong>.
                      </p>
                    </div>

                    {/* 3 Step Instruction Guide */}
                    <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                        <span className="text-xs font-bold text-emerald-400 block mb-0.5">1</span>
                        <span className="text-[11px] font-semibold text-white block">Unlock</span>
                        <span className="text-[10px] text-slate-400">Wake screen</span>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                        <span className="text-xs font-bold text-emerald-400 block mb-0.5">2</span>
                        <span className="text-[11px] font-semibold text-white block">Enter PIN</span>
                        <span className="text-[10px] text-slate-400">Authorize</span>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                        <span className="text-xs font-bold text-emerald-400 block mb-0.5">3</span>
                        <span className="text-[11px] font-semibold text-white block">Confirmed</span>
                        <span className="text-[10px] text-slate-400">Instant</span>
                      </div>
                    </div>

                    {/* Polling bar */}
                    <div className="pt-1 space-y-1.5">
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <motion.div
                          className="bg-emerald-500 h-full rounded-full"
                          initial={{ width: '100%' }}
                          animate={{ width: `${(stkCountdown / 60) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />
                          Checking payment status...
                        </span>
                        <span className="font-mono text-emerald-300">
                          {checkoutRequestId ? checkoutRequestId.slice(-8) : 'Waiting'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {stkError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <span>{stkError}</span>
                    </div>
                  )}

                  {/* Waiting Actions */}
                  <div className="space-y-2 pt-1">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      disabled={isVerifying}
                      onClick={handleManualVerifyPayment}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-75"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Checking with Safaricom...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>✓ I've Entered PIN — Verify & Confirm Order</span>
                        </>
                      )}
                    </motion.button>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={handleInitiateStk}
                        className="py-2.5 px-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Resend</span>
                      </button>

                      <button
                        type="button"
                        onClick={handlePayOnDelivery}
                        className="py-2.5 px-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Banknote className="w-3.5 h-3.5" />
                        <span>Pay on Delivery</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMpesaStatus('idle');
                          setStkError(null);
                        }}
                        className="py-2.5 px-2 rounded-xl border border-red-200 hover:bg-red-50 text-xs font-semibold text-red-600 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Ready to pay view */
                <div className="space-y-4">
                  {/* Phone confirmation box */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                          M
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            M-Pesa Phone Number
                          </span>
                          <span className="text-base font-black text-slate-900 tracking-tight">
                            {formatKenyanPhone(mpesaPhone || phone).display || phone || 'Not provided'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowEditMpesaPhone(!showEditMpesaPhone)}
                        className="text-xs font-bold text-[#1B3E6F] hover:text-[#00A859] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        {showEditMpesaPhone ? 'Keep this line' : 'Change number'}
                      </button>
                    </div>

                    {showEditMpesaPhone && (
                      <div className="pt-2 border-t border-slate-200 space-y-1">
                        <label className="block text-xs font-bold text-slate-700">
                          Enter Safaricom Number
                        </label>
                        <input
                          type="tel"
                          placeholder="07XX XXX XXX or 01XX XXX XXX"
                          value={mpesaPhone}
                          onChange={(e) => setMpesaPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Ready for instant payment. Click below to trigger the prompt on this line.</span>
                    </div>
                  </div>

                  {stkError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <span>{stkError}</span>
                    </div>
                  )}

                  {mpesaStatus === 'timeout' && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                      <strong>Prompt timed out.</strong>
                      <p>If you didn't receive the prompt, ensure your phone screen is unlocked or click to resend.</p>
                    </div>
                  )}

                  {/* Primary & Alternative CTAs */}
                  <div className="space-y-2.5 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      disabled={mpesaStatus === 'initiating' || (!mpesaPhone && !phone)}
                      onClick={handleInitiateStk}
                      className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>
                        {mpesaStatus === 'initiating'
                          ? 'Sending STK Prompt...'
                          : `Send M-Pesa Prompt (${formatCurrency(grandTotal)})`}
                      </span>
                    </motion.button>

                    <div className="relative py-1 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200" />
                      </div>
                      <span className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Or
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handlePayOnDelivery}
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Banknote className="w-4 h-4 text-slate-500" />
                      <span>Pay Cash on Delivery</span>
                    </button>
                  </div>

                  <div className="pt-2 flex justify-start">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Delivery Details</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 4: ORDER RECEIPT & CONFIRMATION                     */}
          {/* ======================================================== */}
          {currentStep === 4 && completedOrder && (
            <div className="space-y-5 py-2">
              {/* Success Badge */}
              <div className="text-center space-y-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs"
                >
                  <CheckCircle2 className="w-8 h-8" />
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-black text-[#1B3E6F] tracking-tight">
                  Order Confirmed!
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Thank you, <strong className="text-slate-900">{completedOrder.customer_name}</strong>. Your order has been placed and is being prepared for fast dispatch.
                </p>
              </div>

              {/* Clean Receipt Slip */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5 text-xs">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-[#1B3E6F]">CYDEN DISTRIBUTORS LTD</h4>
                    <p className="text-[11px] text-slate-500">Order Ref: {completedOrder.order_id}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      {completedOrder.payment_method === 'cash_on_delivery' ? 'CASH ON DELIVERY' : `PAID: ${completedOrder.mpesa_receipt}`}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(completedOrder.created_at).toLocaleDateString('en-KE')}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Recipient</span>
                    <strong className="text-slate-800 block">{completedOrder.customer_name}</strong>
                    <span className="text-slate-500 text-[11px]">{completedOrder.customer_phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Delivery To</span>
                    <p className="text-slate-800 font-medium text-[11px] line-clamp-2">{completedOrder.delivery_location}</p>
                  </div>
                </div>

                {/* Item List */}
                <div className="border-t border-slate-200 pt-3 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Ordered Beverages
                  </span>
                  {completedOrder.items.map((item) => (
                    <div key={item.product_id} className="flex justify-between text-slate-700 text-xs">
                      <span>{item.quantity}x {item.name} ({item.size})</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-dashed border-slate-300 space-y-1">
                    <div className="flex justify-between text-slate-500 text-xs">
                      <span>Subtotal</span>
                      <span>{formatCurrency(completedOrder.subtotal || 0)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-xs">
                      <span>Delivery</span>
                      <span>{(completedOrder.delivery_fee || 0) === 0 ? 'FREE' : formatCurrency(completedOrder.delivery_fee || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold text-[#1B3E6F] pt-1">
                      <span>Total</span>
                      <span>{formatCurrency(completedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Post-order actions */}
              <div className="space-y-2.5 pt-1">
                <a
                  href={`https://wa.me/254722400409?text=${encodeURIComponent(
                    `Hello Cyden Distributors, I have placed Order #${completedOrder.order_id} for ${completedOrder.customer_name} to be delivered to ${completedOrder.delivery_location}. Please confirm dispatch.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  <span>Notify Cyden Dispatch on WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Receipt</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-2.5 px-5 rounded-xl bg-[#1B3E6F] hover:bg-[#122B4E] text-white text-xs font-bold transition-colors cursor-pointer text-center"
                  >
                    Done & Return
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
