import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getSavedRecipes, unsaveRecipe } from '../api/services';

const BookmarkIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const BookmarkFilledIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const SearchIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ClockIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const PlateIcon = ({ className = 'w-8 h-8' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11l1-4h16l1 4" /><rect x="2" y="11" width="20" height="3" rx="1" /><path d="M5 14v5a1 1 0 001 1h12a1 1 0 001-1v-5" />
  </svg>
);

const UsersIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

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
        {}
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

          {}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"
          />

          {}
          <div className="absolute top-3 left-3">
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/90 backdrop-blur-sm text-[#2A9D72] px-2.5 py-1 rounded-full border border-[#E8F7F2]">
              {recipe.category || 'Recipe'}
            </span>
          </div>

          {}
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
              <motion.span whileHover={{ scale: 1.2 }} className="text-emerald-600">
                <BookmarkFilledIcon className="w-4 h-4" />
              </motion.span>
            )}
          </motion.button>

          {}
          {totalTime > 0 && (
            <motion.div
              animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 6 }}
              transition={{ duration: 0.25 }}
              className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full"
            >
              <ClockIcon className="w-3.5 h-3.5 text-emerald-600" />
              {totalTime} min
            </motion.div>
          )}
        </div>

        {}
        <div className="p-3 min-[320px]:p-4">
          <h3 className="font-black text-gray-900 text-[11px] min-[320px]:text-sm sm:text-base leading-snug mb-1.5 line-clamp-2 group-hover:text-[#2A9D72] transition-colors">
            {recipe.title}
          </h3>

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400 font-medium">
              by{' '}
              <span className="text-[#2A9D72] font-bold">{recipe.username || 'Chef'}</span>
            </p>
            {recipe.servings && (
              <span className="text-[10px] text-gray-400 font-medium flex items-center gap-0.5">
                <UsersIcon className="w-3 h-3" /> {recipe.servings} servings
              </span>
            )}
          </div>

          {}
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
      className="w-16 min-[320px]:w-20 h-16 min-[320px]:h-20 rounded-2xl min-[320px]:rounded-3xl bg-emerald-50 flex items-center justify-center mb-4 min-[320px]:mb-6 mx-auto"
    >
      <BookmarkIcon className="w-8 min-[320px]:w-10 h-8 min-[320px]:h-10 text-emerald-500" />
    </motion.div>
    <h2 className="text-xl min-[320px]:text-2xl font-black text-gray-900 mb-2">No saved recipes yet</h2>
    <p className="text-gray-400 text-xs min-[320px]:text-sm max-w-xs mb-8 leading-relaxed">
      Browse recipes and tap the bookmark icon to save your favorites here.
    </p>
    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
      <Link
        to="/"
        className="text-white font-bold px-6 py-3 rounded-2xl text-sm transition-colors shadow-lg"
        style={{ background: '#059669', boxShadow: '0 8px 20px -4px rgba(5,150,105,0.25)' }}
      >
        Explore Recipes
      </Link>
    </motion.div>
    </motion.div>
  );
}

function FilterBar({ categories, active, onChange }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {['All', ...categories].map((cat) => (
        <motion.button
          key={cat}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onChange(cat)}
          className={`flex-shrink-0 px-3 min-[320px]:px-4 py-1.5 min-[320px]:py-2 rounded-full text-[10px] min-[320px]:text-xs font-bold transition-all duration-200 border ${
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
      .then((res) => setRecipes(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleUnsave = (recipeId) => {
    setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
  };

  const categories = [...new Set(recipes.map((r) => r.category).filter(Boolean))];

  const filtered = recipes.filter((r) => {
    const matchesCategory = activeFilter === 'All' || r.category === activeFilter;
    const matchesSearch = r.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#fafaf8] pt-14">
      <div className="max-w-5xl mx-auto px-3 min-[420px]:px-4 sm:px-6 pt-6 min-[420px]:pt-8 pb-20">

        {}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-emerald-600"><BookmarkIcon className="w-5 min-[420px]:w-7 h-5 min-[420px]:h-7" /></span>
            <h1 className="text-lg min-[420px]:text-2xl sm:text-3xl font-black text-gray-900">Saved Recipes</h1>
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

        {}
        {!loading && recipes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-7 space-y-3"
          >
            {}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon className="w-4 h-4" /></span>
              <input
                type="text"
                placeholder="Search your saved recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 min-[320px]:pl-10 pr-4 py-2 min-[320px]:py-2.5 sm:py-3 rounded-[12px] min-[320px]:rounded-2xl border border-gray-200 bg-white text-xs min-[320px]:text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder:text-gray-400"
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

            {categories.length > 1 && (
              <FilterBar
                categories={categories}
                active={activeFilter}
                onChange={setActiveFilter}
              />
            )}
          </motion.div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
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
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3"><SearchIcon className="w-6 h-6 text-gray-400" /></div>
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
            {}
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
              className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5"
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