import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import RecipeCard from "../components/RecipeCard";
import { getAllRecipes } from "../api/services";
import img from "../assets/bg_tajine.jpg";

const SearchIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ChevronLeft = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

function SkeletonCard() {
  return (
    <div className="flex flex-col bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm animate-pulse">
      <div className="w-full aspect-[4/3] bg-stone-100" />
      <div className="px-4 pt-3.5 pb-4 flex flex-col gap-2.5">
        <div className="h-2 w-1/3 rounded-full bg-stone-100" />
        <div className="h-3.5 w-[85%] rounded-full bg-stone-100" />
        <div className="h-3 w-2/3 rounded-full bg-stone-100" />
        <div className="flex gap-2 mt-1">
          <div className="h-2 w-12 rounded-full bg-stone-100" />
          <div className="h-2 w-8 rounded-full bg-stone-100" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const recipesRef = useRef(null);
  const popularScrollRef = useRef(null);

  useEffect(() => {
    getAllRecipes()
      .then((res) => setRecipes(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const unique = [
      ...new Set(recipes.map((r) => r.category).filter(Boolean)),
    ].sort();
    return [
      { value: "all", label: "All" },
      ...unique.map((c) => ({ value: c, label: c })),
    ];
  }, [recipes]);

  const popularRecipes = useMemo(
    () =>
      [...recipes]
        .sort(
          (a, b) => (Number(b.likes_count) || 0) - (Number(a.likes_count) || 0),
        )
        .slice(1, 7),
    [recipes],
  );

  const filtered = recipes.filter((r) => {
    const matchesCat =
      activeCategory === "all" ||
      r.category?.toLowerCase() === activeCategory.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      [r.title, r.description, r.username].some((f) =>
        f?.toLowerCase().includes(q),
      );
    return matchesCat && matchesSearch;
  });

  const scrollToRecipes = () => {
    const target = recipesRef.current;
    if (!target) return;

    const targetY = target.getBoundingClientRect().top + window.scrollY;
    const startY = window.scrollY;
    const distance = targetY - startY;
    const duration = 800;
    let startTime = null;

    const ease = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY + distance * ease(progress));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  useEffect(() => {
    if (searchQuery) {
      setActiveCategory("all");
      setTimeout(() => {
        scrollToRecipes();
      }, 150);
    }
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  const ITEMS = 12;
  const totalPages = Math.ceil(filtered.length / ITEMS);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS,
    currentPage * ITEMS,
  );

  const scrollPopular = (dir) => {
    const container = popularScrollRef.current;
    if (!container) return;

    const card = container.firstElementChild;
    const cardWidth = card ? card.offsetWidth : 230;
    const gap = parseFloat(window.getComputedStyle(container).gap) || 16;
    
    const startX = container.scrollLeft;
    const distance = dir * (cardWidth + gap);
    const duration = 400; 
    let startTime = null;

    const ease = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      container.scrollLeft = startX + distance * ease(progress);
      
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    
    requestAnimationFrame(step);
  };

  return (
    <div
      className="min-h-screen bg-[#f5f4f0] pt-[clamp(60px,10vw,80px)]"
      style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
    >
      {}
      <div className="relative mx-2 rounded-2xl overflow-hidden h-[200px] sm:h-75 md:h-95 lg:h-110">
        <img
          src={img}
          alt="Hero"
          className="w-full h-full object-cover scale-105"
          style={{ transformOrigin: "center 40%" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(10,20,15,0.82) 0%, rgba(10,20,15,0.45) 55%, rgba(10,20,15,0.25) 100%)",
          }}
        />

        <div className="absolute inset-0 flex flex-col justify-center px-5 sm:px-12 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-lg"
          >
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1 mb-3 sm:mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
                Community Recipes
              </p>
            </div>

            <h1
              className="text-[22px] min-[320px]:text-[26px] sm:text-[52px] lg:text-[66px]  font-black text-white leading-[1.05] mb-2 sm:mb-4"
              style={{ letterSpacing: "-0.02em" }}
            >
              Easy Home
              <br />
              <span className="text-emerald-300">Cooking.</span>
            </h1>

            <p className="text-[10px] sm:text-[15px] text-white/50 mb-4 sm:mb-7 font-medium max-w-[200px] sm:max-w-sm leading-relaxed">
              Discover amazing recipes from our community of home cooks.
            </p>

            <div className="flex gap-2 flex-wrap min-[320px]:gap-2">
              <Link
                to="/register"
                className="inline-flex items-center bg-white text-stone-900 text-[9px] min-[320px]:text-[10px] sm:text-[13px] font-bold uppercase tracking-[0.07em] px-3 min-[320px]:px-4 sm:px-7 py-2 sm:py-3 rounded-full hover:bg-emerald-50 transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-black/10"
              >
                Join us
              </Link>
              <button
                onClick={scrollToRecipes}
                className="inline-flex items-center bg-white/10 backdrop-blur-sm text-white border border-white/20 text-[9px] min-[320px]:text-[10px] sm:text-[13px] font-bold uppercase tracking-[0.07em] px-3 min-[320px]:px-4 sm:px-7 py-2 sm:py-3 rounded-full hover:bg-white/18 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              >
                Browse ↓
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {}
      {!loading && popularRecipes.length > 0 && (
        <div className="pt-10 sm:pt-14 max-w-7xl mx-auto">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-12 mb-5">
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-[#1a7a52] mb-0.5">
                Trending
              </p>
              <h2
                className="text-[18px] sm:text-2xl flex font-black text-stone-900"
                style={{ letterSpacing: "-0.02em" }}
              >
                <svg
                  width={30}
                  height={30}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C12 2 9 6 9 9.5C9 9.5 7.5 8.5 7 7C7 7 4 9.5 4 13C4 17.4 7.6 21 12 21C16.4 21 20 17.4 20 13C20 9 16 5.5 14.5 4.5C14.5 4.5 14.5 6.5 13 7.5C13 7.5 12 5 12 2Z"
                    fill="#ff5c00"
                  />
                  <path
                    d="M12 21C14.2 21 16 19.2 16 17C16 15.2 14.5 13.5 13 12.5C13 12.5 13 14 12 14.5C12 14.5 11 13 11 11.5C11 11.5 9.5 12.5 9 14C8.5 15 8 16 8 17C8 19.2 9.8 21 12 21Z"
                    fill="#ffaa00"
                  />
                </svg>
                Most Popular
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => scrollPopular(-1)}
                className="w-8 h-8 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:border-[#1a7a52] hover:text-[#1a7a52] transition-all duration-200 cursor-pointer shadow-sm"
              >
                <ChevronLeft />
              </button>
              <button
                onClick={() => scrollPopular(1)}
                className="w-8 h-8 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-500 hover:border-[#1a7a52] hover:text-[#1a7a52] transition-all duration-200 cursor-pointer shadow-sm"
              >
                <ChevronRight />
              </button>
            </div>
          </div>

          {}
          <div
            ref={popularScrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 px-4 sm:px-6 lg:px-12 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {popularRecipes.map((recipe, i) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: i * 0.07,
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="shrink-0 w-[200px] sm:w-[230px]"
              >
                <RecipeCard recipe={recipe} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {}
      {}

      {}
      <div className="mx-4 sm:mx-6 lg:mx-12 mt-10 sm:mt-12 border-t border-stone-200/70 max-w-7xl xl:mx-auto" />

      {}
      <div
        className="px-4 sm:px-6 lg:px-12 pt-10 sm:pt-12 max-w-7xl mx-auto"
        ref={recipesRef}
      >
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-[#1a7a52] mb-1.5">
            Explore
          </p>
          <h2
            className="text-[24px]  sm:text-[36px] font-black text-stone-900"
            style={{ letterSpacing: "-0.025em" }}
          >
            What to{" "}
            <span
              className="text-[24px] sm:text-[36px] font-black text-emerald-600"
              style={{ letterSpacing: "-0.025em" }}
            >
              {" "}
              Cook ?
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-wrap justify-center gap-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-10 w-24 rounded-full bg-stone-100 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <motion.button
                key={cat.value}
                onClick={() => {
                  setActiveCategory(cat.value);
                  if (searchQuery) {
                    searchParams.delete("search");
                    setSearchParams(searchParams);
                  }
                }}
                whileTap={{ scale: 0.95 }}
                className={[
                  "relative inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-[13px] font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap",
                  activeCategory === cat.value
                    ? "bg-stone-900 text-white shadow-lg shadow-stone-900/15"
                    : "bg-white text-stone-500 border border-stone-200 hover:border-[#1a7a52]/40 hover:text-[#1a7a52] hover:bg-emerald-50/60 shadow-sm",
                ].join(" ")}
              >
                {cat.label}
                {cat.value !== "all" && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      activeCategory === cat.value
                        ? "bg-white/15 text-white/60"
                        : "bg-stone-100 text-stone-400"
                    }`}
                  >
                    {recipes.filter((r) => r.category === cat.value).length}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {}
      <div className="px-4 sm:px-6 lg:px-12 pt-8 sm:pt-10 pb-20 sm:pb-28 max-w-7xl mx-auto">
        <div className="flex flex-wrap min-[350px]:flex-nowrap items-center justify-between gap-3 mb-5 sm:mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-[13px] min-[320px]:text-[15px] sm:text-[17px] font-bold text-stone-900 whitespace-nowrap">
              {searchQuery ? "Search Results" : "Latest Recipes"}
            </h2>
            {!loading && (
              <span className="text-[9px] min-[320px]:text-[11px] font-semibold text-stone-400 bg-stone-100 px-2 min-[320px]:px-2.5 py-0.5 rounded-full">
                {filtered.length}
              </span>
            )}
          </div>
          <Link
            to="/create"
            className="inline-flex items-center justify-center gap-1 min-[320px]:gap-1.5 text-[10px] min-[320px]:text-[12px] sm:text-[13px] font-bold text-white bg-[#1a7a52] hover:bg-[#15694a] transition-colors duration-200 px-3 min-[320px]:px-4 py-1.5 min-[320px]:py-2 rounded-full shadow-md shadow-emerald-900/15 whitespace-nowrap shrink-0"
          >
            <span className="text-base min-[320px]:text-lg leading-none -mt-0.5">+</span> Add Recipe
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-24 gap-3 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center text-3xl mb-1 shadow-inner">
              🍽️
            </div>
            <p className="text-[17px] font-bold text-stone-700">
              No recipes here yet
            </p>
            <p className="text-[13px] text-stone-400 max-w-[220px] leading-relaxed">
              {activeCategory !== "all"
                ? `Nothing in "${activeCategory}" yet — be the first to add one!`
                : "Start building the community cookbook!"}
            </p>
            <div className="flex gap-2.5 mt-2">
              {activeCategory !== "all" && (
                <button
                  onClick={() => setActiveCategory("all")}
                  className="text-[12px] font-semibold text-stone-600 border border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50 px-4 py-2 rounded-full transition-all duration-200 cursor-pointer shadow-sm"
                >
                  View all
                </button>
              )}
              <Link
                to="/create"
                className="text-[12px] font-semibold text-white bg-[#1a7a52] hover:bg-[#15694a] px-4 py-2 rounded-full transition-all duration-200 shadow-md shadow-emerald-900/15"
              >
                Add a recipe →
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory + searchQuery + currentPage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5"
              >
                {paginated.map((recipe, i) => (
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.035, duration: 0.32 }}
                    className="group"
                  >
                    <RecipeCard recipe={recipe} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12 sm:mt-16">
                <button
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((p) => p - 1);
                    scrollToRecipes();
                  }}
                  className="w-10 h-10 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-600 disabled:opacity-30 hover:border-[#1a7a52] hover:text-[#1a7a52] hover:bg-emerald-50 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed shadow-sm"
                >
                  <ChevronLeft />
                </button>

                <div className="flex items-center gap-1.5 mx-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (currentPage <= 4) {
                      pageNum = i < 6 ? i + 1 : totalPages;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = i === 0 ? 1 : totalPages - 5 + i;
                    } else {
                      const mid = [
                        1,
                        currentPage - 1,
                        currentPage,
                        currentPage + 1,
                        totalPages,
                      ];
                      pageNum = mid[i] ?? null;
                    }

                    if (!pageNum) return null;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          scrollToRecipes();
                        }}
                        className={[
                          "w-9 h-9 rounded-full text-[12px] font-bold transition-all duration-200 cursor-pointer",
                          pageNum === currentPage
                            ? "bg-stone-900 text-white shadow-md"
                            : "text-stone-400 hover:text-stone-700 hover:bg-stone-100",
                        ].join(" ")}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((p) => p + 1);
                    scrollToRecipes();
                  }}
                  className="w-10 h-10 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-600 disabled:opacity-30 hover:border-[#1a7a52] hover:text-[#1a7a52] hover:bg-emerald-50 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed shadow-sm"
                >
                  <ChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
