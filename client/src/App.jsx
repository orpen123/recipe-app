import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { motion } from 'framer-motion';

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-400">Loading...</div>;
  if (user) return <Navigate to="/" replace />;
  return children;
}

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RecipeDetail from './pages/RecipeDetail';
import CreateRecipe from './pages/CreateRecipe';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Navbar from './components/Navbar';
import Favorites from './pages/Favorites';

import About from './pages/About';
import Contact from './pages/Contact';
import Notifications from './pages/Notifications';
import Footer from './components/Footer';
import { NotificationProvider } from './context/NotificationContext';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRecipes from './pages/admin/AdminRecipes';

function NotFound() {
  return (
    <div className="min-h-screen bg-[#fafaf8] pt-14 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-sm"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="text-8xl mb-6"
        >
          🍽️
        </motion.div>
        <h1 className="text-4xl font-black text-gray-900 mb-2">404</h1>
        <p className="text-lg font-semibold text-gray-600 mb-1">Page not found</p>
        <p className="text-sm text-gray-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-sm transition-all"
          style={{ background: '#2A9D72', boxShadow: '0 8px 20px -4px rgba(42,157,114,0.3)' }}
        >
          ← Back to Home
        </Link>
      </motion.div>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NotificationProvider>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
              {}
              <Route path="/recipe/:idAndSlug" element={<RecipeDetail />} />

              <Route path="/profile/:identifier" element={<Profile />} />
              <Route path="/favorites" element={<Favorites />} />

              {}
              <Route path="/create" element={<ProtectedRoute><CreateRecipe /></ProtectedRoute>} />
              {}
              {}
              <Route path="/edit/:idAndSlug" element={<ProtectedRoute><CreateRecipe /></ProtectedRoute>} />

              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/messages/:userId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

              {}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="recipes" element={<AdminRecipes />} />
              </Route>

              {}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
        </NotificationProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}