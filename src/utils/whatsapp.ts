import { CartItem } from '../types';

export const WHATSAPP_NUMBERS = {
  eldoret: {
    raw: '254722400409',
    display: '0722 400 409',
    name: 'Eldoret Central Depot (Rupa Godowns)',
    tillNumber: '882201',
    tillName: 'Cyden Distributors Ltd',
  },
  iten: {
    raw: '254754722746',
    display: '0754 722 746',
    name: 'Iten Sub-Store (Sitet Building)',
    tillNumber: '882201',
    tillName: 'Cyden Distributors Ltd',
  },
};

export type OrderAudience = 'b2b' | 'personal';

export interface WhatsAppOrderParams {
  phoneKey?: 'eldoret' | 'iten';
  customPhone?: string;
  orderType?: OrderAudience;
  items?: CartItem[];
  subtotal?: number;
  deliveryFee?: number;
  grandTotal?: number;
  customerName?: string;
  outletName?: string;
  outletType?: string;
  phone?: string;
  deliveryLocation?: string;
  gpsLocation?: {
    lat: number;
    lng: number;
    accuracy?: number;
  } | null;
  googleMapsUrl?: string;
  paymentMethod?: 'mpesa_attached' | 'pay_on_delivery' | 'bank_transfer' | 'unpaid' | 'pending';
  paymentMessage?: string;
  mpesaReceipt?: string;
  notes?: string;
  messageType?: 'cart_order' | 'inquiry' | 'price_list' | 'bulk_order';
}

/**
 * Generates formatted WhatsApp click-to-chat URL with pre-filled message
 * Supporting B2B vs Personal, Pinned GPS Location, and Attached Payment Confirmation
 */
export function generateWhatsAppUrl({
  phoneKey = 'eldoret',
  customPhone,
  orderType = 'b2b',
  items = [],
  subtotal = 0,
  deliveryFee = 0,
  grandTotal = 0,
  customerName = '',
  outletName = '',
  outletType = '',
  phone = '',
  deliveryLocation = '',
  gpsLocation = null,
  googleMapsUrl = '',
  paymentMethod = 'unpaid',
  paymentMessage = '',
  mpesaReceipt = '',
  notes = '',
  messageType = 'cart_order',
}: WhatsAppOrderParams): string {
  const targetPhone = customPhone || WHATSAPP_NUMBERS[phoneKey].raw;
  const branch = WHATSAPP_NUMBERS[phoneKey];

  let text = '';

  const isB2B = orderType === 'b2b';
  const orderTypeHeader = isB2B
    ? '🏢 *ORDER TYPE: B2B COMMERCIAL (Bar / Lounge / Outlet)*'
    : '👤 *ORDER TYPE: PERSONAL / INDIVIDUAL ORDER*';

  // Computed maps link if GPS coords provided
  const resolvedMapsUrl =
    googleMapsUrl ||
    (gpsLocation ? `https://maps.google.com/?q=${gpsLocation.lat},${gpsLocation.lng}` : '');

  if (messageType === 'cart_order' && items.length > 0) {
    const itemsList = items
      .map(
        (item) =>
          `• ${item.quantity}x ${item.product.name} (${item.product.size || ''}) — KSH ${(
            item.product.price * item.quantity
          ).toLocaleString()}`
      )
      .join('\n');

    const customerDetails: string[] = [];
    if (isB2B) {
      if (outletName) customerDetails.push(`• *Outlet/Business:* ${outletName}`);
      if (outletType) customerDetails.push(`• *Business Type:* ${outletType}`);
      if (customerName) customerDetails.push(`• *Contact Person:* ${customerName}`);
    } else {
      if (customerName) customerDetails.push(`• *Customer Name:* ${customerName}`);
    }
    if (phone) customerDetails.push(`• *Phone Number:* ${phone}`);

    const locationDetails: string[] = [];
    if (deliveryLocation) locationDetails.push(`• *Town / Area:* ${deliveryLocation}`);
    if (gpsLocation) {
      locationDetails.push(
        `• *Pinned GPS:* ${gpsLocation.lat.toFixed(5)}°, ${gpsLocation.lng.toFixed(5)}° (±${
          gpsLocation.accuracy || 10
        }m)`
      );
    }
    if (resolvedMapsUrl) {
      locationDetails.push(`🗺️ *Google Maps Pin:* ${resolvedMapsUrl}`);
    }

    const paymentDetails: string[] = [];
    if (mpesaReceipt) {
      paymentDetails.push(`• *M-Pesa Ref Code:* ${mpesaReceipt.trim()}`);
    }
    if (paymentMessage) {
      paymentDetails.push(`• *Payment Confirmation Message:*\n"${paymentMessage.trim()}"`);
    } else if (paymentMethod === 'pay_on_delivery') {
      paymentDetails.push(`• *Payment Preference:* Cash / Till on Arrival (COD)`);
    } else {
      paymentDetails.push(`• *Payment Status:* Pending Confirmation (Till: ${branch.tillNumber})`);
    }

    text = `*CYDEN DISTRIBUTORS — DIRECT WHATSAPP ORDER*
📍 *Branch:* ${branch.name}
${orderTypeHeader}
------------------------------------
📋 *RECIPIENT DETAILS:*
${customerDetails.length > 0 ? customerDetails.join('\n') : '• Customer: Retail / Walk-in'}

📍 *DELIVERY DESTINATION:*
${locationDetails.length > 0 ? locationDetails.join('\n') : '• Delivery: Standard Depot Pickup / Eldoret'}

------------------------------------
🛒 *SELECTED ITEMS:*
${itemsList}

*Subtotal:* KSH ${subtotal.toLocaleString()}
*Delivery:* ${deliveryFee === 0 ? 'FREE (Over KSH 4,000)' : `KSH ${deliveryFee.toLocaleString()}`}
*Estimated Total:* KSH ${grandTotal.toLocaleString()}
------------------------------------
💳 *ATTACHED PAYMENT:*
${paymentDetails.join('\n')}

${notes ? `📝 *Special Instructions:* ${notes}\n------------------------------------\n` : ''}Please confirm stock dispatch and estimated delivery time. Thank you!`;
  } else if (messageType === 'price_list') {
    text = `Hello Cyden Distributors (${branch.name}),

I would like to request your official beverage price list for EABL beers, spirits, and wines.

${isB2B ? 'Type: B2B Commercial Outlet' : 'Type: Individual / Personal'}
${outletName ? `Outlet: ${outletName}\n` : ''}${customerName ? `Name: ${customerName}\n` : ''}${
      deliveryLocation ? `Location: ${deliveryLocation}\n` : ''
    }${resolvedMapsUrl ? `Pinned Location: ${resolvedMapsUrl}\n` : ''}`;
  } else if (messageType === 'bulk_order') {
    text = `Hello Cyden Distributors (${branch.name}),

I would like to place a ${isB2B ? 'bulk commercial order' : 'party / event order'} for direct delivery.

${outletName ? `Outlet/Event: ${outletName}\n` : ''}${customerName ? `Contact: ${customerName}\n` : ''}${
      deliveryLocation ? `Location: ${deliveryLocation}\n` : ''
    }${resolvedMapsUrl ? `Pinned Location: ${resolvedMapsUrl}\n` : ''}`;
  } else {
    // General Inquiry
    text = `Hello Cyden Distributors (${branch.name}),

I am inquiring from your official portal regarding beverage availability, bulk pricing, and delivery in Eldoret / North Rift.

${customerName ? `Name: ${customerName}\n` : ''}${outletName ? `Outlet: ${outletName}\n` : ''}${
      deliveryLocation ? `Location: ${deliveryLocation}\n` : ''
    }${resolvedMapsUrl ? `Pinned Map: ${resolvedMapsUrl}\n` : ''}${
      paymentMessage ? `Payment Ref: ${paymentMessage}\n` : ''
    }`;
  }

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text.trim())}`;
}
