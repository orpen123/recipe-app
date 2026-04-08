import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getNotifications } from '../api/services';
import {
    Search, X, Menu, ChevronDown,
    Bookmark, Bell, Mail,
    Home, Info, Phone, UtensilsCrossed,
    PlusSquare, User, LogOut, ArrowRight,
} from 'lucide-react';

// ─── Variants ────────────────────────────────────────────────────────────────

const dropdownVariants = {
    hidden: { opacity: 0, y: -6, scale: 0.96 },
    visible: {
        opacity: 1, y: 0, scale: 1,
        transition: { type: 'spring', stiffness: 420, damping: 30 }
    },
    exit: {
        opacity: 0, y: -4, scale: 0.95,
        transition: { duration: 0.14 }
    },
};

const dropdownItemVariants = {
    hidden: { opacity: 0, x: -8 },
    visible: (i) => ({
        opacity: 1, x: 0,
        transition: { delay: i * 0.045, type: 'spring', stiffness: 400, damping: 28 },
    }),
};

const mobileMenuVariants = {
    hidden: { opacity: 0, y: -16 },
    visible: {
        opacity: 1, y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 28, staggerChildren: 0.055 }
    },
    exit: { opacity: 0, y: -12, transition: { duration: 0.18 } },
};

const mobileItemVariants = {
    hidden: { opacity: 0, x: -14 },
    visible: {
        opacity: 1, x: 0,
        transition: { type: 'spring', stiffness: 380, damping: 28 }
    },
};

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

const iconSpin = {
    hidden: { rotate: -90, opacity: 0 },
    visible: { rotate: 0, opacity: 1, transition: { duration: 0.15 } },
    exit: { rotate: 90, opacity: 0, transition: { duration: 0.15 } },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function Navbar() {
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const navRef = useRef(null);
    const searchInputRef = useRef(null);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    useEffect(() => {
        if (user) {
            getNotifications()
                .then(res => setUnreadCount(res.data.filter(n => !n.is_read).length))
                .catch(console.error);
        } else {
            setUnreadCount(0);
        }
    }, [user, location.pathname]);

    const closeAll = useCallback(() => {
        setMenuOpen(false);
        setDropdownOpen(null);
        setSearchOpen(false);
    }, []);

    useEffect(() => {
        const fn = (e) => { if (navRef.current && !navRef.current.contains(e.target)) closeAll(); };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, [closeAll]);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    useEffect(() => { closeAll(); }, [location.pathname]);

    useEffect(() => { if (searchOpen) searchInputRef.current?.focus(); }, [searchOpen]);

    const handleLogout = () => { logoutUser(); navigate('/login'); };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setSearchOpen(false);
        }
    };

    const toggleDropdown = (key) =>
        setDropdownOpen((prev) => (prev === key ? null : key));

    const isActive = (path) => location.pathname === path;

    // ─── Class helpers (green palette) ───────────────────────────────────────

    const desktopLinkCls = (path) =>
        `flex items-center gap-1.5 px-3 py-2 uppercase rounded-md text-[9px] lg:text-[10px]] font-bold transition-colors ${isActive(path)
            ? 'text-[#1F7A56] bg-[#E8F7F2]'
            : 'text-gray-600 hover:text-[#2A9D72] hover:bg-[#E8F7F2]'
        }`;

    const dropdownLinkCls = (path) =>
        `flex items-center gap-2.5 px-4 py-2.5 font-bold uppercase rounded-md text-[9px] lg:text-[10px] transition-colors ${isActive(path)
            ? 'text-[#1F7A56] bg-[#E8F7F2]'
            : 'text-gray-600 hover:text-[#1F7A56] hover:bg-[#E8F7F2]'
        }`;

    const mobileLinkCls = (path) =>
        `flex items-center gap-3 px-4 py-3 font-bold uppercase rounded-md text-[9px] lg:text-[10px] transition-colors ${isActive(path)
            ? 'bg-[#E8F7F2] text-[#1F7A56]'
            : 'text-gray-700 hover:bg-[#E8F7F2] hover:text-[#2A9D72]'
        }`;

    // ─── Data ─────────────────────────────────────────────────────────────

    const inlineLinks = [
        { to: '/', label: 'Home' },
        { to: '/about', label: 'About' },
        { to: '/contact', label: 'Contact' },
    ];

    const dropdownGroups = [
        {
            key: 'recipes',
            label: 'Recipes',
            links: [
                { to: '/', label: 'All Recipes', Icon: UtensilsCrossed },
                { to: '/create', label: 'Create Recipe', Icon: PlusSquare },
            ],
        },
        {
            key: 'community',
            label: 'Community',
            links: [
                { to: '/messages', label: 'Messages', Icon: Mail },
                { to: '/favorites', label: 'Saved Recipes', Icon: Bookmark },
            ],
        },
    ];

    const profileLinks = [
        { to: `/profile/${user?.id}`, label: 'My Profile', Icon: User },
        { to: '/favorites', label: 'Saved Recipes', Icon: Bookmark },
        { to: '/create', label: 'Create Recipe', Icon: PlusSquare },
        { to: '/messages', label: 'Messages', Icon: Mail },
    ];

    const mobileLinks = [
        { to: '/', label: 'Home', Icon: Home },
        { to: '/about', label: 'About', Icon: Info },
        { to: '/contact', label: 'Contact', Icon: Phone },
        { to: '/', label: 'All Recipes', Icon: UtensilsCrossed },
        { to: '/create', label: 'Create Recipe', Icon: PlusSquare },
        { to: '/favorites', label: 'Saved Recipes', Icon: Bookmark },
        { to: '/messages', label: 'Messages', Icon: Mail },
        { to: '/notifications', label: 'Notifications', Icon: Bell, badge: unreadCount > 0 },
    ];

    return (
        <nav
            ref={navRef}
            className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}
        >
            <div className='max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3 relative'>

                {/* Logo */}
                <Link to='/' onClick={closeAll} className='flex items-center gap-1.5'>
                    <motion.span
                        className='inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900 text-white'
                        whileHover={{ rotate: [0, -15, 15, -10, 0], transition: { duration: 0.5 } }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                        </svg>
                    </motion.span>
                    <span className='text-xl font-bold'>
                        <span className="text-[#2A9D72] italic">Matbakhy</span>
                    </span>
                </Link>

                {/* Desktop Left */}
                <div className='hidden md:flex  justify-end items-center gap-1 flex-1'>
                    {inlineLinks.map(({ to, label }) => (
                        <Link key={to + label} to={to} onClick={closeAll} className={desktopLinkCls(to)}>
                            {label}
                        </Link>
                    ))}
                    <div className='w-px h-4 bg-gray-200 mx-1.5' />
                    {dropdownGroups.map((group) => (
                        <div key={group.key} className='relative text-[9px] lg:text-[10px]'>
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={() => toggleDropdown(group.key)}
                                className={`flex items-center gap-1.5 px-3 py-2 font-bold uppercase rounded-md  transition-colors ${dropdownOpen === group.key ? 'text-[#1F7A56] bg-[#E8F7F2]' : 'text-gray-600 hover:text-[#2A9D72] hover:bg-[#E8F7F2]'}`}
                            >
                                {group.label}
                                <motion.span
                                    animate={{ rotate: dropdownOpen === group.key ? 180 : 0 }}
                                    transition={{ duration: 0.22 }}
                                    className='inline-block'
                                >
                                    <ChevronDown size={12} strokeWidth={2.5} />
                                </motion.span>
                            </motion.button>
                            <AnimatePresence>
                                {dropdownOpen === group.key && (
                                    <motion.div
                                        variants={dropdownVariants}
                                        initial='hidden' animate='visible' exit='exit'
                                        className='absolute top-full left-0 mt-2 bg-white shadow-2xl rounded-2xl py-2 w-52 border border-gray-100 z-50 origin-top-left overflow-hidden'
                                    >
                                        {group.links.map(({ to, label, Icon }, i) => (
                                            <motion.div key={to + label} custom={i} variants={dropdownItemVariants} initial='hidden' animate='visible'>
                                                <Link to={to} onClick={() => setDropdownOpen(null)} className={dropdownLinkCls(to)}>
                                                    <Icon size={14} strokeWidth={1.8} />
                                                    {label}
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* Desktop Right */}
                <div className='hidden md:flex items-center gap-1 flex-1 justify-end'>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.08 }}
                        onClick={() => setSearchOpen(!searchOpen)}
                        className={`p-2 rounded-xl transition-colors ${searchOpen ? 'text-[#1F7A56] bg-[#E8F7F2]' : 'text-gray-500 hover:text-[#2A9D72] hover:bg-[#E8F7F2]'}`}
                    >
                        <AnimatePresence mode='wait'>
                            {searchOpen ? (
                                <motion.span key='x' variants={iconSpin} initial='hidden' animate='visible' exit='exit' className='block'>
                                    <X size={16} />
                                </motion.span>
                            ) : (
                                <motion.span key='s' variants={iconSpin} initial='hidden' animate='visible' exit='exit' className='block'>
                                    <Search size={16} />
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>

                    {user ? (
                        <>
                            {[
                                { to: '/favorites', Icon: Bookmark, title: 'Saved' },
                                { to: '/notifications', Icon: Bell, title: 'Notifications', badge: unreadCount > 0 },
                                { to: '/messages', Icon: Mail, title: 'Messages' },
                            ].map(({ to, Icon, title, badge }) => (
                                <motion.div key={to} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Link to={to} title={title} className={`relative p-2 rounded-xl transition-colors block ${isActive(to) ? 'text-[#1F7A56] bg-[#E8F7F2]' : 'text-gray-500 hover:text-[#2A9D72] hover:bg-[#E8F7F2]'}`}>
                                        <Icon size={16} strokeWidth={1.8} />
                                        {badge && (
                                            <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
                                        )}
                                    </Link>
                                </motion.div>
                            ))}
                            <div className='relative'>
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => toggleDropdown('profile')}
                                    className={`flex items-center gap-1.5 px-2 py-1 rounded-xl transition-all ${dropdownOpen === 'profile' ? 'bg-[#E8F7F2]' : 'hover:bg-gray-50'}`}
                                >
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.username} className='w-7 h-7 rounded-full object-cover border-2' style={{ borderColor: '#2A9D72' }} />
                                    ) : (
                                        <div className='w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white' style={{ background: '#2A9D72' }}>
                                            {user.username?.[0]?.toUpperCase()}
                                        </div>
                                    )}
                                    <motion.span animate={{ rotate: dropdownOpen === 'profile' ? 180 : 0 }} transition={{ duration: 0.22 }} className='inline-block'>
                                        <ChevronDown size={12} className='text-gray-500' strokeWidth={2.5} />
                                    </motion.span>
                                </motion.button>
                                <AnimatePresence>
                                    {dropdownOpen === 'profile' && (
                                        <motion.div
                                            variants={dropdownVariants}
                                            initial='hidden' animate='visible' exit='exit'
                                            className='absolute top-full right-0 mt-2 bg-white shadow-2xl rounded-2xl py-2 w-56 border border-gray-100 z-50 origin-top-right overflow-hidden'
                                        >
                                            <div className='px-4 py-3 mb-1 border-b border-gray-100' style={{ background: 'linear-gradient(to right, #E8F7F2, #f0fbf7)' }}>
                                                <p className='text-xs font-bold text-gray-900 truncate'>{user.username}</p>
                                                <p className='text-xs text-gray-400 truncate mt-0.5'>{user.email}</p>
                                            </div>
                                            {profileLinks.map(({ to, label, Icon }, i) => (
                                                <motion.div key={to + label} custom={i} variants={dropdownItemVariants} initial='hidden' animate='visible'>
                                                    <Link to={to} onClick={() => setDropdownOpen(null)} className={dropdownLinkCls(to)}>
                                                        <Icon size={14} strokeWidth={1.8} />
                                                        {label}
                                                    </Link>
                                                </motion.div>
                                            ))}
                                            <div className='border-t border-gray-100 mt-1 pt-1'>
                                                <motion.button onClick={handleLogout} className='w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-500 font-medium transition-colors rounded-xl hover:bg-red-50'>
                                                    <LogOut size={14} strokeWidth={1.8} />
                                                    Logout
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    ) : (
                        <div className='flex items-center gap-2'>
                            <Link to='/login' className='text-gray-600 text-[10px] lg:text-[12px] hover:text-[#2A9D72] font-medium transition-colors px-3 py-2 rounded-xl hover:bg-[#E8F7F2]'>Login</Link>
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <Link to='/register' className='px-4 py-2 text-white text-[10px] lg:text-[12px] font-semibold rounded-xl transition-colors' style={{ background: '#2A9D72' }} onMouseEnter={e => e.currentTarget.style.background = '#1F7A56'} onMouseLeave={e => e.currentTarget.style.background = '#2A9D72'}>Join Free</Link>
                            </motion.div>
                        </div>
                    )}
                </div>

                {/* Mobile Icons */}
                <div className='md:hidden flex items-center gap-1'>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false); }} className='p-2 rounded-xl text-gray-500 hover:text-[#2A9D72] transition-colors'>
                        <AnimatePresence mode='wait'>
                            {searchOpen ? (
                                <motion.span key='x' variants={iconSpin} initial='hidden' animate='visible' exit='exit' className='block'><X size={20} /></motion.span>
                            ) : (
                                <motion.span key='s' variants={iconSpin} initial='hidden' animate='visible' exit='exit' className='block'><Search size={20} /></motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.9 }} className='flex items-center justify-center w-9 h-9' onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false); }}>
                        <AnimatePresence mode='wait'>
                            {menuOpen ? (
                                <motion.span key='x' variants={iconSpin} initial='hidden' animate='visible' exit='exit' className='block'><X size={22} className='text-gray-600' /></motion.span>
                            ) : (
                                <motion.span key='m' variants={iconSpin} initial='hidden' animate='visible' exit='exit' className='block'><Menu size={22} className='text-gray-600' /></motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>

                {/* ══ Desktop Search Overlay ══════════════════════════════════ */}
                <AnimatePresence>
                    {searchOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className='hidden md:block absolute inset-0 bg-white z-60 px-6'
                        >
                            <div className='h-full max-w-7xl mx-auto flex items-center gap-4'>
                                <form onSubmit={handleSearch} className='flex-1 flex items-center gap-3'>
                                    <Search size={18} className='text-gray-400' />
                                    <input
                                        ref={searchInputRef}
                                        type='text'
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder='Search recipes, ingredients, or cuisines…'
                                        className='flex-1 text-base outline-none bg-transparent text-gray-700 placeholder-gray-400'
                                    />
                                </form>
                                <button
                                    onClick={() => setSearchOpen(false)}
                                    className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                                >
                                    <X size={20} className='text-gray-500' />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ══ Mobile Search Bar ══════════════════════════════════════ */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className='md:hidden overflow-hidden border-t border-gray-100'
                    >
                        <form onSubmit={handleSearch} className='flex items-center gap-2 px-5 py-3'>
                            <Search size={15} className='text-gray-400 shrink-0' />
                            <input
                                ref={searchInputRef}
                                type='text'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder='Search recipes…'
                                className='flex-1 text-sm py-1 outline-none text-gray-700 placeholder-gray-400 bg-transparent'
                            />
                            {searchQuery && (
                                <button type='button' onClick={() => setSearchQuery('')}>
                                    <X size={15} className='text-gray-400' />
                                </button>
                            )}
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Backdrop & Menu (Rest of the original code remains same) */}
            <AnimatePresence>
                {menuOpen && (
                    <>
                        <motion.div
                            variants={backdropVariants}
                            initial='hidden' animate='visible' exit='exit'
                            className='md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40'
                            style={{ top: '56px' }}
                            onClick={() => setMenuOpen(false)}
                        />
                        <motion.div
                            variants={mobileMenuVariants}
                            initial='hidden' animate='visible' exit='exit'
                            className='md:hidden fixed left-0 right-0 bg-white shadow-2xl z-50 rounded-b-3xl'
                            style={{ top: '56px' }}
                        >
                            <div className='max-h-[calc(100vh-56px)] overflow-y-auto px-4 py-4 space-y-1'>
                                {user && (
                                    <motion.div variants={mobileItemVariants}>
                                        <Link to={`/profile/${user.id}`} onClick={() => setMenuOpen(false)} className='flex items-center gap-3 p-3.5 rounded-2xl mb-3' style={{ background: 'linear-gradient(to right, #E8F7F2, #f0fbf7)' }}>
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.username} className='w-10 h-10 rounded-xl object-cover border-2' style={{ borderColor: '#2A9D72' }} />
                                            ) : (
                                                <div className='w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm' style={{ background: '#2A9D72' }}>{user.username?.[0]?.toUpperCase()}</div>
                                            )}
                                            <div className='min-w-0 flex-1'>
                                                <p className='text-sm font-bold text-gray-900 truncate'>{user.username}</p>
                                                <p className='text-xs text-gray-400 truncate'>{user.email}</p>
                                            </div>
                                            <ArrowRight size={14} style={{ color: '#2A9D72' }} />
                                        </Link>
                                    </motion.div>
                                )}
                                {mobileLinks.map(({ to, label, Icon, badge }, i) => (
                                    <motion.div key={i} variants={mobileItemVariants}>
                                        <Link to={to} onClick={() => setMenuOpen(false)} className={mobileLinkCls(to)}>
                                            <div className="relative">
                                                <Icon size={17} strokeWidth={1.8} />
                                                {badge && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-200" />}
                                            </div>
                                            {label}
                                            {isActive(to) && <span className='ml-auto w-2 h-2 rounded-full' style={{ background: '#2A9D72' }} />}
                                        </Link>
                                    </motion.div>
                                ))}
                                <div className='h-px bg-gray-100 my-2' />
                                <motion.div variants={mobileItemVariants}>
                                    {user ? (
                                        <button onClick={handleLogout} className='w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-red-500 font-medium hover:bg-red-50'>
                                            <LogOut size={17} strokeWidth={1.8} /> Logout
                                        </button>
                                    ) : (
                                        <div className='flex flex-col gap-2 pt-1'>
                                            <Link to='/login' onClick={() => setMenuOpen(false)} className='w-full text-center py-3 rounded-2xl text-sm font-semibold border' style={{ color: '#2A9D72', borderColor: '#2A9D72', background: '#E8F7F2' }}>Login</Link>
                                            <Link to='/register' onClick={() => setMenuOpen(false)} className='w-full text-center py-3 rounded-2xl text-sm font-semibold text-white' style={{ background: '#2A9D72' }}>Join Free</Link>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
}
