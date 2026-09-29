/**
 * Cyden Distributors Limited — Main Application Entry Point
 * EABL Gold Distributor (2024), Eldoret, Kenya
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AgeGateModal, { AGE_GATE_STORAGE_KEY } from './components/AgeGateModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import WhatsAppOrderModal from './components/WhatsAppOrderModal';
import CartToast from './components/CartToast';
import FloatingWhatsAppButton from './components/FloatingWhatsAppButton';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import CataloguePage from './pages/CataloguePage';
import BranchesPage from './pages/BranchesPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';
import { Product } from './types';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import MyOrdersModal from './components/MyOrdersModal';

function CydenDistributorsApp() {
  const { openCheckout, addToCart } = useCart();

  // Auth & Orders Modal States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);

  // Age Verification State
  const [isAgeVerified, setIsAgeVerified] = useState<boolean>(false);
  const [isCheckingAge, setIsCheckingAge] = useState<boolean>(true);

  // Routing State
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [selectedCatalogueCategory, setSelectedCatalogueCategory] = useState<string>('All');

  // Check initial age gate verification in localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AGE_GATE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.verified && parsed.expiresAt && Date.now() < parsed.expiresAt) {
          setIsAgeVerified(true);
        }
      }
    } catch (e) {
      console.warn('Could not read age verification from storage:', e);
    } finally {
      setIsCheckingAge(false);
    }
  }, []);

  // Sync route with window.location
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname || '/';
      setCurrentRoute(path);
    };

    // Initial path detection
    if (window.location.pathname && window.location.pathname !== '/') {
      setCurrentRoute(window.location.pathname);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Dynamic Route-Aware SEO & Meta Updates
  useEffect(() => {
    let title = 'Cyden Distributors — Official EABL Gold Distributor | Eldoret, Kenya';
    let description =
      'Official EABL Gold Distributor (2024) in Eldoret, Kenya. Supplying 600+ outlets with genuine beer, spirits, wines, Tusker, Guinness, Johnnie Walker, and Smirnoff across the North Rift region.';

    if (currentRoute === '/catalogue') {
      title =
        selectedCatalogueCategory && selectedCatalogueCategory !== 'All'
          ? `${selectedCatalogueCategory} Catalogue — Cyden Distributors | Eldoret`
          : 'Beverage Catalogue & Fast Delivery — Cyden Distributors | Eldoret & Iten';
      description =
        'Order genuine EABL beers, whiskies, gins, vodkas, and wines with same-day delivery and M-Pesa STK payment across Eldoret, Iten, and North Rift Kenya.';
    } else if (currentRoute === '/branches') {
      title = 'Locations & Depots (Eldoret & Iten) — Cyden Distributors Limited';
      description =
        'Explore physical warehouse locations for Cyden Distributors at Rupa Godowns Eldoret and Sitet Building Iten. Exact GPS coordinates, maps, and direct dispatch.';
    } else if (currentRoute === '/about') {
      title = 'About Us & EABL Gold Award — Cyden Distributors Limited';
      description =
        'Discover Cyden Distributors Limited, founded in 2013 and crowned EABL Gold Distributor of the Year 2024. Trusted partner to 600+ hospitality and retail outlets.';
    } else if (currentRoute === '/contact') {
      title = 'Contact & Wholesale Supply Inquiries — Cyden Distributors Limited';
      description =
        'Contact Cyden Distributors central office in Eldoret and Iten sub-depot for wholesale beverage orders, commercial bar accounts, and direct dispatch.';
    }

    // Update document title
    document.title = title;

    // Helper to update meta tag content
    const updateMetaTag = (selector: string, content: string, attribute = 'content') => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        if (selector.startsWith('meta[name="')) {
          const name = selector.match(/name="([^"]+)"/)?.[1];
          if (name) element.setAttribute('name', name);
        } else if (selector.startsWith('meta[property="')) {
          const prop = selector.match(/property="([^"]+)"/)?.[1];
          if (prop) element.setAttribute('property', prop);
        }
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, content);
    };

    updateMetaTag('meta[name="description"]', description);
    updateMetaTag('meta[property="og:title"]', title);
    updateMetaTag('meta[property="og:description"]', description);
    updateMetaTag('meta[property="og:url"]', window.location.href);
    updateMetaTag('meta[name="twitter:title"]', title);
    updateMetaTag('meta[name="twitter:description"]', description);

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', window.location.href);
    }
  }, [currentRoute, selectedCatalogueCategory]);

  const navigateTo = useCallback((route: string, categoryFilter?: string) => {
    setCurrentRoute(route);
    if (categoryFilter) {
      setSelectedCatalogueCategory(categoryFilter);
    }
    // Update browser history without full page reload
    if (window.location.pathname !== route) {
      window.history.pushState({}, '', route);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // One Unified Checkout Handler for Retail & Wholesale orders
  const handleOpenOrderModal = (product?: Product) => {
    if (product) {
      addToCart(product, 1);
    }
    openCheckout('wholesale');
  };

  const handleResetAgeGate = () => {
    try {
      localStorage.removeItem(AGE_GATE_STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
    setIsAgeVerified(false);
  };

  // Render current view
  const renderCurrentView = () => {
    switch (currentRoute) {
      case '/':
      case '':
        return (
          <HomePage
            onNavigate={navigateTo}
            onOpenOrderModal={handleOpenOrderModal}
          />
        );
      case '/about-us':
      case '/about':
        return (
          <AboutPage
            onNavigate={navigateTo}
            onOpenOrderModal={handleOpenOrderModal}
          />
        );
      case '/catalogue':
      case '/products':
        return (
          <CataloguePage
            initialCategory={selectedCatalogueCategory}
            onNavigate={navigateTo}
            onOpenOrderModal={handleOpenOrderModal}
          />
        );
      case '/branches':
      case '/locations':
        return (
          <BranchesPage
            onNavigate={navigateTo}
            onOpenOrderModal={handleOpenOrderModal}
          />
        );
      case '/contact-us':
      case '/contact':
        return <ContactPage onNavigate={navigateTo} />;
      default:
        return <NotFoundPage onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#222222] selection:bg-[#3AA88C]/30 selection:text-[#1B3E6F]">
      {/* 1. Mandatory Site-Wide Age Gate (Blocks the site until verified 18+) */}
      {!isCheckingAge && !isAgeVerified && (
        <AgeGateModal onVerified={() => setIsAgeVerified(true)} />
      )}

      {/* 2. Global Header / Navigation */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        onOpenOrderModal={() => handleOpenOrderModal()}
        onOpenAuth={(mode) => {
          setAuthMode(mode || 'login');
          setIsAuthOpen(true);
        }}
        onOpenMyOrders={() => setIsMyOrdersOpen(true)}
      />

      {/* 3. Main Page Body */}
      <main className="flex-1 w-full relative" id="main-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRoute}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full"
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 4. Global Footer */}
      <Footer
        onNavigate={navigateTo}
        onResetAgeGate={handleResetAgeGate}
      />

      {/* 5. Shopping Cart Slide-over Drawer */}
      <CartDrawer onNavigateToCatalogue={() => navigateTo('/catalogue')} />

      {/* 6. Single Unified Cyden Distributors Direct Checkout Modal */}
      <CheckoutModal
        onOpenAuth={(mode) => {
          setAuthMode(mode || 'login');
          setIsAuthOpen(true);
        }}
      />

      {/* 6b. Interactive WhatsApp Order & Logistics Modal (B2B/Personal, Pinned GPS, Payment Msg) */}
      <WhatsAppOrderModal />

      {/* 6c. User Authentication Modal (Login / Signup) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />

      {/* 6d. Customer Orders & History Modal */}
      <MyOrdersModal
        isOpen={isMyOrdersOpen}
        onClose={() => setIsMyOrdersOpen(false)}
        onOpenCatalogue={() => navigateTo('/catalogue')}
      />

      {/* 7. Interactive Toast Notification when items added */}
      <CartToast />

      {/* 8. Floating WhatsApp Direct Order & Inquiries Widget (Bottom Right) */}
      <FloatingWhatsAppButton />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <CydenDistributorsApp />
      </CartProvider>
    </AuthProvider>
  );
}
