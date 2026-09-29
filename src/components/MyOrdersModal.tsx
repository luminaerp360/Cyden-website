import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  ReceiptText,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Smartphone,
  RefreshCw,
  Printer,
} from 'lucide-react';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getStoredOrders, computeOrderStats } from '../services/orderStore';
import { fetchMyOrders } from '../services/ordersService';
import { formatCurrency } from '../services/products';

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCatalogue?: () => void;
}

export const MyOrdersModal: React.FC<MyOrdersModalProps> = ({
  isOpen,
  onClose,
  onOpenCatalogue,
}) => {
  const { user, getToken } = useAuth();
  const { addToCart, setIsCartOpen } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    const userId = user?._id || user?.id || null;
    const local = getStoredOrders(userId);

    const token = getToken();
    if (token) {
      try {
        const serverOrders = await fetchMyOrders(token);
        if (Array.isArray(serverOrders) && serverOrders.length > 0) {
          // Merge server orders with local data
          const mapped: Order[] = serverOrders.map((so) => ({
            order_id: so.id || `CYD-${Date.now()}`,
            source: 'web_cart',
            customer_name: user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Valued Customer',
            customer_phone: user?.phoneNumber || '',
            delivery_location: so.shippingAddress,
            items: (so.items || []).map((it) => ({
              product_id: it.productId,
              name: it.notes || `Product #${it.productId.slice(0, 8)}`,
              quantity: it.quantity,
              price: it.price,
            })),
            total: so.totalAmount,
            status: so.status === 'delivered' || so.status === 'shipped' ? 'fulfilled' : so.status === 'confirmed' ? 'confirmed' : 'pending',
            payment_method: (so.paymentMethod as any) || 'mpesa_stk',
            mpesa_receipt: so.trackingNumber,
            created_at: so.createdAt || new Date().toISOString(),
          }));

          // Deduplicate
          const combined = [...mapped, ...local];
          const unique = Array.from(new Map(combined.map((o) => [o.order_id, o])).values());
          setOrders(unique);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Could not fetch server orders, relying on local history:', err);
      }
    }

    setOrders(local);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadOrders();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const stats = computeOrderStats(orders);

  const filteredOrders = orders.filter((o) => {
    if (filter === 'confirmed') return o.status === 'confirmed' || o.status === 'fulfilled';
    if (filter === 'pending') return o.status === 'pending';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'fulfilled':
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            <span>Delivered</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <Truck className="w-3 h-3" />
            <span>Confirmed</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-white text-neutral-900 rounded-3xl max-w-3xl w-full p-5 sm:p-8 shadow-2xl border border-neutral-100 relative max-h-[90vh] flex flex-col"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-100 shrink-0">
          <div>
            <div className="text-[11px] font-bold text-[#3AA88C] uppercase tracking-wider mb-0.5">
              {user ? `Customer: ${user.fullName || user.firstName || user.email}` : 'Customer Portal'}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1B3E6F] tracking-tight">
              Order History &amp; Consignments
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Live tracking and status for your beverage orders with Cyden Distributors.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2.5 my-4 shrink-0">
          <div className="bg-[#1B3E6F]/5 p-3 rounded-2xl border border-[#1B3E6F]/10">
            <span className="text-[10px] font-bold text-[#1B3E6F] uppercase tracking-wider block">
              Total Orders
            </span>
            <span className="text-lg sm:text-xl font-black text-[#1B3E6F]">
              {stats.totalOrders}
            </span>
          </div>
          <div className="bg-[#3AA88C]/10 p-3 rounded-2xl border border-[#3AA88C]/20">
            <span className="text-[10px] font-bold text-[#2C856E] uppercase tracking-wider block">
              Total Spent
            </span>
            <span className="text-lg sm:text-xl font-black text-[#2C856E]">
              {formatCurrency(stats.totalSpentKes)}
            </span>
          </div>
          <div className="bg-[#F2A93B]/10 p-3 rounded-2xl border border-[#F2A93B]/20">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              Items Ordered
            </span>
            <span className="text-lg sm:text-xl font-black text-amber-900">
              {stats.totalItems}
            </span>
          </div>
        </div>

        {/* Filters and Refresh */}
        <div className="flex items-center justify-between gap-2 pb-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                filter === 'all'
                  ? 'bg-[#1B3E6F] text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                filter === 'confirmed'
                  ? 'bg-[#3AA88C] text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Confirmed ({stats.confirmedCount + stats.fulfilledCount})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer transition-colors ${
                filter === 'pending'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              Pending ({stats.pendingCount})
            </button>
          </div>
          <button
            onClick={loadOrders}
            disabled={loading}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-[#1B3E6F] hover:bg-neutral-100 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#3AA88C]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Orders Scroll Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-12 px-4 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
              <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-neutral-800">No orders placed yet</h4>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                Explore our beverage catalog to order genuine EABL beers, spirits, and wines with fast Eldoret &amp; Iten delivery.
              </p>
              {onOpenCatalogue && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCatalogue();
                  }}
                  className="mt-4 px-4 py-2 bg-[#1B3E6F] hover:bg-[#122B4E] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Browse Beverage Catalogue</span>
                </button>
              )}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-xs">
              No orders found matching the selected filter.
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isExpanded = expandedOrderId === order.order_id;
              const formattedDate = new Date(order.created_at).toLocaleDateString('en-KE', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={order.order_id}
                  className="bg-neutral-50 border border-neutral-200/80 rounded-2xl overflow-hidden hover:border-[#3AA88C]/50 transition-all"
                >
                  {/* Card Header summary */}
                  <div
                    onClick={() => toggleExpand(order.order_id)}
                    className="p-4 cursor-pointer flex flex-wrap items-center justify-between gap-3 hover:bg-neutral-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center shrink-0 text-[#1B3E6F] font-bold">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#1B3E6F]">
                            {order.order_id}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-neutral-400" />
                            {formattedDate}
                          </span>
                          <span>•</span>
                          <span>{order.items?.length || 0} product(s)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-auto sm:ml-0">
                      <div className="text-right">
                        <span className="text-sm font-black text-[#1B3E6F] block">
                          {formatCurrency(order.total)}
                        </span>
                        {order.mpesa_receipt && (
                          <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                            {order.mpesa_receipt}
                          </span>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-neutral-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Items & Logistics breakdown */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-neutral-200/80 bg-white p-4 space-y-3"
                      >
                        {/* Order Items */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold uppercase text-neutral-500 tracking-wider">
                            Order Items:
                          </span>
                          <div className="divide-y divide-neutral-100">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="py-1.5 flex items-center justify-between text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-5 text-neutral-400 font-mono text-[11px]">
                                    {item.quantity}×
                                  </span>
                                  <span className="font-semibold text-neutral-800">
                                    {item.name}
                                  </span>
                                </div>
                                <span className="font-bold text-neutral-900">
                                  {formatCurrency(item.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Delivery & Payment details */}
                        <div className="pt-2 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded-xl">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-neutral-400 block">
                              Delivery Location
                            </span>
                            <span className="font-medium text-neutral-800">
                              {order.delivery_location || 'Eldoret Region Delivery'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-neutral-400 block">
                              Payment Method
                            </span>
                            <span className="font-medium text-neutral-800 capitalize">
                              {order.payment_method === 'mpesa_stk'
                                ? `M-Pesa STK Push ${order.mpesa_receipt ? `(${order.mpesa_receipt})` : ''}`
                                : 'Pay on Delivery (Cash)'}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MyOrdersModal;
