import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getSavedRecipes, unsaveRecipe } from '../api/services';

// ─── Variants ─────────────────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 110, damping: 16 },
  },
  exit: {
    opacity: 0, scale: 0.92, y: -12,
    transition: { duration: 0.28, ease: 'easeIn' },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-3xl overflow-hidden border border-gray-100">
      <div className="bg-gray-100 h-44 w-full" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-16" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  );
}

// ─── Recipe Card ──────────────────────────────────────────────────────────────
function RecipeCard({ recipe, onUnsave, index }) {
  const [hovered, setHovered] = useState(false);
  const [unsaving, setUnsaving] = useState(false);

  const handleUnsave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (unsaving) return;
    setUnsaving(true);
    try {
      await unsaveRecipe(recipe.id);
      onUnsave(recipe.id);
    } catch (err) {
      console.error(err);
    } finally {
      setUnsaving(false);
    }
  };

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      layout
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-[#2A9D72]/30 hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      <Link to={`/recipe/${recipe.id}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden h-44 sm:h-48 bg-gradient-to-br from-emerald-50 to-amber-50">
          {recipe.image ? (
            <motion.img
              src={recipe.image}
              alt={recipe.title}
              animate={{ scale: hovered ? 1.06 : 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>
          )}

          {/* Gradient overlay on hover */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"
          />

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/90 backdrop-blur-sm text-[#2A9D72] px-2.5 py-1 rounded-full border border-[#E8F7F2]">
              {recipe.category || 'Recipe'}
            </span>
          </div>

          {/* Unsave button */}
          <motion.button
            animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={handleUnsave}
            disabled={unsaving}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/50 hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm"
            title="Remove from saved"
          >
            {unsaving ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full"
              />
            ) : (
              <motion.span whileHover={{ scale: 1.2 }} className="text-amber-500 text-sm leading-none">
                🔖
              </motion.span>
            )}
          </motion.button>

          {/* Time badge on hover */}
          {totalTime > 0 && (
            <motion.div
              animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 6 }}
              transition={{ duration: 0.25 }}
              className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full"
            >
              <span className="text-xs">⏱</span>
              {totalTime} min
            </motion.div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-black text-gray-900 text-sm sm:text-base leading-snug mb-1.5 line-clamp-2 group-hover:text-[#2A9D72] transition-colors">
            {recipe.title}
          </h3>

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400 font-medium">
              by{' '}
              <span className="text-[#2A9D72] font-bold">{recipe.username || 'Chef'}</span>
            </p>
            {recipe.servings && (
              <span className="text-[10px] text-gray-400 font-medium">
                🍽 {recipe.servings} servings
              </span>
            )}
          </div>

          {/* Mini meta row */}
          {(recipe.prep_time || recipe.cook_time) && (
            <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-gray-50">
              {recipe.prep_time && (
                <span className="text-[11px] text-gray-400 font-medium">
                  <span className="text-gray-600 font-bold">{recipe.prep_time}m</span> prep
                </span>
              )}
              {recipe.cook_time && (
                <span className="text-[11px] text-gray-400 font-medium">
                  <span className="text-gray-600 font-bold">{recipe.cook_time}m</span> cook
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-24 px-4 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="text-7xl mb-6"
      >
        🔖
      </motion.div>
      <h2 className="text-2xl font-black text-gray-900 mb-2">No saved recipes yet</h2>
      <p className="text-gray-400 text-sm max-w-xs mb-8 leading-relaxed">
        Browse recipes and tap the bookmark icon to save your favorites here.
      </p>
      <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
        <Link
          to="/"
          className="text-white font-bold px-6 py-3 rounded-2xl text-sm transition-colors shadow-lg"
          style={{ background: '#2A9D72', boxShadow: '0 8px 20px -4px rgba(42,157,114,0.25)' }}
        >
          Explore Recipes
        </Link>
      </motion.div>
    </motion.div>
  );
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────
function FilterBar({ categories, active, onChange }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {['All', ...categories].map((cat) => (
        <motion.button
          key={cat}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onChange(cat)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border ${
            active === cat
              ? 'text-white border-transparent shadow-md'
              : 'bg-white text-gray-500 border-gray-200 hover:border-[#2A9D72]/40 hover:text-[#2A9D72]'
          }`}
          style={active === cat ? { background: '#2A9D72', borderColor: '#2A9D72' } : {}}
        >
          {cat}
        </motion.button>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Favorites() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return navigate('/login');
    getSavedRecipes()
      .then((res) => setRecipes(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleUnsave = (recipeId) => {
    setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
  };

  // Unique categories from saved recipes
  const categories = [...new Set(recipes.map((r) => r.category).filter(Boolean))];

  // Filtered list
  const filtered = recipes.filter((r) => {
    const matchesCategory = activeFilter === 'All' || r.category === activeFilter;
    const matchesSearch = r.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#fafaf8] pt-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-20">

        {/* ── Header ── */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🔖</span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Saved Recipes</h1>
            {!loading && recipes.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                className="text-xs font-black px-2.5 py-1 rounded-full"
                style={{ background: '#E8F7F2', color: '#2A9D72' }}
              >
                {recipes.length}
              </motion.span>
            )}
          </div>
          <p className="text-gray-400 text-sm ml-9">Your personal recipe collection</p>
        </motion.div>

        {/* ── Search + Filter ── */}
        {!loading && recipes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-7 space-y-3"
          >
            {/* Search */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search your saved recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder:text-gray-400"
                style={{ '--tw-ring-color': '#2A9D72' }}
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-200 rounded-full text-gray-500 text-xs flex items-center justify-center hover:bg-gray-300 transition-colors"
                  >
                    ✕
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Category filter */}
            {categories.length > 1 && (
              <FilterBar
                categories={categories}
                active={activeFilter}
                onChange={setActiveFilter}
              />
            )}
          </motion.div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : recipes.length === 0 ? (
          <EmptyState />
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-500 font-semibold text-sm">No recipes match your search</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveFilter('All'); }}
              className="mt-4 text-sm font-bold hover:underline"
              style={{ color: '#2A9D72' }}
            >
              Clear filters
            </button>
          </motion.div>
        ) : (
          <>
            {/* Results count */}
            {(searchQuery || activeFilter !== 'All') && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-gray-400 font-medium mb-4"
              >
                Showing {filtered.length} of {recipes.length} recipes
              </motion.p>
            )}

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((recipe, index) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onUnsave={handleUnsave}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}