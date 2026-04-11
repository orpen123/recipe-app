import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  likeRecipe,
  unlikeRecipe,
  saveRecipe,
  unsaveRecipe,
} from "../api/services";
import { useAuth } from "../context/AuthContext";

const toSlug = (title) =>
  title
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-") || "";

const HeartIcon = ({ filled, className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const BookmarkIcon = ({ filled, className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const ClockIcon = () => (
  <svg
    className="w-3.5 h-3.5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

function LoginTooltip({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.95 }}
          transition={{ duration: 0.18 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
        >
          <div className="bg-gray-900 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
            Login to interact
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function RecipeCard({ recipe }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(recipe.isLiked || false);
  const [saved, setSaved] = useState(recipe.isSaved || false);
  const [likeCount, setLikeCount] = useState(Number(recipe.likes_count) || 0);
  const [imgError, setImgError] = useState(false);
  const [showLikeTip, setShowLikeTip] = useState(false);
  const [showSaveTip, setShowSaveTip] = useState(false);
  const likeTimer = useRef(null);
  const saveTimer = useRef(null);

  const flashTip = (setter, timerRef) => {
    setter(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setter(false), 1800);
  };

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      flashTip(setShowLikeTip, likeTimer);
      return;
    }
    const prev = liked;
    setLiked(!liked);
    setLikeCount((c) => (prev ? c - 1 : c + 1));
    try {
      if (prev) await unlikeRecipe(recipe.id);
      else await likeRecipe(recipe.id);
    } catch {
      setLiked(prev);
      setLikeCount((c) => (prev ? c + 1 : c - 1));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      flashTip(setShowSaveTip, saveTimer);
      return;
    }
    const prev = saved;
    setSaved(!saved);
    try {
      if (prev) await unsaveRecipe(recipe.id);
      else await saveRecipe(recipe.id);
    } catch {
      setSaved(prev);
    }
  };

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <Link
      to={`/recipe/${recipe.id}-${toSlug(recipe.title)}`}
      
      className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {}
      <div className="relative w-full aspect-4/3 bg-gray-100 overflow-hidden shrink-0">
        {recipe.image && !imgError ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#E8F7F2]">
            <svg
              className="w-12 h-12 text-emerald-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
              <path d="M7 2v20" />
              <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
            </svg>
          </div>
        )}

        {recipe.category && (
          <span className="absolute top-2 min-[320px]:top-3 left-2 min-[320px]:left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-[9px] min-[320px]:text-[11px] font-semibold px-2 min-[320px]:px-2.5 py-0.5 min-[320px]:py-1 rounded-full shadow-sm">
            {recipe.category}
          </span>
        )}

        <div className="absolute top-2 min-[320px]:top-3 right-2 min-[320px]:right-3 z-10">
          <div className="relative">
            <LoginTooltip show={showSaveTip} />
            <button
              onClick={handleSave}
              className="w-6 min-[320px]:w-8 h-6 min-[320px]:h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
            >
              <motion.span
                animate={saved ? { scale: [1, 1.35, 1] } : {}}
                transition={{ duration: 0.25 }}
              >
                <BookmarkIcon
                  filled={saved}
                  className={`w-4 h-4 transition-colors ${saved ? "text-emerald-500" : "text-gray-400"}`}
                />
              </motion.span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 px-4 pt-3 pb-3.5 gap-1.5">
        {recipe.username && (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-emerald-600 uppercase">
                {recipe.username.charAt(0)}
              </span>
            </div>
            <span className="text-[11px] text-gray-400 font-medium truncate">
              @{recipe.username}
            </span>
          </div>
        )}

        {}
        <h3 className="flex-1 font-bold text-gray-900 text-[14px] sm:text-[15px] leading-snug line-clamp-2">
          {recipe.title}
        </h3>
        {}
        {recipe.avg_rating && (
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className="w-3 h-3"
                  viewBox="0 0 24 24"
                  fill={
                    star <= Math.round(recipe.avg_rating) ? "#F59E0B" : "none"
                  }
                  stroke="#F59E0B"
                  strokeWidth="2"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <span className="text-[9px] min-[320px]:text-[11px] text-gray-400 font-medium">
              {recipe.avg_rating} ({recipe.total_reviews})
            </span>
          </div>
        )}

        {}
        <div className="flex items-center justify-between pt-1.5 min-[320px]:pt-2 border-t border-gray-50">
          <span className="flex items-center gap-0.5 min-[320px]:gap-1 text-gray-400 text-[10px] min-[320px]:text-[12px] font-medium">
            <ClockIcon />
            {totalTime > 0 ? `${totalTime} min` : "—"}
          </span>

          <div className="relative">
            <LoginTooltip show={showLikeTip} />
            <button
              onClick={handleLike}
              className="flex items-center gap-0.5 min-[320px]:gap-1 text-gray-400 hover:text-[#FBA11F] transition-colors"
            >
              <motion.span
                animate={liked ? { scale: [1, 1.4, 1] } : {}}
                transition={{ duration: 0.25 }}
              >
                <HeartIcon
                  filled={liked}
                  className={`w-3.5 h-3.5 min-[320px]:w-4 min-[320px]:h-4 transition-colors ${liked ? "text-[#FBA11F]" : ""}`}
                />
              </motion.span>
              <span className="text-[10px] min-[320px]:text-[12px] font-semibold">{likeCount}</span>
            </button>
          </div>

          <span className="text-[10px] min-[320px]:text-[12px] font-bold text-[#2A9D72] group-hover:underline">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
