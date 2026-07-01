import React, { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './layout/Navbar';
import Footer from './Footer';
import NotificationWidget from './UI/NotificationWidget';
import ToastContainer from './Toast';
import TranslationProgress from './TranslationProgress';
import WhatsAppButton from './WhatsAppButton';

const ADMIN_PATHS = ['/admin'];
const AUTH_PATHS  = ['/login', '/register'];

// The browser's own back/forward scroll restoration can fight React Router's
// push-state navigation. Hand scroll position entirely to the app, once.
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

export default function Layout({ children }) {
  const location = useLocation();
  const isAdmin  = ADMIN_PATHS.some(p => location.pathname.startsWith(p));
  const isAuth   = AUTH_PATHS.includes(location.pathname);

  // Jump to the top of the page on every route change — SPA navigation keeps the
  // previous scroll position by default, which reads as broken. Setting scrollTop
  // directly (rather than scrollTo/scrollIntoView) bypasses the global
  // `scroll-behavior: smooth` entirely. useLayoutEffect fires before the browser
  // paints the new page, and a follow-up rAF catches any late layout shift from
  // async content (images, AI results) that loads in a beat later and would
  // otherwise nudge the scroll position back down via scroll anchoring.
  useLayoutEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const raf = requestAnimationFrame(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
    return () => cancelAnimationFrame(raf);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#faf6ed] text-[#1a1a1a] selection:bg-[#0071c2] selection:text-white">
      {!isAdmin && !isAuth && <Navbar />}
      <main className={!isAdmin && !isAuth ? 'pt-[64px]' : ''}>{children}</main>
      {!isAdmin && !isAuth && <Footer />}
      {!isAdmin && !isAuth && <WhatsAppButton />}
      <NotificationWidget />
      <ToastContainer />
      <TranslationProgress />
    </div>
  );
}
