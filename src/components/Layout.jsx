import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './layout/Navbar';
import Footer from './Footer';
import NotificationWidget from './UI/NotificationWidget';
import ToastContainer from './Toast';

const ADMIN_PATHS = ['/admin'];
const AUTH_PATHS  = ['/login', '/register'];

export default function Layout({ children }) {
  const location = useLocation();
  const isAdmin  = ADMIN_PATHS.some(p => location.pathname.startsWith(p));
  const isAuth   = AUTH_PATHS.includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] selection:bg-[#0071c2] selection:text-white">
      {!isAdmin && !isAuth && <Navbar />}
      <main className={!isAdmin && !isAuth ? 'pt-[64px]' : ''}>{children}</main>
      {!isAdmin && !isAuth && <Footer />}
      <NotificationWidget />
      <ToastContainer />
    </div>
  );
}
