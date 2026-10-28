import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, ShoppingBag, Send, PhoneCall, Check, Sparkles, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { submitOrderRequest } from '../services/thebar';
import { formatCurrency } from '../services/products';

interface OrderRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProduct?: Product | null;
  availableProducts: Product[];
}

export default function OrderRequestModal({
  isOpen,
  onClose,
  preselectedProduct,
  availableProducts,
}: OrderRequestModalProps) {
  const [outletName, setOutletName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [deliveryPref, setDeliveryPref] = useState<'Direct Outlet Delivery' | 'Main Office Eldoret' | 'Sub-Store Iten'>('Direct Outlet Delivery');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<{ orderId: string; whatsappUrl: string } | null>(null);

  useEffect(() => {
    if (preselectedProduct) {
      setSelectedProductId(preselectedProduct.id);
    } else if (availableProducts.length > 0 && !selectedProductId) {
      setSelectedProductId(availableProducts[0].id);
    }
  }, [preselectedProduct, availableProducts]);

  if (!isOpen) return null;

  const currentProduct = availableProducts.find((p) => p.id === selectedProductId) || preselectedProduct;
  const estimatedTotal = currentProduct ? currentProduct.price * quantity : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) return;

    setIsSubmitting(true);
    try {
      const res = await submitOrderRequest({
        customer_name: contactName,
        customer_phone: phone,
        outlet_name: outletName,
        delivery_location: location,
        delivery_preference: deliveryPref,
        notes,
        items: [
          {
            product_id: currentProduct.id,
            name: currentProduct.name,
            quantity: quantity,
            price: currentProduct.price,
            size: currentProduct.size,
          }
        ]
      });

      setSubmittedResult({
        orderId: res.orderId,
        whatsappUrl: res.whatsappUrl,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedResult(null);
    setOutletName('');
    setContactName('');
    setPhone('');
    setLocation('');
    setNotes('');
    setQuantity(1);
    onClose();
  };

  return (
    <motion.div
      id="cyden-order-request-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-lg bg-[#F8F7F4] text-[#222222] rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-[#1B3E6F] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E8582F] flex items-center justify-center text-white">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Request Direct Order</h3>
              <p className="text-xs text-white/75">B2B Outlet Fast-Dispatch Desk</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {submittedResult ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-[#3AA88C]/20 text-[#2C856E] rounded-full mx-auto flex items-center justify-center">
                <Check className="w-8 h-8 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase font-semibold text-[#E8582F] tracking-wider">
                  Order Received
                </span>
                <h4 className="text-xl font-bold text-[#1B3E6F]">Order #{submittedResult.orderId}</h4>
                <p className="text-sm text-neutral-600 max-w-sm mx-auto">
                  Thank you! Your order request for <span className="font-semibold text-neutral-900">{outletName}</span> has been logged into our distribution queue.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl border border-neutral-200 text-left text-xs space-y-2">
                <div className="flex justify-between border-b pb-1.5 border-neutral-100">
                  <span className="text-neutral-500">Selected Product:</span>
                  <span className="font-semibold text-neutral-800">{currentProduct?.name} ({quantity} units)</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-neutral-100">
                  <span className="text-neutral-500">Estimated Total:</span>
                  <span className="font-bold text-[#3AA88C]">{formatCurrency(estimatedTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Delivery Hub:</span>
                  <span className="font-medium text-neutral-800">{deliveryPref}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <a
                  href={submittedResult.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm shadow-md transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Confirm Instantly via WhatsApp Desk</span>
                </a>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Close / Submit Another Order
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#E8582F] flex-shrink-0 mt-0.5" />
                <p>
                  <strong>B2B Commercial Ordering:</strong> This service caters to licensed retail outlets, bars, clubs, and hotels in Uasin Gishu, Elgeyo Marakwet, and Nandi County.
                </p>
              </div>

              {/* Product Selection & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-neutral-700 uppercase">
                    Select Product
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-800 focus:ring-2 focus:ring-[#3AA88C] focus:outline-none"
                    required
                  >
                    {availableProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.size} ({formatCurrency(p.price)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-neutral-700 uppercase">
                    Quantity (Cases/Units)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-800 focus:ring-2 focus:ring-[#3AA88C] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Price summary badge */}
              {currentProduct && (
                <div className="p-2.5 bg-[#3AA88C]/10 rounded-lg flex items-center justify-between text-xs text-[#2C856E]">
                  <span>Unit Price: <strong>{formatCurrency(currentProduct.price)}</strong></span>
                  <span>Est. Subtotal: <strong className="text-sm font-bold">{formatCurrency(estimatedTotal)}</strong></span>
                </div>
              )}

              {/* Outlet details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-neutral-700 uppercase">
                    Bar / Outlet Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Highlands Sports Club"
                    value={outletName}
                    onChange={(e) => setOutletName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-800 focus:ring-2 focus:ring-[#3AA88C] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-neutral-700 uppercase">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Manager / Owner Name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-800 focus:ring-2 focus:ring-[#3AA88C] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-neutral-700 uppercase">
                    Phone Number (M-Pesa / Calls) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0722 000 000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-800 focus:ring-2 focus:ring-[#3AA88C] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-neutral-700 uppercase">
                    Delivery Hub / Method
                  </label>
                  <select
                    value={deliveryPref}
                    onChange={(e) => setDeliveryPref(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-800 focus:ring-2 focus:ring-[#3AA88C] focus:outline-none"
                  >
                    <option value="Direct Outlet Delivery">Direct Truck Delivery to Outlet</option>
                    <option value="Main Office Eldoret">Pickup at Rupa Godowns (Eldoret)</option>
                    <option value="Sub-Store Iten">Pickup at Sitet Building (Iten)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-neutral-700 uppercase">
                  Delivery Address / Landmark *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Street, area, town (e.g. KVDA Plaza area, Eldoret)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-800 focus:ring-2 focus:ring-[#3AA88C] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-neutral-700 uppercase">
                  Additional Notes / Special Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Need crates exchange, preferred morning delivery slot, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-800 focus:ring-2 focus:ring-[#3AA88C] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-5 rounded-xl bg-[#E8582F] hover:bg-[#D04620] text-white font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Logging Request...' : 'Submit Direct Order'}</span>
                </button>
                <a
                  href="tel:+254722400409"
                  className="py-3 px-4 rounded-xl bg-[#1B3E6F] hover:bg-[#122B4E] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Dispatch</span>
                </a>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
