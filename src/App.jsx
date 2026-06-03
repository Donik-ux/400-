import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout          from './components/Layout';
import DisclaimerModal from './components/DisclaimerModal';
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/ProtectedRoute';
import Home            from './pages/Home';
import Planner         from './pages/Planner';
import WhereToGo       from './pages/WhereToGo';
import Tools           from './pages/Tools';
import Flights         from './pages/Flights';
import BerlinTrip      from './pages/BerlinTrip';
import ExoticTours     from './pages/ExoticTours';
import TourDetail      from './pages/TourDetail';
import HotTours        from './pages/HotTours';
import Wishlist        from './pages/Wishlist';
import Login           from './pages/Login';
import Register        from './pages/Register';
import MyBookings      from './pages/MyBookings';
import Dashboard       from './pages/Dashboard';
import TripPlan        from './pages/TripPlan';
import MyPlans         from './pages/MyPlans';
import Profile         from './pages/Profile';
import AdminDashboard  from './pages/admin/AdminDashboard';
import TermsOfUse     from './pages/TermsOfUse';
import PrivacyPolicy  from './pages/PrivacyPolicy';
import CookiePolicy   from './pages/CookiePolicy';
import NotFound       from './pages/NotFound';
function App() {
  return (
    <Router>
      <DisclaimerModal />
      <Layout>
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/planner"     element={<Planner />} />
          <Route path="/where-to-go" element={<WhereToGo />} />
          <Route path="/tools"       element={<Tools />} />
          <Route path="/flights"     element={<Flights />} />
          <Route path="/berlin-trip" element={<BerlinTrip />} />
          <Route path="/exotic-tours" element={<ExoticTours />} />
          <Route path="/exotic-tours/:id" element={<TourDetail />} />
          <Route path="/hot-tours"   element={<HotTours />} />
          <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/wishlist"    element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/my-plans"    element={<MyPlans />} />
          <Route path="/trip-plan"   element={<TripPlan />} />
          <Route path="/checkout"    element={<TripPlan />} />
          <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/terms"   element={<TermsOfUse />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
