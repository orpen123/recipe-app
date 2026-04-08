import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  getRecipe, getComments, addComment, deleteComment,
  likeRecipe, unlikeRecipe, saveRecipe, unsaveRecipe, deleteRecipe,
} from '../api/services';
import { useAuth } from '../context/AuthContext';

// ─── Variants ────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28, filter: 'blur(4px)' },
  visible: (i = 0) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const commentSlide = {
  hidden: { opacity: 0, x: -16 },
  visible: (i) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' },
  }),
  exit: { opacity: 0, x: 16, transition: { duration: 0.25 } },
};

const tagVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 6 },
  visible: (i) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { delay: 0.3 + i * 0.05, type: 'spring', stiffness: 200, damping: 15 },
  }),
};

// ─── Ingredient Item ──────────────────────────────────────────────────────────

function IngredientItem({ ing, index }) {
  const [checked, setChecked] = useState(false);
  return (
    <motion.li
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      onClick={() => setChecked(!checked)}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer select-none transition-all duration-200 group ${
        checked
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-white border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30'
      }`}
    >
      <motion.span
        animate={checked ? { scale: [1, 1.3, 1], backgroundColor: '#10b981' } : { scale: 1, backgroundColor: '#d1fae5' }}
        transition={{ duration: 0.3 }}
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
      >
        {checked && (
          <motion.svg
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-3 h-3 text-white"
            viewBox="0 0 12 12" fill="none"
          >
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </motion.svg>
        )}
      </motion.span>
      <span className={`text-sm font-semibold flex-1 transition-all ${checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
        {ing.name}
      </span>
      {ing.quantity && (
        <span className={`text-xs font-medium transition-all ${checked ? 'text-gray-300' : 'text-emerald-600'}`}>
          {ing.quantity}
        </span>
      )}
    </motion.li>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-16 animate-pulse">
      <div className="h-64 sm:h-80 md:h-96 rounded-3xl bg-gray-100 mb-8" />
      <div className="h-4 bg-gray-100 rounded w-24 mb-3" />
      <div className="h-8 bg-gray-100 rounded w-2/3 mb-4" />
      <div className="h-4 bg-gray-100 rounded w-1/3 mb-8" />
      <div className="flex gap-3 mb-8">
        {[1,2,3].map(i => <div key={i} className="h-10 w-24 bg-gray-100 rounded-full" />)}
      </div>
      <div className="space-y-2">
        {[1,2,3,4].map(i => <div key={i} className="h-4 bg-gray-100 rounded" />)}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RecipeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    Promise.all([getRecipe(id), getComments(id)])
      .then(([recipeRes, commentsRes]) => {
        setRecipe(recipeRes.data);
        setComments(commentsRes.data);
        setLiked(recipeRes.data.isLiked || false);
        setSaved(recipeRes.data.isSaved || false);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);
  const handleLike = async () => {
    if (!user) return navigate('/login');
    const prev = liked;
    setLiked(!liked);
    try {
      liked ? await unlikeRecipe(id) : await likeRecipe(id);
    } catch (err) {
      setLiked(prev);
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!user) return navigate('/login');
    const prev = saved;
    setSaved(!saved);
    try {
      saved ? await unsaveRecipe(id) : await saveRecipe(id);
    } catch (err) {
      setSaved(prev);
      console.error(err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;
    setCommentSubmitting(true);
    try {
      const res = await addComment(id, { content: comment });
      setComments([...comments, res.data]);
      setComment('');
    } catch (err) { console.error(err); }
    finally { setCommentSubmitting(false); }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async () => {
    try {
      await deleteRecipe(id);
      navigate('/');
    } catch (err) { console.error(err); }
  };

  if (loading) return <Skeleton />;
  if (!recipe) return (
    <div className="flex flex-col items-center justify-center py-32 text-gray-400">
      <span className="text-6xl mb-4">🍽️</span>
      <p className="text-lg font-semibold">Recipe not found</p>
      <Link to="/" className="mt-4 text-sm text-emerald-600 hover:underline">← Back to home</Link>
    </div>
  );

  const isOwner = user?.id === recipe.user_id;
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <div className="min-h-screen bg-[#fafaf8] pt-14">

      {/* ── Hero ── */}
      <div ref={heroRef} className="relative h-[55vw] min-h-[240px] max-h-[520px] overflow-hidden">
        {recipe.image ? (
          <motion.img
            style={{ y: heroY }}
            src={recipe.image}
            alt={recipe.title}
            className="absolute inset-0 w-full h-full object-cover scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-amber-50 flex items-center justify-center">
            <span className="text-8xl">🍽️</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Back button */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border border-white/30 hover:bg-white/30 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </motion.button>
        </motion.div>

        {/* Hero text overlay */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 md:p-10"
        >
          <motion.span
            custom={0}
            variants={tagVariants}
            initial="hidden"
            animate="visible"
            className="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-widest text-emerald-300 bg-emerald-900/50 backdrop-blur-sm px-2.5 py-1 rounded-full mb-2 sm:mb-3 border border-emerald-500/30"
          >
            {recipe.category}
          </motion.span>
          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight max-w-2xl drop-shadow-lg"
          >
            {recipe.title}
          </motion.h1>
          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-white/70 text-xs sm:text-sm mt-1 sm:mt-2"
          >
            By{' '}
            <Link
              to={`/profile/${recipe.user_id}`}
              className="text-emerald-300 font-semibold hover:text-emerald-200 transition-colors"
            >
              {recipe.username || 'Chef'}
            </Link>
          </motion.p>
        </motion.div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">

        {/* Action Bar */}
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 sm:px-6 sm:py-4 -mt-6 relative z-10 mb-8 flex flex-wrap items-center justify-between gap-3"
        >
          {/* Stats */}
          <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500 flex-wrap">
            {recipe.prep_time && (
              <div className="flex items-center gap-1.5">
                <span className="text-base">⏱</span>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 leading-none mb-0.5">Prep</p>
                  <p className="font-bold text-gray-800">{recipe.prep_time}m</p>
                </div>
              </div>
            )}
            {recipe.cook_time && (
              <div className="flex items-center gap-1.5">
                <span className="text-base">🔥</span>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 leading-none mb-0.5">Cook</p>
                  <p className="font-bold text-gray-800">{recipe.cook_time}m</p>
                </div>
              </div>
            )}
            {totalTime > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-base">⚡</span>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 leading-none mb-0.5">Total</p>
                  <p className="font-bold text-gray-800">{totalTime}m</p>
                </div>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center gap-1.5">
                <span className="text-base">🍽</span>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 leading-none mb-0.5">Serves</p>
                  <p className="font-bold text-gray-800">{recipe.servings}</p>
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border text-xs sm:text-sm font-bold transition-all duration-200 ${
                liked
                  ? 'bg-red-50 border-red-200 text-red-500 shadow-sm shadow-red-100'
                  : 'border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-400'
              }`}
            >
              <motion.span
                animate={liked ? { scale: [1, 1.5, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                ❤️
              </motion.span>
              {liked ? 'Liked' : 'Like'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border text-xs sm:text-sm font-bold transition-all duration-200 ${
                saved
                  ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-sm shadow-amber-100'
                  : 'border-gray-200 text-gray-500 hover:border-amber-200 hover:text-amber-500'
              }`}
            >
              <motion.span
                animate={saved ? { rotate: [0, -15, 15, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                🔖
              </motion.span>
              {saved ? 'Saved' : 'Save'}
            </motion.button>

            {isOwner ? (
              <>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    to={`/edit/${id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-gray-200 text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    ✏️ Edit
                  </Link>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-red-200 text-xs sm:text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
                >
                  🗑 Delete
                </motion.button>
              </>
            ) : user && (
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                 <Link
                    to={`/messages/${recipe.user_id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-emerald-600 text-white text-xs sm:text-sm font-bold hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-200"
                  >
                    ✉️ Message
                  </Link>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Description */}
        {recipe.description && (
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-gray-600 leading-relaxed mb-10 text-sm sm:text-base"
          >
            {recipe.description}
          </motion.p>
        )}

        {/* Ingredients */}
        {recipe.ingredients?.length > 0 && (
          <motion.section
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-lg sm:text-xl font-black text-gray-900">Ingredients</h2>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                {recipe.ingredients.length} items
              </span>
              <span className="text-[10px] text-gray-400 font-medium ml-auto">tap to check off</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recipe.ingredients.map((ing, i) => (
                <IngredientItem key={i} ing={ing} index={i} />
              ))}
            </ul>
          </motion.section>
        )}

        {/* Steps (if present) */}
        {recipe.steps?.length > 0 && (
          <motion.section
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-5">Instructions</h2>
            <ol className="space-y-4">
              {recipe.steps.map((step, i) => (
                <motion.li
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  className="flex gap-4 p-4 sm:p-5 bg-white rounded-2xl border border-gray-100 group hover:border-emerald-200 transition-all duration-200"
                >
                  <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center text-xs sm:text-sm font-black">
                    {i + 1}
                  </span>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{step}</p>
                </motion.li>
              ))}
            </ol>
          </motion.section>
        )}

        {/* Divider */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="border-t border-gray-100 mb-10"
        />

        {/* Comments */}
        <motion.section
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg sm:text-xl font-black text-gray-900">Comments</h2>
            <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
              {comments.length}
            </span>
          </div>

          {/* Comment input */}
          {user ? (
            <form onSubmit={handleComment} className="flex gap-2 sm:gap-3 mb-8">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm flex-shrink-0 mt-0.5">
                {user.username?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all bg-white placeholder:text-gray-400"
                />
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  disabled={commentSubmitting || !comment.trim()}
                  className="bg-emerald-600 text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {commentSubmitting ? '...' : 'Post'}
                </motion.button>
              </div>
            </form>
          ) : (
            <motion.div
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center"
            >
              <p className="text-sm text-gray-500">
                <Link to="/login" className="text-emerald-600 font-bold hover:underline">Sign in</Link>
                {' '}to leave a comment
              </p>
            </motion.div>
          )}

          {/* Comment list */}
          <div className="flex flex-col gap-3">
            {comments.length === 0 ? (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-center py-10"
              >
                <p className="text-3xl mb-2">💬</p>
                <p className="text-sm text-gray-400 font-medium">No comments yet. Be the first!</p>
              </motion.div>
            ) : (
              <AnimatePresence>
                {comments.map((c, i) => (
                  <motion.div
                    key={c.id}
                    custom={i}
                    variants={commentSlide}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className="flex items-start gap-3 p-3.5 sm:p-4 bg-white rounded-2xl border border-gray-100 group hover:border-gray-200 transition-all"
                  >
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-sm flex-shrink-0">
                      {c.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-gray-800 mb-0.5">{c.username}</p>
                      <p className="text-sm text-gray-600 leading-relaxed break-words">{c.content}</p>
                    </div>
                    {user?.id === c.user_id && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteComment(c.id)}
                        className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-600 transition-all flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50"
                      >
                        ✕
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.section>
      </div>

      {/* ── Delete Confirm Modal ── */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.45)' }}
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl"
            >
              <div className="text-4xl mb-4 text-center">🗑️</div>
              <h3 className="text-lg font-black text-gray-900 text-center mb-2">Delete Recipe?</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                This action cannot be undone. The recipe will be permanently removed.
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}