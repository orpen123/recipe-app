import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import RecipeCard from '../components/RecipeCard';
import { getAllRecipes } from '../api/services';
import img from '../assets/home-bg.jpg';

const categories = [
    {
        label: 'Tous',
        value: 'all',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
    },
    {
        label: 'Plats',
        value: 'Plats',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M3 11l1-4h16l1 4" /><rect x="2" y="11" width="20" height="3" rx="1" /><path d="M5 14v5a1 1 0 001 1h12a1 1 0 001-1v-5" /><path d="M9 9V7a3 3 0 016 0v2" /></svg>
    },
    {
        label: 'Pain',
        value: 'Pain',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M5 3h14a1 1 0 011 1v3a7 7 0 01-7 7 7 7 0 01-7-7V4a1 1 0 011-1z" /><path d="M12 13v8" /><path d="M8 21h8" /></svg>
    },
    {
        label: 'Sucré',
        value: 'Sucré',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M12 2a4 4 0 014 4c0 1.5-.8 2.8-2 3.5V21H10V9.5A4 4 0 0112 2z" /><path d="M8 21h8" /></svg>
    },
    {
        label: 'Salades',
        value: 'Salades',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M12 2C8 2 5 5 5 8c0 4 4 6 7 10 3-4 7-6 7-10 0-3-3-6-7-6z" /><circle cx="12" cy="8" r="2" /></svg>
    },
    {
        label: 'Soupes',
        value: 'Soupes',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M4 11c0 4.4 3.6 8 8 8s8-3.6 8-8H4z" /><path d="M4 11C4 7 6 4 12 4s8 3 8 7" /><path d="M12 19v2" /></svg>
    },
    {
        label: 'Street Food',
        value: 'Street Food',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><rect x="3" y="9" width="18" height="11" rx="2" /><path d="M8 9V7a4 4 0 018 0v2" /><path d="M12 14v2" /></svg>
    },
    {
        label: 'Boissons',
        value: 'Boissons',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M18 8h1a4 4 0 010 8h-1" /><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" /><path d="M6 1v3M10 1v3M14 1v3" /></svg>
    },
    {
        label: 'Ramadan',
        value: 'Ramadan',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" /><path d="M12 11a2 2 0 100-4 2 2 0 000 4z" /></svg>
    },
    {
        label: 'Occasions',
        value: 'Occasions',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" /></svg>
    },
    {
        label: 'Autres',
        value: 'Autres',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><circle cx="12" cy="12" r="3" /><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
    },
];


export default function Home() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';

    useEffect(() => {
        getAllRecipes()
            .then((res) => {
                setRecipes(res.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = recipes.filter((r) => {
        const matchesCategory = activeCategory === 'all' || r.category?.toLowerCase() === activeCategory.toLowerCase();
        const matchesSearch = !searchQuery || r.title?.toLowerCase().includes(searchQuery.toLowerCase())
            || r.description?.toLowerCase().includes(searchQuery.toLowerCase())
            || r.username?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-white">

            {/* Hero Banner */}
            <div className="relative mx-2 sm:mx-4 mt-[12vh] rounded-2xl overflow-hidden h-56 sm:h-72 md:h-96">
                <img
                    src={img}
                    alt="Hero"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 md:px-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className="text-white text-2xl sm:text-4xl md:text-6xl font-black leading-tight mb-2"
                    >
                        <span className="text-white">Easy Home</span><br />Cooking
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                        className="text-white/70 text-xs sm:text-sm md:text-lg mb-4 sm:mb-6"
                    >
                        Discover amazing recipes from our community
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.28 }}
                    >
                        <Link
                            to="/register"
                            className="inline-block bg-white text-gray-900 font-semibold text-xs sm:text-sm px-5 sm:px-7 py-2.5 sm:py-3 rounded-full w-fit hover:bg-gray-100 transition-colors shadow-lg"
                        >
                            JOIN US
                        </Link>
                    </motion.div>
                </div>
            </div>

            {/* Search result notice */}
            {searchQuery && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 md:px-8 mt-6"
                >
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>🔍</span>
                        <span>Results for <strong>"{searchQuery}"</strong></span>
                        <span className="text-gray-400">· {filtered.length} found</span>
                    </div>
                </motion.div>
            )}

            {/* Categories */}
            <div className="px-4 md:px-8 mt-8">
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => setActiveCategory(cat.value)}
                            className={`flex items-center cursor-pointer gap-2 px-4 py-2.5 rounded-full border shrink-0 transition-all duration-150
                            ${activeCategory === cat.value
                                    ? 'bg-[#2A9D72] border-[#2A9D72] text-white shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-800 hover:border-[#2A9D72] hover:bg-[#E8F7F2]'
                                }`}
                        >
                            {cat.icon}
                            <span className="text-[13px] font-medium whitespace-nowrap">{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Recipes Grid */}
            <div className="px-4 md:px-8 mt-8 pb-16">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-semibold text-[#2A9D72]">
                        {searchQuery ? 'Search Results' : 'Latest Recipes'}
                        {!loading && (
                            <span className="ml-2 text-sm font-normal text-gray-400">({filtered.length})</span>
                        )}
                    </h2>
                    <Link to="/create" className="text-sm text-[#2A9D72] font-semibold hover:underline">
                        + Add Recipe
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20 text-gray-400"
                    >
                        <div className="text-5xl mb-3">
                            <motion.span
                                className='inline-flex items-center cursor-pointer justify-center w-14 h-14 rounded-2xl bg-gray-100 text-gray-400'
                                whileHover={{ rotate: [0, -15, 15, -10, 0], transition: { duration: 0.5 } }}
                            >
                                🍽️
                            </motion.span>
                        </div>
                        <p className="font-medium mb-1">No recipes found in this category yet.</p>
                        {activeCategory !== 'all' && (
                            <button
                                onClick={() => setActiveCategory('all')}
                                className="text-sm font-bold hover:underline mt-2"
                                style={{ color: '#2A9D72' }}
                            >
                                View all recipes
                            </button>
                        )}
                        <Link to="/create" className="mt-3 inline-block text-[#2A9D72] font-semibold hover:underline text-sm">
                            Be the first to add one!
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {filtered.map((recipe, i) => (
                            <motion.div
                                key={recipe.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04, duration: 0.4 }}
                            >
                                <RecipeCard recipe={recipe} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}