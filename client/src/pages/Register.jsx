import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { register, login } from '../api/services';
import { useAuth } from '../context/AuthContext';
import registerBg from '../assets/registerBg.jpg';

const panelVariants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

const imageVariants = {
  hidden: { scale: 1.15 },
  visible: {
    scale: 1,
    transition: { duration: 8, ease: 'easeOut' },
  },
};

const overlayTextVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.6, duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

const formContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { y: 24, opacity: 0, filter: 'blur(4px)' },
  visible: {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 120, damping: 14 },
  },
};

const errorVariants = {
  hidden: { opacity: 0, height: 0, y: -8, scale: 0.97 },
  visible: {
    opacity: 1,
    height: 'auto',
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    height: 0,
    y: -8,
    scale: 0.97,
    transition: { duration: 0.2 },
  },
};

const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.015, transition: { duration: 0.2 } },
  tap: { scale: 0.975, transition: { duration: 0.1 } },
  loading: {
    scale: [1, 1.01, 1],
    transition: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' },
  },
};

export default function Register() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(form);
      const res = await login({ email: form.email, password: form.password });
      loginUser(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">

      <motion.div
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        <motion.img
          variants={imageVariants}
          initial="hidden"
          animate="visible"
          src={registerBg}
          alt="Culinary community"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-12 xl:p-20">
          <motion.div
            variants={overlayTextVariants}
            initial="hidden"
            animate="visible"
            className="max-w-md"
          >
            <motion.h2
              className="text-white text-4xl xl:text-5xl font-black mb-4 leading-tight"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              Join our<br />community! 🍳
            </motion.h2>
            <motion.p
              className="text-white/85 text-lg xl:text-xl font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.7 }}
            >
              Share recipes, get inspired, and cook together with foodies worldwide.
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col justify-center px-4 min-[320px]:px-5 py-12 min-[320px]:py-20 sm:px-12 lg:pb-16 bg-white lg:bg-gray-50">
        <motion.div
          variants={formContainerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md mx-auto"
        >
          
          <motion.div variants={itemVariants} className="mb-8 lg:mb-12">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xl font-bold text-gray-900"
            >
              <motion.span
                className='inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900 text-white'
                whileHover={{ rotate: [0, -15, 15, -10, 0], transition: { duration: 0.5 } }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </motion.span>
              <span className="text-[#2A9D72] italic">Matbakhy</span>
            </Link>
          </motion.div>

          {}
          <motion.div variants={itemVariants} className="mb-5 min-[320px]:mb-7">
            <h1 className="text-xl min-[320px]:text-2xl sm:text-4xl font-black text-gray-900 mb-1.5">
              Create Account
            </h1>
            <p className="text-gray-500 text-xs min-[320px]:text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold transition-colors underline-offset-2 hover:underline"
                style={{ color: '#2A9D72' }}
              >
                Sign in here
              </Link>
            </p>
          </motion.div>

          {}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                variants={errorVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mb-5 p-3.5 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-xl flex items-center gap-2.5"
              >
                <span className="text-base shrink-0">⚠️</span>
                <p className="font-medium leading-snug">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {}
          <form onSubmit={handleSubmit} className="space-y-4">

            {}
            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="block text-xs min-[320px]:text-sm font-bold text-gray-700">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="chef_john"
                required
                className="w-full px-3 min-[320px]:px-4 py-2.5 min-[320px]:py-3 rounded-xl border border-gray-200 outline-none transition-all text-xs min-[320px]:text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2A9D72] focus:ring-4 focus:ring-[#2A9D72]/10"
              />
            </motion.div>

            {}
            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="block text-xs min-[320px]:text-sm font-bold text-gray-700">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="chef@matbakhy.com"
                required
                className="w-full px-3 min-[320px]:px-4 py-2.5 min-[320px]:py-3 rounded-xl border border-gray-200 outline-none transition-all text-xs min-[320px]:text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2A9D72] focus:ring-4 focus:ring-[#2A9D72]/10"
              />
            </motion.div>

            {}
            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="block text-xs min-[320px]:text-sm font-bold text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-3 min-[320px]:px-4 py-2.5 min-[320px]:py-3 pr-11 rounded-xl border border-gray-200 outline-none transition-all text-xs min-[320px]:text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2A9D72] focus:ring-4 focus:ring-[#2A9D72]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
            </motion.div>

            {}
            <motion.button
              variants={buttonVariants}
              animate={loading ? 'loading' : 'idle'}
              whileHover={loading ? undefined : 'hover'}
              whileTap={loading ? undefined : 'tap'}
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer mt-2 text-white font-black py-3 min-[320px]:py-3.5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2 text-xs min-[320px]:text-sm sm:text-base"
              style={{
                background: '#2A9D72',
                boxShadow: '0 10px 20px -6px rgba(42, 157, 114, 0.3)'
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#1F7A56'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#2A9D72'; }}
            >
              {loading ? (
                <>
                  <motion.svg
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    className="h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </motion.svg>
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account →</span>
              )}
            </motion.button>
          </form>

          {}
          <motion.p variants={itemVariants} className="mt-4 text-center text-xs text-gray-400">
            By creating an account, you agree to our{' '}
            <span className="font-semibold text-gray-500 cursor-pointer hover:text-gray-700">Terms of Service</span>
          </motion.p>

          {}
          <motion.div
            variants={itemVariants}
            className="mt-8 pt-6 border-t border-gray-100 text-center lg:hidden"
          >
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
              © 2026 Matbakhy
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
