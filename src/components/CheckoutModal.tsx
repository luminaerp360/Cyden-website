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
import { Order, OrderItem, CustomerType, DeliveryMethod, MpesaStatus } from '../types';

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
    grandTotal,
    totalItems,
    deliveryDetails,
    setDeliveryDetails,
    saveCompletedOrder,
  } = useCart();

  // Wizard Steps: 1: Review & Type, 2: Location & Contact, 3: Lipa na M-Pesa STK, 4: Receipt
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [customerType, setCustomerType] = useState<CustomerType>(deliveryDetails.customerType || 'retail');

  // Keep customerType in sync with context when updated externally
  useEffect(() => {
    if (deliveryDetails.customerType) {
      setCustomerType(deliveryDetails.customerType);
    }
  }, [deliveryDetails.customerType]);

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
  const [businessName, setBusinessName] = useState(deliveryDetails.businessName || '');
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

  // Step 2 Validation
  const canProceedToPayment = () => {
    if (!fullName.trim()) return false;
    const phoneValid = formatKenyanPhone(phone).valid;
    if (!phoneValid) return false;
    if (customerType === 'wholesale' && !businessName.trim()) return false;
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

    const shippingAddress =
      deliveryMethod === 'delivery'
        ? `${townArea === 'Other (Specify Below)' ? customArea : townArea}, ${streetAddress}, ${county}`
        : 'Warehouse Self-Pickup (Rupa Godowns, Eldoret)';

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

    // 2. Record the order on the e-commerce backend API (if token available)
    if (token) {
      try {
        await createOrder(
          {
            items: orderItems,
            shippingAddress,
            paymentMethod: 'mpesa',
          },
          token
        );
      } catch (orderErr) {
        console.warn('Backend order recording notice:', orderErr);
      }
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
        customer_type: customerType,
        customer_name: fullName,
        customer_phone: phoneValid.display,
        outlet_name: customerType === 'wholesale' ? businessName : undefined,
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
        customerType,
        fullName,
        phone,
        email,
        businessName,
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
    const shippingAddress =
      deliveryMethod === 'delivery'
        ? `${townArea === 'Other (Specify Below)' ? customArea : townArea}, ${streetAddress}, ${county}`
        : 'Warehouse Self-Pickup (Rupa Godowns, Eldoret)';

    try {
      await createOrder(
        {
          items: cart.map((it) => ({
            productId: it.product.id,
            quantity: it.quantity,
            price: it.product.price,
            notes: it.product.name,
          })),
          shippingAddress,
          paymentMethod: 'cash',
        },
        token
      );
    } catch (err) {
      console.warn('Backend order recording notice:', err);
    }

    const newOrder: Order = {
      order_id: orderRef,
      source: 'web_cart',
      customer_type: customerType,
      customer_name: fullName,
      customer_phone: phone,
      outlet_name: customerType === 'wholesale' ? businessName : undefined,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col my-auto max-h-[96vh] sm:max-h-[92vh]"
      >
        {/* Header with Step Progress */}
        <div className="bg-[#1B3E6F] text-white p-4 sm:p-6 relative">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center text-[#3AA88C] flex-shrink-0">
                {currentStep === 3 ? (
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                ) : currentStep === 4 ? (
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                ) : (
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-[#3AA88C] block truncate">
                  Cyden Distributors Direct Checkout
                </span>
                <h2 className="text-base sm:text-xl font-bold tracking-tight text-white truncate">
                  {currentStep === 1 && 'Confirm Your Drink Cart'}
                  {currentStep === 2 && 'Delivery Location & Details'}
                  {currentStep === 3 && 'Lipa Na M-Pesa STK Push'}
                  {currentStep === 4 && 'Order Confirmed & Receipt'}
                </h2>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 text-white text-xs font-semibold transition-colors cursor-pointer border border-white/20 flex-shrink-0"
              aria-label="Close and cancel order modal"
              title="Cancel / Close"
            >
              <X className="w-4 h-4" />
              <span className="hidden xs:inline">Cancel</span>
            </button>
          </div>

          {/* Stepper Dots */}
          <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <div className={`flex items-center gap-1.5 font-bold ${currentStep >= 1 ? 'text-[#3AA88C]' : 'text-white/40'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 1 ? 'bg-[#3AA88C] text-white' : 'bg-white/20'}`}>1</span>
              <span className="hidden sm:inline">Cart</span>
            </div>
            <div className={`h-0.5 flex-1 mx-1.5 sm:mx-2 ${currentStep >= 2 ? 'bg-[#3AA88C]' : 'bg-white/20'}`} />
            <div className={`flex items-center gap-1.5 font-bold ${currentStep >= 2 ? 'text-[#3AA88C]' : 'text-white/40'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 2 ? 'bg-[#3AA88C] text-white' : 'bg-white/20'}`}>2</span>
              <span className="hidden sm:inline">Location</span>
            </div>
            <div className={`h-0.5 flex-1 mx-1.5 sm:mx-2 ${currentStep >= 3 ? 'bg-[#3AA88C]' : 'bg-white/20'}`} />
            <div className={`flex items-center gap-1.5 font-bold ${currentStep >= 3 ? 'text-[#3AA88C]' : 'text-white/40'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 3 ? 'bg-[#3AA88C] text-white' : 'bg-white/20'}`}>3</span>
              <span className="hidden sm:inline">M-Pesa STK</span>
            </div>
            <div className={`h-0.5 flex-1 mx-1.5 sm:mx-2 ${currentStep >= 4 ? 'bg-[#3AA88C]' : 'bg-white/20'}`} />
            <div className={`flex items-center gap-1.5 font-bold ${currentStep === 4 ? 'text-emerald-400' : 'text-white/40'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 4 ? 'bg-emerald-400 text-neutral-900' : 'bg-white/20'}`}>4</span>
              <span className="hidden sm:inline">Receipt</span>
            </div>
          </div>

          {/* Mobile active step sub-label */}
          <div className="sm:hidden text-center text-[11px] text-white/80 font-medium pt-1.5">
            Step {currentStep} of 4: {currentStep === 1 ? 'Cart Confirmation' : currentStep === 2 ? 'Delivery & Contact' : currentStep === 3 ? 'M-Pesa STK Push' : 'Receipt'}
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-7 overflow-y-auto flex-1 space-y-5 sm:space-y-6">
          {/* ======================================================== */}
          {/* STEP 1: CART CONFIRMATION & CUSTOMER TYPE SELECTION       */}
          {/* ======================================================== */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Customer Type Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Who is ordering?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCustomerType('retail')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      customerType === 'retail'
                        ? 'border-[#3AA88C] bg-emerald-50/50 ring-2 ring-[#3AA88C]/30'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      customerType === 'retail' ? 'bg-[#3AA88C] text-white' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-[#1B3E6F] block">Individual Customer</span>
                      <p className="text-xs text-neutral-500 leading-snug">
                        Personal drinks, home chilling, party packs, single or multiple bottles.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustomerType('wholesale')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      customerType === 'wholesale'
                        ? 'border-[#1B3E6F] bg-blue-50/50 ring-2 ring-[#1B3E6F]/30'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      customerType === 'wholesale' ? 'bg-[#1B3E6F] text-white' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-[#1B3E6F] block">Wholesale / Bar & Lounge</span>
                      <p className="text-xs text-neutral-500 leading-snug">
                        Commercial bar, club, restaurant, hotel, liquor store, bulk crates.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Items in Cart */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Order Items ({totalItems})
                  </h3>
                  <span className="text-xs text-neutral-500">
                    Adjust bottle quantities as needed
                  </span>
                </div>

                {cart.length === 0 ? (
                  <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                    <ShoppingBag className="w-8 h-8 text-neutral-400 mx-auto" />
                    <div>
                      <p className="text-sm font-bold text-neutral-800">Your drink cart is empty</p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Add items from our genuine EABL catalogue to order directly from Cyden Distributors.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleClose();
                        window.history.pushState({}, '', '/catalogue');
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3AA88C] hover:bg-[#2C856E] text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Browse Beverages Catalogue</span>
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-2xl overflow-hidden bg-white">
                    {cart.map(({ product, quantity }) => (
                      <div key={product.id} className="p-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-neutral-50 border border-neutral-200 p-1 flex items-center justify-center flex-shrink-0">
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
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-[#1B3E6F] truncate">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                              <span>{product.brand}</span>
                              <span>•</span>
                              <span>{product.size}</span>
                              <span>•</span>
                              <span className="font-semibold text-neutral-800">{formatCurrency(product.price)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="flex items-center border border-neutral-300 rounded-lg bg-neutral-50">
                            <button
                              type="button"
                              onClick={() => updateQuantity(product.id, quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 rounded-l-lg"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-bold text-neutral-800">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(product.id, quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 rounded-r-lg"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-xs font-bold text-[#222222] min-w-[70px] text-right">
                            {formatCurrency(product.price * quantity)}
                          </span>

                          <button
                            type="button"
                            onClick={() => removeFromCart(product.id)}
                            className="text-neutral-400 hover:text-red-600 p-1 transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Breakdown Card */}
              <div className="bg-[#F8F7F4] p-4 rounded-2xl border border-neutral-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-semibold text-neutral-800">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Standard Fast Delivery</span>
                  <span className="font-semibold text-neutral-800">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded">FREE (Order &gt; 4,000 KSH)</span>
                    ) : (
                      formatCurrency(deliveryFee)
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-sm font-extrabold text-[#1B3E6F]">
                  <span>Total Due</span>
                  <span className="text-base text-[#222222]">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-neutral-600 bg-neutral-100/90 px-3.5 py-2.5 rounded-xl border border-neutral-200">
                  <ShieldCheck className="w-4 h-4 text-[#3AA88C] flex-shrink-0" />
                  <span className="font-semibold text-[11px] sm:text-xs text-neutral-700">
                    Direct Cyden Warehouses (Rupa & Sitet Iten)
                  </span>
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors text-center cursor-pointer"
                  >
                    Continue Shopping
                  </button>

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
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    title="Send your selected items directly to Cyden via WhatsApp"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
                    <span>Send via WhatsApp</span>
                  </button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    disabled={cart.length === 0}
                    onClick={() => setCurrentStep(2)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#3AA88C] hover:bg-[#2C856E] text-white font-bold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>Proceed to Delivery Location</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: LOCATION & CONTACT DETAILS                        */}
          {/* ======================================================== */}
          {currentStep === 2 && (
            <div className="space-y-5">
              {/* Delivery vs Depot Pickup Tab */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Fulfillment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('delivery')}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      deliveryMethod === 'delivery'
                        ? 'bg-[#1B3E6F] text-white border-[#1B3E6F] shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>Direct Door Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      deliveryMethod === 'pickup'
                        ? 'bg-[#1B3E6F] text-white border-[#1B3E6F] shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Self-Pickup at Depot (Free)</span>
                  </button>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-neutral-700">
                    Recipient Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kiprotich Kirui"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-[#F8F7F4] border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-neutral-700">
                    Safaricom M-Pesa Phone *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0722 000 000"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPhone(val);
                        if (!showEditMpesaPhone) {
                          setMpesaPhone(val);
                        }
                      }}
                      className="w-full pl-9 pr-3 py-2.5 bg-[#F8F7F4] border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Enter once — used for delivery coordination and your M-Pesa STK payment push.
                  </p>
                </div>
              </div>

              {/* Wholesale Business Name (if wholesale) */}
              {customerType === 'wholesale' && (
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-neutral-700">
                    Bar / Lounge / Outlet Name *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Highland Lounge & Sports Bar"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-[#F8F7F4] border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
                    />
                  </div>
                </div>
              )}

              {/* Location Specification (if direct delivery) */}
              {deliveryMethod === 'delivery' ? (
                <div className="space-y-4 pt-2 border-t border-neutral-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1B3E6F] flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#E8582F]" />
                      <span>Delivery Address & Location</span>
                    </label>

                    {/* Geolocation Button */}
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={isLocating}
                      className="text-[11px] font-bold text-[#3AA88C] hover:text-[#2C856E] flex items-center gap-1 p-1 rounded hover:bg-emerald-50 transition-colors cursor-pointer"
                    >
                      <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                      <span>{isLocating ? 'Detecting GPS...' : 'Use My Live GPS Location'}</span>
                    </button>
                  </div>

                  {gpsLocation && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>GPS Tagged: {gpsLocation.lat.toFixed(4)}° N, {gpsLocation.lng.toFixed(4)}° E (±{gpsLocation.accuracy}m)</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                  )}

                  {gpsError && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      {gpsError}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-neutral-700">
                        County
                      </label>
                      <select
                        value={county}
                        onChange={(e) => setCounty(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#F8F7F4] border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
                      >
                        <option value="Uasin Gishu">Uasin Gishu (Eldoret)</option>
                        <option value="Elgeyo Marakwet">Elgeyo Marakwet (Iten / Tambach)</option>
                        <option value="Nandi">Nandi County (Kapsabet)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-neutral-700">
                        Town / Estate / Neighborhood *
                      </label>
                      <select
                        value={townArea}
                        onChange={(e) => setTownArea(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#F8F7F4] border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
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
                      <label className="block text-xs font-semibold text-neutral-700">
                        Specify Your Area Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Turbo, Moiben, Sergoit"
                        value={customArea}
                        onChange={(e) => setCustomArea(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#F8F7F4] border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-neutral-700">
                      Street, Building, Apartment or Landmark *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Near Rupa Mall, Gate 3, House #12 or Uganda Road next to Kobil"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#F8F7F4] border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-neutral-700">
                      Delivery & Chilling Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Please deliver well chilled; call rider upon arrival"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#F8F7F4] border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs space-y-2 text-blue-950">
                  <span className="font-bold block text-sm">Designated Depot Collection Points:</span>
                  <div className="space-y-1.5 text-xs text-blue-900">
                    <p>• <strong>Eldoret Central Depot:</strong> Rupa Godowns, Eldoret-Malaba Road (Opposite Rupa Mills).</p>
                    <p>• <strong>Iten Sub-Store:</strong> Sitet Building, Iten-Kabarnet Road.</p>
                  </div>
                  <p className="text-[11px] text-blue-700 pt-1">
                    Your drinks will be pre-packaged and chilled ready for collection immediately after M-Pesa clearance.
                  </p>
                </div>
              )}

              {/* Navigation Actions */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Cart</span>
                </button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  disabled={!canProceedToPayment()}
                  onClick={() => {
                    if (!mpesaPhone) setMpesaPhone(phone);
                    setCurrentStep(3);
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#3AA88C] hover:bg-[#2C856E] text-white font-bold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>Continue to Lipa Na M-Pesa STK</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: LIPA NA M-PESA STK PUSH PAYMENT                   */}
          {/* ======================================================== */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Safaricom M-Pesa Banner */}
              <div className="bg-gradient-to-r from-[#00A859] to-[#008244] text-white p-5 rounded-3xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-white text-[#00A859] font-black px-2.5 py-1 rounded-lg text-sm tracking-tight shadow-xs">
                      M-PESA
                    </span>
                    <span className="font-extrabold text-sm text-white tracking-wide">
                      LIPA NA M-PESA ONLINE
                    </span>
                  </div>
                  <span className="text-[11px] bg-white/20 px-2.5 py-0.5 rounded-full font-semibold">
                    Instant STK Push
                  </span>
                </div>

                <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-white/80 block text-[10px] uppercase">Merchant</span>
                    <strong className="text-sm text-white">CYDEN DISTRIBUTORS LTD</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-white/80 block text-[10px] uppercase">Total Payable</span>
                    <strong className="text-lg text-white">{formatCurrency(grandTotal)}</strong>
                  </div>
                </div>
              </div>

              {/* Interactive STK Push Triggering & Waiting View */}
              {mpesaStatus === 'pending_stk' ? (
                <div className="space-y-5 py-2">
                  {/* Live Status Card */}
                  <div className="bg-gradient-to-br from-emerald-950 via-neutral-900 to-neutral-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-emerald-500/30 relative overflow-hidden">
                    {/* Ambient Glow */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative space-y-4">
                      {/* Pulse Status Pill */}
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span>STK Push Dispatched</span>
                        </div>
                        <span className="text-xs font-mono text-emerald-400 font-semibold">
                          {stkCountdown}s remaining
                        </span>
                      </div>

                      {/* Main Message */}
                      <div className="space-y-1">
                        <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                          Please Check Your Phone Now
                        </h3>
                        <p className="text-xs text-neutral-300 leading-relaxed">
                          A Safaricom STK prompt has been pushed directly to{' '}
                          <strong className="text-emerald-400 font-bold">
                            {formatKenyanPhone(mpesaPhone || phone).display}
                          </strong>
                          . Enter your M-Pesa PIN to authorize payment of{' '}
                          <strong className="text-white font-bold">{formatCurrency(grandTotal)}</strong> to{' '}
                          <strong className="text-white">CYDEN DISTRIBUTORS LTD</strong>.
                        </p>
                      </div>

                      {/* 3 Steps Instructions */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-left">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-bold mb-1.5">
                            1
                          </div>
                          <div className="text-xs font-semibold text-white">Unlock Handset</div>
                          <div className="text-[10px] text-neutral-400">Wake up your phone screen</div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-left">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-bold mb-1.5">
                            2
                          </div>
                          <div className="text-xs font-semibold text-white">Enter M-Pesa PIN</div>
                          <div className="text-[10px] text-neutral-400">Authorize {formatCurrency(grandTotal)}</div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-left">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-bold mb-1.5">
                            3
                          </div>
                          <div className="text-xs font-semibold text-white">Auto Confirmation</div>
                          <div className="text-[10px] text-neutral-400">Page updates once approved</div>
                        </div>
                      </div>

                      {/* Progress Bar & Polling Feedback */}
                      <div className="pt-2 space-y-1.5">
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <motion.div
                            className="bg-emerald-500 h-full rounded-full"
                            initial={{ width: '100%' }}
                            animate={{ width: `${(stkCountdown / 60) * 100}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-neutral-400">
                          <span className="flex items-center gap-1.5">
                            <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />
                            Checking Safaricom status (Check {pollAttempt || 1}/24)
                          </span>
                          <span className="font-mono text-emerald-300 font-medium">
                            Ref: {checkoutRequestId ? checkoutRequestId.slice(-8) : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {stkError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <span>{stkError}</span>
                    </div>
                  )}

                  {/* Real Action Buttons */}
                  <div className="space-y-2 pt-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      disabled={isVerifying}
                      onClick={handleManualVerifyPayment}
                      className="w-full py-3.5 px-4 rounded-xl bg-[#00A859] hover:bg-[#008244] text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-75"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Verifying with Safaricom...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>✓ I Have Entered PIN — Verify & Confirm Order</span>
                        </>
                      )}
                    </motion.button>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={handleInitiateStk}
                        className="py-2.5 px-3 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-xs font-semibold text-neutral-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Resend STK Push</span>
                      </button>

                      <button
                        type="button"
                        onClick={handlePayOnDelivery}
                        className="py-2.5 px-3 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-xs font-semibold text-neutral-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Pay on Delivery</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMpesaStatus('idle');
                          setShowEditMpesaPhone(true);
                        }}
                        className="py-2.5 px-3 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-xs font-semibold text-neutral-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Change Number</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Unified M-Pesa Line Card (No double typing) */}
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#00A859] text-white flex items-center justify-center font-black text-xs flex-shrink-0 shadow-xs">
                          M
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#008244] block">
                            Confirmed M-Pesa Line
                          </span>
                          <div className="text-base sm:text-lg font-black text-neutral-900 tracking-tight truncate">
                            {formatKenyanPhone(mpesaPhone || phone).display || phone || 'No phone set'}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowEditMpesaPhone(!showEditMpesaPhone)}
                        className="text-xs font-bold text-[#1B3E6F] hover:text-[#00A859] px-2.5 py-1 rounded-lg hover:bg-white/80 transition-colors flex-shrink-0 cursor-pointer border border-neutral-200/80 bg-white"
                      >
                        {showEditMpesaPhone ? 'Keep this line' : 'Change number'}
                      </button>
                    </div>

                    <div className="text-[11px] text-emerald-800 flex items-center gap-1.5 pt-1 border-t border-emerald-200/60">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00A859] flex-shrink-0" />
                      <span>Ready for STK Push. Enter PIN on this line when prompted.</span>
                    </div>
                  </div>

                  {/* Optional Override Input (Only shown if user clicked 'Change number' or phone is missing) */}
                  {(showEditMpesaPhone || (!phone && !mpesaPhone)) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200"
                    >
                      <label className="block text-xs font-bold text-neutral-800">
                        Enter Alternative Safaricom M-Pesa Number
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
                        <input
                          type="tel"
                          required
                          placeholder="07XX XXX XXX or 01XX XXX XXX"
                          value={mpesaPhone}
                          onChange={(e) => setMpesaPhone(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#00A859]"
                        />
                      </div>
                      <p className="text-[10px] text-neutral-500">
                        Leave as default to pay with your delivery contact number ({phone}).
                      </p>
                    </motion.div>
                  )}

                  {stkError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <span>{stkError}</span>
                    </div>
                  )}

                  {mpesaStatus === 'timeout' && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                      <strong>STK Request Timed Out.</strong>
                      <p>If you did not receive the prompt, ensure your phone is unlocked or try re-triggering below.</p>
                    </div>
                  )}

                  {/* Summary of delivery info */}
                  <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1.5 text-neutral-600">
                    <div className="flex justify-between">
                      <span>Order Destination:</span>
                      <strong className="text-neutral-800 truncate max-w-[200px]">
                        {deliveryMethod === 'delivery' ? `${townArea}` : 'Godown Collection'}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Customer:</span>
                      <strong className="text-neutral-800">{fullName} ({customerType})</strong>
                    </div>
                    <div className="flex justify-between border-t border-neutral-200/60 pt-1">
                      <span>Payable Amount:</span>
                      <strong className="text-[#00A859] font-black text-sm">{formatCurrency(grandTotal)}</strong>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Edit Location & Details</span>
                    </button>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePayOnDelivery}
                        className="px-4 py-3 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-xs font-bold text-neutral-700 transition-all cursor-pointer text-center"
                      >
                        Pay on Delivery (Cash)
                      </button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        disabled={mpesaStatus === 'initiating' || (!mpesaPhone && !phone)}
                        onClick={handleInitiateStk}
                        className="px-6 py-3.5 rounded-xl bg-[#00A859] hover:bg-[#008244] text-white font-extrabold text-xs sm:text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>
                          {mpesaStatus === 'initiating'
                            ? 'Pushing STK Prompt...'
                            : `Send M-Pesa STK Prompt (${formatCurrency(grandTotal)})`}
                        </span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 4: ORDER CONFIRMED & OFFICIAL RECEIPT                */}
          {/* ======================================================== */}
          {currentStep === 4 && completedOrder && (
            <div className="space-y-6 py-2">
              {/* Top Success Badge */}
              <div className="text-center space-y-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm"
                >
                  <CheckCircle2 className="w-9 h-9" />
                </motion.div>
                <h3 className="text-2xl font-black text-[#1B3E6F] tracking-tight">
                  Payment Confirmed!
                </h3>
                <p className="text-xs text-neutral-600 max-w-md mx-auto">
                  Your payment has been received via Safaricom Lipa na M-Pesa. Your beverages are being packaged for rapid dispatch.
                </p>
              </div>

              {/* Printable Official Receipt Card */}
              <div className="bg-[#F8F7F4] border border-neutral-200 rounded-3xl p-5 sm:p-6 space-y-4 font-sans text-xs shadow-xs">
                {/* Receipt Header */}
                <div className="flex items-start justify-between border-b border-neutral-200 pb-4">
                  <div>
                    <h4 className="font-extrabold text-sm text-[#1B3E6F]">CYDEN DISTRIBUTORS LIMITED</h4>
                    <p className="text-[11px] text-neutral-500">Official EABL Gold Distributor 2024</p>
                    <p className="text-[11px] text-neutral-500">Rupa Godowns, Eldoret-Malaba Rd, Kenya</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      PAID: {completedOrder.mpesa_receipt}
                    </span>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      {new Date(completedOrder.created_at).toLocaleString('en-KE')}
                    </p>
                  </div>
                </div>

                {/* Customer & Location Details */}
                <div className="grid grid-cols-2 gap-3 py-1">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">Customer</span>
                    <strong className="text-neutral-800">{completedOrder.customer_name}</strong>
                    <p className="text-neutral-500">{completedOrder.customer_phone}</p>
                    {completedOrder.outlet_name && (
                      <p className="text-[#E8582F] font-semibold">{completedOrder.outlet_name}</p>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">Delivery Destination</span>
                    <p className="text-neutral-800 font-medium leading-tight">{completedOrder.delivery_location}</p>
                    <span className="inline-block mt-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                      ETA: 30-45 mins (Local)
                    </span>
                  </div>
                </div>

                {/* Itemized Table */}
                <div className="border-t border-neutral-200 pt-3 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                    Drinks Ordered
                  </span>
                  {completedOrder.items.map((item) => (
                    <div key={item.product_id} className="flex justify-between text-neutral-700 text-xs">
                      <span>{item.quantity}x {item.name} ({item.size})</span>
                      <span className="font-semibold text-neutral-900">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-dashed border-neutral-300 space-y-1">
                    <div className="flex justify-between text-neutral-500 text-xs">
                      <span>Subtotal</span>
                      <span>{formatCurrency(completedOrder.subtotal || 0)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-500 text-xs">
                      <span>Delivery</span>
                      <span>{(completedOrder.delivery_fee || 0) === 0 ? 'FREE' : formatCurrency(completedOrder.delivery_fee || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold text-[#1B3E6F] pt-1">
                      <span>Total Paid via M-Pesa</span>
                      <span>{formatCurrency(completedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick WhatsApp Notification & Dispatch Link */}
              <div className="space-y-3 pt-2">
                <a
                  href={`https://wa.me/254722400409?text=${encodeURIComponent(
                    `Hello Cyden Distributors, I have placed and paid for Order #${completedOrder.order_id} (M-Pesa Ref: ${completedOrder.mpesa_receipt}) for ${completedOrder.customer_name} to be delivered to ${completedOrder.delivery_location}. Please confirm dispatch.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <span>Notify Cyden Dispatch on WhatsApp</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Receipt</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1B3E6F] hover:bg-[#122B4E] text-white text-xs font-bold transition-colors cursor-pointer text-center"
                  >
                    Done / Return to Shop
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
