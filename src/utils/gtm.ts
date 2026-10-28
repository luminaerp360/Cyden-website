/**
 * Google Tag Manager (GTM) & Google Analytics 4 (GA4) Analytics Utility
 * Compliant with Master Playbook for SPA Virtual Pageviews & Event Tracking
 */

declare global {
  interface Window {
    dataLayer: Record<string, any>[];
    gtag?: (...args: any[]) => void;
  }
}

// Configurable measurement and container IDs (Can also be overridden via Vite env)
export const GTM_ID = import.meta.env.VITE_GTM_ID || 'GTM-5S7HMX4H';
export const GA4_ID = import.meta.env.VITE_GA4_ID || 'G-XXXXXXXXXX';

/**
 * Push arbitrary data payload to Google Tag Manager dataLayer safely
 */
export function pushToDataLayer(data: Record<string, any>): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
}

/**
 * Track SPA Virtual Pageviews across client-side route transitions
 */
export function trackGTMPageView(path: string, title?: string): void {
  if (typeof window === 'undefined') return;

  const pageTitle = title || document.title;
  const pageLocation = window.location.href;

  // Push to GTM dataLayer for custom GTM triggers
  pushToDataLayer({
    event: 'virtual_pageview',
    page_path: path,
    page_title: pageTitle,
    page_location: pageLocation,
  });

  // Direct gtag config update for GA4 measurement
  if (typeof window.gtag === 'function') {
    window.gtag('config', GA4_ID, {
      page_path: path,
      page_title: pageTitle,
      page_location: pageLocation,
    });
  }
}

/**
 * Track custom GTM and GA4 interactions (clicks, leads, purchases, modals)
 */
export function trackGTMEvent(eventName: string, params: Record<string, any> = {}): void {
  if (typeof window === 'undefined') return;

  pushToDataLayer({
    event: eventName,
    ...params,
  });

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

/**
 * Pre-configured helpers for key conversion goals
 */
export function trackWhatsAppLead(source: string, destinationPhone?: string): void {
  trackGTMEvent('contact_whatsapp', {
    lead_channel: 'WhatsApp',
    lead_source: source,
    destination: destinationPhone || '+254722400409',
  });
}

export function trackCatalogueFilter(category: string): void {
  trackGTMEvent('catalogue_filter', {
    selected_category: category,
  });
}

export function trackAddToCartEvent(productId: string, productName: string, price: number, quantity: number): void {
  trackGTMEvent('add_to_cart', {
    currency: 'KES',
    value: price * quantity,
    items: [
      {
        item_id: productId,
        item_name: productName,
        price: price,
        quantity: quantity,
      },
    ],
  });
}

export function trackBeginCheckoutEvent(checkoutType: 'retail' | 'wholesale', totalAmount: number, itemCount: number): void {
  trackGTMEvent('begin_checkout', {
    currency: 'KES',
    value: totalAmount,
    checkout_type: checkoutType,
    items_count: itemCount,
  });
}
