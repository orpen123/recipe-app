import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { likeRecipe, unlikeRecipe, saveRecipe, unsaveRecipe } from '../api/services';
import { useAuth } from '../context/AuthContext';

export default function RecipeCard({ recipe }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(recipe.isLiked || false);
  const [saved, setSaved] = useState(recipe.isSaved || false);
  const [likeCount, setLikeCount] = useState(Number(recipe.likes_count) || 0);
  const [hovered, setHovered] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    const prev = liked;
    setLiked(!liked);
    setLikeCount((c) => prev ? c - 1 : c + 1);
    try {
      if (prev) {
        await unlikeRecipe(recipe.id);
      } else {
        await likeRecipe(recipe.id);
      }
    } catch (err) {
      setLiked(prev);
      setLikeCount((c) => prev ? c + 1 : c - 1);
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    const prev = saved;
    setSaved(!saved);
    try {
      if (prev) {
        await unsaveRecipe(recipe.id);
      } else {
        await saveRecipe(recipe.id);
      }
    } catch (err) {
      setSaved(prev);
      console.error(err);
    }
  };

  return (
    <Link
      to={`/recipe/${recipe.id}`}
      className="group relative rounded-2xl overflow-hidden cursor-pointer block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="aspect-square overflow-hidden bg-gray-100">
        {recipe.image ? (
          <motion.img
            src={recipe.image}
            alt={recipe.title}
            animate={{ scale: hovered ? 1.07 : 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-[#E8F7F2]">🍽️</div>
        )}
      </div>

      {/* Hover overlay */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10"
      />

      {/* Save button */}
      <motion.button
        onClick={handleSave}
        animate={{ opacity: hovered || saved ? 1 : 0, scale: hovered || saved ? 1 : 0.8 }}
        transition={{ duration: 0.2 }}
        className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md transition-colors ${
          saved
            ? 'text-white'
            : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white'
        }`}
        style={saved ? { background: '#2A9D72' } : {}}
        title={saved ? 'Unsave' : 'Save recipe'}
      >
        🔖
      </motion.button>

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
        <h3 className="text-white font-bold text-sm leading-snug drop-shadow line-clamp-2">
          {recipe.title}
        </h3>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-white/70 text-[11px] font-medium truncate max-w-[60%]">
            {recipe.category}
          </span>
          <motion.button
            onClick={handleLike}
            whileTap={{ scale: 1.3 }}
            className={`flex items-center gap-1 text-xs font-bold transition-colors ${
              liked ? 'text-red-400' : 'text-white/70 hover:text-red-300'
            }`}
          >
            <motion.span animate={liked ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.3 }}>
              ❤️
            </motion.span>
            {likeCount > 0 && likeCount}
          </motion.button>
        </div>
      </div>
    </Link>
  );
}