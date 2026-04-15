import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getRecipe,
  getComments,
  addComment,
  deleteComment,
  likeRecipe,
  unlikeRecipe,
  saveRecipe,
  unsaveRecipe,
  deleteRecipe,
  getRecipeLikes,
  getRecipeReviews,
  getMyReview,
  submitReview,
  deleteReview,
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

const ClockIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
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

const FlameIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const UsersIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ZapIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const ArrowLeftIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const EditIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const MailIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const CheckIcon = ({ className = "w-3 h-3" }) => (
  <svg className={className} viewBox="0 0 12 12" fill="none">
    <path
      d="M2 6l3 3 5-5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MessageIcon = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const modalBackdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalPanel = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 320, damping: 28 },
  },
  exit: { opacity: 0, y: 20, scale: 0.97, transition: { duration: 0.18 } },
};

function RecipeLikesModal({ users, onClose, loading }) {
  return (
    <AnimatePresence>
      <motion.div
        variants={modalBackdrop}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          variants={modalPanel}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 min-[320px]:px-5 py-3 min-[320px]:py-4 border-b border-gray-100">
            <h3 className="font-black text-gray-900 text-sm min-[320px]:text-base">
              Likes
            </h3>
            <button
              onClick={onClose}
              className="w-7 h-7 min-[320px]:w-8 min-[320px]:h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 custom-scroll">
            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <p className="text-4xl mb-2">❤️</p>
                <p className="text-sm font-medium">No likes yet</p>
              </div>
            ) : (
              users.map((u) => (
                <Link
                  key={u.id}
                  to={`/profile/${u.username}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0 overflow-hidden border-2 border-white shadow-sm"
                    style={{ background: "#2A9D72" }}
                  >
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt={u.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      u.username?.[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">
                      @{u.username}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#2A9D72]">
                    View →
                  </span>
                </Link>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function AllReviewsModal({ reviews, onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        variants={modalBackdrop}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 min-[320px]:p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          variants={modalPanel}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 min-[320px]:px-5 py-3 min-[320px]:py-4 border-b border-gray-100 shrink-0">
            <h3 className="font-black text-gray-900 text-sm min-[320px]:text-base">
              All Reviews ({reviews.length})
            </h3>
            <button
              onClick={onClose}
              className="w-7 h-7 min-[320px]:w-8 min-[320px]:h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="overflow-y-auto custom-scroll p-4 min-[320px]:p-5 space-y-3 min-[320px]:space-y-4">
            {reviews.map((r, i) => (
              <div
                key={r.id}
                className="flex items-start gap-2 min-[320px]:gap-3 p-3 min-[320px]:p-4 bg-emerald-50/50 rounded-xl min-[320px]:rounded-2xl border border-emerald-100"
              >
                <div className="w-7 min-[320px]:w-9 h-7 min-[320px]:h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs min-[320px]:text-sm shrink-0 overflow-hidden">
                  {r.avatar ? (
                    <img
                      src={r.avatar}
                      alt={r.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    r.username?.[0]?.toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 min-[320px]:gap-2 mb-1 flex-wrap">
                    <p className="text-[10px] min-[320px]:text-xs font-black text-gray-800">
                      {r.username}
                    </p>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg
                          key={s}
                          className="w-2.5 min-[320px]:w-3 h-2.5 min-[320px]:h-3"
                          viewBox="0 0 24 24"
                          fill={s <= r.rating ? "#059669" : "none"}
                          stroke="#059669"
                          strokeWidth="2"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  {r.content && (
                    <p className="text-xs min-[320px]:text-sm text-gray-600 leading-relaxed">
                      {r.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function AllCommentsModal({ comments, onClose, user, handleDeleteComment }) {
  return (
    <AnimatePresence>
      <motion.div
        variants={modalBackdrop}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 min-[320px]:p-4 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          variants={modalPanel}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 min-[320px]:px-5 py-3 min-[320px]:py-4 border-b border-gray-100 shrink-0">
            <h3 className="font-black text-gray-900 text-sm min-[320px]:text-base">
              All Comments ({comments.length})
            </h3>
            <button
              onClick={onClose}
              className="w-7 h-7 min-[320px]:w-8 min-[320px]:h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="overflow-y-auto custom-scroll p-4 min-[320px]:p-5 space-y-3 min-[320px]:space-y-4">
            {comments.map((c, i) => (
              <div
                key={c.id}
                className="flex items-start gap-2 min-[320px]:gap-3 p-3 min-[320px]:p-4 bg-gray-50 rounded-xl min-[320px]:rounded-2xl border border-gray-100 group"
              >
                <div className="w-7 min-[320px]:w-9 h-7 min-[320px]:h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xs min-[320px]:text-sm shrink-0 overflow-hidden">
                  {c.avatar ? (
                    <img
                      src={c.avatar}
                      alt={c.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    c.username?.[0]?.toUpperCase() || "?"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] min-[320px]:text-xs font-black text-gray-800 mb-0.5">
                    {c.username}
                  </p>
                  <p className="text-xs min-[320px]:text-sm text-gray-600 leading-relaxed break-words">
                    {c.content}
                  </p>
                </div>
                {user?.id === c.user_id && (
                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-all shrink-0 w-5 min-[320px]:w-6 h-5 min-[320px]:h-6 flex items-center justify-center rounded-full hover:bg-red-50"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: "blur(4px)" },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.45 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

const commentSlide = {
  hidden: { opacity: 0, x: -14 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: "easeOut" },
  }),
  exit: { opacity: 0, x: 14, transition: { duration: 0.2 } },
};

function IngredientItem({ ing, index }) {
  const [checked, setChecked] = useState(false);
  return (
    <motion.li
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      onClick={() => setChecked(!checked)}
      className={`flex items-center gap-2 px-3 py-2.5 min-[500px]:px-4 min-[500px]:py-3 rounded-2xl border cursor-pointer select-none transition-all duration-200 group ${
        checked
          ? "bg-emerald-50 border-emerald-200"
          : "bg-white border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30"
      }`}
    >
      <motion.span
        animate={
          checked
            ? { scale: [1, 1.3, 1], backgroundColor: "#059669" }
            : { scale: 1, backgroundColor: "#d1fae5" }
        }
        transition={{ duration: 0.3 }}
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
      >
        {checked && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-white"
          >
            <CheckIcon />
          </motion.span>
        )}
      </motion.span>
      <span
        className={`text-[10px] min-[400px]:text-xs sm:text-sm font-semibold flex-1 min-w-0 break-words transition-all ${checked ? "line-through text-gray-400" : "text-gray-800"}`}
      >
        {ing.name}
      </span>
      {ing.quantity && (
        <span
          className={`text-[10px] min-[400px]:text-xs font-bold transition-all flex-shrink-0 ${checked ? "text-gray-300" : "text-emerald-600"}`}
        >
          {ing.quantity}
        </span>
      )}
    </motion.li>
  );
}

function Skeleton() {
  return (
    <div className="min-h-screen bg-[#fafaf8] pt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="rounded-3xl bg-gray-100 aspect-[4/3] md:aspect-auto md:min-h-[500px]" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-100 rounded w-24" />
            <div className="h-9 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="grid grid-cols-2 gap-3 mt-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-2xl" />
              ))}
            </div>
            <div className="space-y-2 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center justify-center p-2 min-[400px]:p-2.5 sm:p-4 rounded-xl min-[400px]:rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
      <div className="text-emerald-600 mb-0.5">{icon}</div>
      <p className="text-sm min-[400px]:text-base sm:text-lg font-black text-emerald-700">
        {value}
      </p>
      <p className="text-[9px] min-[400px]:text-[10px] sm:text-xs font-medium text-emerald-500 uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}

export default function RecipeDetail() {
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    avg_rating: null,
    total_reviews: 0,
  });
  const [myReview, setMyReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  const { idAndSlug } = useParams();
  const id = idAndSlug?.split("-")[0];
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [likesList, setLikesList] = useState([]);
  const [likesLoading, setLikesLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([getRecipe(idAndSlug), getComments(id), getRecipeReviews(id)])
      .then(([recipeRes, commentsRes, reviewsRes]) => {
        setRecipe(recipeRes.data);
        setComments(commentsRes.data);
        setLiked(recipeRes.data.isLiked || false);
        setSaved(recipeRes.data.isSaved || false);
        setReviews(reviewsRes.data.reviews);
        setReviewStats({
          avg_rating: reviewsRes.data.avg_rating,
          total_reviews: reviewsRes.data.total_reviews,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    if (user) {
      getMyReview(id)
        .then((res) => {
          if (res.data) {
            setMyReview(res.data);
            setReviewRating(res.data.rating);
            setReviewContent(res.data.content || "");
          }
        })
        .catch(() => {});
    }
  }, [id, user]);

  const handleLike = async () => {
    if (!user) return navigate("/login");
    const prev = liked;
    setLiked(!liked);
    setRecipe((r) => ({
      ...r,
      likes_count: liked ? r.likes_count - 1 : r.likes_count + 1,
    }));
    try {
      liked ? await unlikeRecipe(id) : await likeRecipe(id);
    } catch (err) {
      setLiked(prev);
      setRecipe((r) => ({
        ...r,
        likes_count: prev ? r.likes_count + 1 : r.likes_count - 1,
      }));
      console.error(err);
    }
  };

  const handleOpenLikes = async () => {
    try {
      setShowLikesModal(true);
      setLikesLoading(true);
      const res = await getRecipeLikes(id);
      setLikesList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLikesLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return navigate("/login");
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
      setComment("");
    } catch (err) {
      console.error(err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user || !reviewRating) return;
    setReviewSubmitting(true);
    try {
      const res = await submitReview(id, {
        rating: reviewRating,
        content: reviewContent,
      });
      setMyReview(res.data);
      const updated = await getRecipeReviews(id);
      setReviews(updated.data.reviews);
      setReviewStats({
        avg_rating: updated.data.avg_rating,
        total_reviews: updated.data.total_reviews,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    try {
      await deleteReview(id);
      setMyReview(null);
      setReviewRating(0);
      setReviewContent("");
      const updated = await getRecipeReviews(id);
      setReviews(updated.data.reviews);
      setReviewStats({
        avg_rating: updated.data.avg_rating,
        total_reviews: updated.data.total_reviews,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRecipe(id);
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Skeleton />;
  if (!recipe)
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-gray-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"
            />
          </svg>
        </div>
        <p className="text-lg font-semibold">Recipe not found</p>
        <Link
          to="/"
          className="mt-3 text-sm text-emerald-600 hover:underline font-semibold"
        >
          ← Back to home
        </Link>
      </div>
    );

  const isOwner = user?.id === recipe.user_id;
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);

  return (
    <div className="min-h-screen bg-[#fafaf8] pt-14">
      {}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2">
        <motion.button
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-500 hover:text-emerald-600 text-sm font-semibold transition-colors group"
        >
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </motion.button>
      </div>

      {}
      <div className="max-w-7xl mx-auto px-2 min-[320px]:px-3 sm:px-6 lg:px-8 py-3 sm:py-4 pb-16 sm:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-[400px]:gap-4 sm:gap-8 md:gap-12 items-start">
          {}
          <div className="contents md:flex md:flex-col md:gap-6">
            {}
            <div className="order-1 md:order-0">
              <motion.div
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                className="relative rounded-2xl min-[320px]:rounded-3xl overflow-hidden shadow-xl bg-gray-100 aspect-4/3 max-h-55 min-[320px]:max-h-65 sm:max-h-85 md:max-h-130"
              >
                {recipe.image ? (
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                    <svg
                      className="w-16 min-[320px]:w-24 h-16 min-[320px]:h-24 text-emerald-200"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
                      />
                    </svg>
                  </div>
                )}
                <div className="absolute top-3 left-3 min-[320px]:top-4 min-[320px]:left-4">
                  <span className="inline-block text-[9px] min-[320px]:text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-white/95 backdrop-blur-sm px-2 min-[320px]:px-3 py-1 min-[320px]:py-1.5 rounded-full border border-emerald-100 shadow-sm">
                    {recipe.category || "Recipe"}
                  </span>
                </div>
              </motion.div>
            </div>

            {}
            <div className="order-3 md:order-0">
              {recipe.ingredients?.length > 0 && (
                <motion.section
                  variants={fadeIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  className="border-t-2 border-emerald-100 pt-5 sm:pt-6"
                >
                  <div className="flex items-center gap-2 mb-3 sm:mb-5">
                    <h2 className="text-sm min-[400px]:text-base sm:text-xl font-black text-gray-900">
                      Ingredients
                    </h2>
                    <span className="text-[9px] min-[400px]:text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 min-[400px]:px-2 py-0.5 rounded-full">
                      {recipe.ingredients.length} items
                    </span>
                    <span className="text-[9px] text-gray-400 font-medium ml-auto hidden min-[360px]:inline">
                      tap to check off
                    </span>
                  </div>
                  <ul className="grid grid-cols-1 min-[500px]:grid-cols-2 gap-2">
                    {recipe.ingredients.map((ing, i) => (
                      <IngredientItem key={i} ing={ing} index={i} />
                    ))}
                  </ul>
                </motion.section>
              )}
            </div>

            {}
            <div className="order-4 md:order-none">
              <motion.div
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="border-t-2 border-emerald-100 pt-5 sm:pt-6"
              >
                <div className="flex items-center gap-2 min-[320px]:gap-3 mb-4 sm:mb-5">
                  <div className="flex items-center gap-1.5 min-[320px]:gap-2 bg-emerald-50 border border-emerald-200 px-2 min-[320px]:px-3 py-1 min-[320px]:py-1.5 rounded-xl">
                    <svg className="w-4 min-[320px]:w-5 h-4 min-[320px]:h-5" viewBox="0 0 24 24" fill="#FBA11F" stroke="#FBA11F" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    <h2 className="text-sm min-[320px]:text-base font-black text-emerald-800">
                      Reviews
                    </h2>
                  </div>
                  <span className="text-[10px] min-[320px]:text-xs font-bold bg-emerald-100 text-emerald-700 px-2 min-[320px]:px-2.5 py-0.5 min-[320px]:py-1 rounded-full">
                    {reviewStats.total_reviews}
                  </span>
                </div>

                {user && !isOwner && (
                  <form
                    onSubmit={handleSubmitReview}
                    className="mb-5 sm:mb-6 p-3 min-[400px]:p-4 bg-emerald-50 rounded-xl min-[400px]:rounded-2xl border border-emerald-200"
                  >
                    <p className="text-[12px] min-[400px]:text-sm font-black text-gray-800 mb-2 min-[400px]:mb-3">
                      {myReview ? "Update your review" : "Write a review"}
                    </p>
                    <div className="flex items-center gap-0.5 min-[400px]:gap-1 mb-2 min-[400px]:mb-3">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setReviewRating(s)}
                        >
                          <svg
                            className="w-4 min-[400px]:w-6 h-4 min-[400px]:h-6 transition-transform hover:scale-110"
                            viewBox="0 0 24 24"
                            fill={s <= reviewRating ? "#FBA11F" : "none"}
                            stroke="#FBA11F"
                            strokeWidth="2"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </button>
                      ))}
                      {reviewRating > 0 && (
                        <span className="text-[10px] min-[400px]:text-xs text-[#FBA11F] ml-1 min-[400px]:ml-2 font-semibold">
                          {
                            [
                              "",
                              "Terrible",
                              "Poor",
                              "Average",
                              "Good",
                              "Excellent",
                            ][reviewRating]
                          }
                        </span>
                      )}
                    </div>
                    <textarea
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      placeholder="Share your experience (optional)..."
                      rows={3}
                      className="w-full px-3 min-[400px]:px-4 py-2 min-[400px]:py-2.5 rounded-lg min-[400px]:rounded-xl border border-emerald-200 bg-white text-[10px] min-[400px]:text-[12px] sm:text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none placeholder:text-gray-400 mb-2 min-[400px]:mb-3"
                    />
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={reviewSubmitting || !reviewRating}
                        className="px-3 min-[400px]:px-5 py-1.5 min-[400px]:py-2 bg-emerald-600 text-white text-[11px] min-[400px]:text-sm font-bold rounded-lg min-[400px]:rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        {reviewSubmitting
                          ? "Saving..."
                          : myReview
                            ? "Update"
                            : "Submit"}
                      </motion.button>
                      {myReview && (
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          type="button"
                          onClick={handleDeleteReview}
                          className="px-3 min-[400px]:px-5 py-1.5 min-[400px]:py-2 border border-red-200 text-red-500 text-[11px] min-[400px]:text-sm font-bold rounded-lg min-[400px]:rounded-xl hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </motion.button>
                      )}
                    </div>
                  </form>
                )}
                {!user && (
                  <div className="mb-5 sm:mb-6 p-3 min-[320px]:p-4 bg-emerald-50 rounded-xl min-[320px]:rounded-2xl border border-emerald-100 text-center">
                    <p className="text-xs min-[320px]:text-sm text-gray-500">
                      <Link
                        to="/login"
                        className="text-emerald-600 font-bold hover:underline"
                      >
                        Sign in
                      </Link>{" "}
                      to leave a review
                    </p>
                  </div>
                )}
                <div className="flex flex-col gap-2 min-[320px]:gap-3">
                  {reviews.length === 0 ? (
                    <div className="text-center py-6 min-[320px]:py-8">
                      <p className="text-xl min-[320px]:text-2xl mb-2">⭐</p>
                      <p className="text-xs min-[320px]:text-sm text-gray-400 font-medium">
                        No reviews yet. Be the first!
                      </p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {reviews.slice(0, 3).map((r, i) => (
                        <motion.div
                          key={r.id}
                          custom={i}
                          variants={commentSlide}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          layout
                          className="flex items-start gap-2 min-[320px]:gap-3 p-3 min-[320px]:p-4 bg-emerald-50/50 rounded-xl min-[320px]:rounded-2xl border border-emerald-100 hover:border-emerald-200 transition-all"
                        >
                          <div className="w-7 min-[400px]:w-9 h-7 min-[400px]:h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-[11px] min-[400px]:text-sm flex-shrink-0 overflow-hidden">
                            {r.avatar ? (
                              <img
                                src={r.avatar}
                                alt={r.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              r.username?.[0]?.toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 min-[320px]:gap-2 mb-1 flex-wrap">
                              <p className="text-[10px] min-[400px]:text-[13px] font-black text-gray-800">
                                {r.username}
                              </p>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <svg
                                    key={s}
                                    className="w-2.5 min-[400px]:w-3 h-2.5 min-[400px]:h-3"
                                    viewBox="0 0 24 24"
                                    fill={s <= r.rating ? "#FBA11F" : "none"}
                                    stroke="#FBA11F"
                                    strokeWidth="2"
                                  >
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                  </svg>
                                ))}
                              </div>
                              {r.updated_at !== r.created_at && (
                                <span className="text-[9px] min-[400px]:text-[10px] text-gray-400">
                                  edited
                                </span>
                              )}
                            </div>
                            {r.content && (
                              <p className="text-[11px] min-[400px]:text-[13px] text-gray-600 leading-relaxed">
                                {r.content}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                  {reviews.length > 3 && (
                    <button
                      onClick={() => setShowAllReviews(true)}
                      className="w-full mt-1 min-[320px]:mt-2 py-2 min-[320px]:py-2.5 rounded-xl border border-emerald-200 text-emerald-600 text-[10px] min-[320px]:text-xs font-bold hover:bg-emerald-50 transition-colors"
                    >
                      View all {reviews.length} reviews
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {}
          <div className="contents md:flex md:flex-col md:gap-6">
            <div className="order-2 md:order-none flex flex-col gap-5 sm:gap-6">
              {}
              <motion.div
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
              >
                <p className="text-[9px] min-[400px]:text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">
                  {recipe.category}
                </p>
                <h1 className="text-base min-[400px]:text-lg sm:text-2xl md:text-3xl xl:text-4xl font-black text-gray-900 leading-tight mb-2 break-words">
                  {recipe.title}
                </h1>
                {reviewStats.avg_rating && (
                  <div className="flex pb-5 items-center gap-0.5 min-[320px]:gap-1 ml-auto">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg
                        key={s}
                        className="w-3 min-[320px]:w-4 h-3 min-[320px]:h-4"
                        viewBox="0 0 24 24"
                        fill={
                          s <= Math.round(reviewStats.avg_rating)
                            ? "#059669"
                            : "none"
                        }
                        stroke="#059669"
                        strokeWidth="2"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                    <span className="text-xs min-[320px]:text-sm font-bold text-emerald-700 ml-0.5 min-[320px]:ml-1">
                      {reviewStats.avg_rating}
                    </span>
                  </div>
                )}
                <p className="text-[10px] min-[400px]:text-xs sm:text-sm text-gray-400">
                  By{" "}
                  <Link
                    to={`/profile/${recipe.username}`}
                    className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors"
                  >
                    {recipe.username || "Chef"}
                  </Link>
                </p>
              </motion.div>
              {}
              <motion.div
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-1 flex-wrap"
              >
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleLike}
                  className={`flex items-center gap-1 min-[320px]:gap-1.5 px-2.5 min-[320px]:px-4 py-1.5 min-[320px]:py-2 rounded-full border text-[10px] min-[320px]:text-xs sm:text-sm font-bold transition-all duration-200 ${
                    liked
                      ? "bg-[#FBA11F]/10 border-[#FBA11F]/30 text-[#FBA11F]"
                      : "border-gray-200 text-gray-500 hover:border-[#FBA11F]/40 hover:text-[#FBA11F]"
                  }`}
                >
                  <motion.span
                    animate={liked ? { scale: [1, 1.5, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <HeartIcon
                      filled={liked}
                      className={`w-3.5 min-[320px]:w-4 h-3.5 min-[320px]:h-4 ${liked ? "text-[#FBA11F]" : ""}`}
                    />
                  </motion.span>
                  {liked ? "Liked" : "Like"}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleSave}
                  className={`flex items-center gap-1 px-2.5 min-[320px]:px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border text-[10px] min-[320px]:text-[11px] sm:text-sm font-bold transition-all duration-200 ${
                    saved
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                      : "border-gray-200 text-gray-500 hover:border-emerald-200 hover:text-emerald-500"
                  }`}
                >
                  <motion.span
                    animate={saved ? { rotate: [0, -15, 15, 0] } : {}}
                    transition={{ duration: 0.4 }}
                  >
                    <BookmarkIcon
                      filled={saved}
                      className={`w-3.5 min-[320px]:w-4 h-3.5 min-[320px]:h-4 ${saved ? "text-emerald-600" : ""}`}
                    />
                  </motion.span>
                  {saved ? "Saved" : "Save"}
                </motion.button>

                {isOwner ? (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      <Link
                        to={`/edit/${recipe.id}-${toSlug(recipe.title)}`}
                        className="flex items-center gap-1 min-[320px]:gap-1.5 px-2.5 min-[320px]:px-4 py-1.5 min-[320px]:py-2 rounded-full border border-gray-200 text-[10px] min-[320px]:text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
                      >
                        <EditIcon className="w-3.5 min-[320px]:w-4 h-3.5 min-[320px]:h-4" />{" "}
                        Edit
                      </Link>
                    </motion.div>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center gap-1 min-[320px]:gap-1.5 px-2.5 min-[320px]:px-4 py-1.5 min-[320px]:py-2 rounded-full border border-red-200 text-[10px] min-[320px]:text-xs sm:text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
                    >
                      <TrashIcon className="w-3.5 min-[320px]:w-4 h-3.5 min-[320px]:h-4" />{" "}
                      Delete
                    </motion.button>
                  </>
                ) : (
                  user && (
                    <motion.div
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      <Link
                        to={`/messages/${recipe.user_id}`}
                        state={{ presetUsername: recipe.username }}
                        className="flex items-center gap-1 min-[320px]:gap-1.5 px-2.5 min-[320px]:px-4 py-1.5 min-[320px]:py-2 rounded-full bg-emerald-600 text-white text-[10px] min-[320px]:text-xs sm:text-sm font-bold hover:bg-emerald-700 transition-all shadow-sm"
                      >
                        <MailIcon className="w-3.5 min-[320px]:w-4 h-3.5 min-[320px]:h-4" />{" "}
                        Message
                      </Link>
                    </motion.div>
                  )
                )}
              </motion.div>

              {recipe.likes_count > 0 && (
                <motion.div
                  custom={2}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                >
                  <button
                    onClick={handleOpenLikes}
                    className="text-xs min-[320px]:text-sm font-semibold text-gray-500 hover:text-emerald-600 transition-colors"
                  >
                    Liked by{" "}
                    <span className="font-bold text-gray-900">
                      {recipe.likes_count}
                    </span>{" "}
                    {recipe.likes_count === 1 ? "person" : "people"}
                  </button>
                </motion.div>
              )}

              {}
              {(recipe.prep_time ||
                recipe.cook_time ||
                recipe.servings ||
                totalTime) > 0 && (
                <motion.div
                  custom={2}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-4 gap-1.5"
                >
                  {recipe.prep_time ? (
                    <StatCard
                      icon={
                        <ClockIcon className="w-4 min-[320px]:w-5 h-4 min-[320px]:h-5" />
                      }
                      label="Prep"
                      value={`${recipe.prep_time}m`}
                    />
                  ) : null}
                  {recipe.cook_time ? (
                    <StatCard
                      icon={
                        <FlameIcon className="w-4 min-[320px]:w-5 h-4 min-[320px]:h-5" />
                      }
                      label="Cook"
                      value={`${recipe.cook_time}m`}
                    />
                  ) : null}
                  {totalTime > 0 ? (
                    <StatCard
                      icon={
                        <ZapIcon className="w-4 min-[320px]:w-5 h-4 min-[320px]:h-5" />
                      }
                      label="Total"
                      value={`${totalTime}m`}
                    />
                  ) : null}
                  {recipe.servings ? (
                    <StatCard
                      icon={
                        <UsersIcon className="w-4 min-[320px]:w-5 h-4 min-[320px]:h-5" />
                      }
                      label="Serves"
                      value={recipe.servings}
                    />
                  ) : null}
                </motion.div>
              )}

              {}
              {recipe.description && (
                <motion.div
                  custom={3}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                >
                  <h2 className="text-[10px] min-[400px]:text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wide mb-1.5">
                    Summary
                  </h2>
                  <p className="text-gray-500 leading-relaxed text-[11px] min-[400px]:text-xs sm:text-sm sm:text-base">
                    {recipe.description}
                  </p>
                </motion.div>
              )}
            </div>

            {}
            <div className="order-5 md:order-none">
              <motion.div
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="border-t-2 border-gray-100 pt-5 sm:pt-6"
              >
                <div className="flex items-center gap-2 mb-3 sm:mb-5">
                  <div className="flex items-center gap-1 min-[400px]:gap-1.5 bg-gray-50 border border-gray-200 px-2 py-1 min-[400px]:py-1.5 rounded-xl">
                    <MessageIcon className="w-3.5 h-3.5 text-gray-500" />
                    <h2 className="text-xs min-[400px]:text-sm font-black text-gray-700">
                      Comments
                    </h2>
                  </div>
                  <span className="text-[9px] min-[400px]:text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 min-[400px]:px-2 py-0.5 rounded-full">
                    {comments.length}
                  </span>
                </div>
                {user ? (
                  <form
                    onSubmit={handleComment}
                    className="flex gap-1.5 min-[320px]:gap-2 mb-5 sm:mb-6"
                  >
                    <div className="w-7 min-[320px]:w-9 h-7 min-[320px]:h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs min-[320px]:text-sm flex-shrink-0 mt-0.5">
                      {user.username?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 flex gap-1.5 min-[320px]:gap-2 min-w-0">
                      <input
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Leave a note..."
                        className="flex-1 min-w-0 px-2.5 min-[320px]:px-4 py-2 min-[320px]:py-2.5 rounded-lg min-[320px]:rounded-xl border border-gray-200 text-xs min-[320px]:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all bg-white placeholder:text-gray-400"
                      />
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        type="submit"
                        disabled={commentSubmitting || !comment.trim()}
                        className="bg-emerald-600 text-white px-3 min-[320px]:px-5 py-2 min-[320px]:py-2.5 rounded-lg min-[320px]:rounded-xl text-xs min-[320px]:text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0"
                      >
                        {commentSubmitting ? "..." : "Post"}
                      </motion.button>
                    </div>
                  </form>
                ) : (
                  <div className="mb-5 sm:mb-6 p-3 min-[320px]:p-4 bg-gray-50 rounded-xl min-[320px]:rounded-2xl border border-gray-100 text-center">
                    <p className="text-xs min-[320px]:text-sm text-gray-500">
                      <Link
                        to="/login"
                        className="text-emerald-600 font-bold hover:underline"
                      >
                        Sign in
                      </Link>{" "}
                      to leave a comment
                    </p>
                  </div>
                )}
                <div className="flex flex-col gap-2 min-[320px]:gap-3">
                  {comments.length === 0 ? (
                    <div className="text-center py-6 min-[320px]:py-8">
                      <div className="w-10 min-[320px]:w-12 h-10 min-[320px]:h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-2 min-[320px]:mb-3">
                        <MessageIcon className="w-5 min-[320px]:w-6 h-5 min-[320px]:h-6 text-gray-300" />
                      </div>
                      <p className="text-xs min-[320px]:text-sm text-gray-400 font-medium">
                        No comments yet. Be the first!
                      </p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {comments.slice(0, 3).map((c, i) => (
                        <motion.div
                          key={c.id}
                          custom={i}
                          variants={commentSlide}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          layout
                          className="flex items-start gap-2 min-[320px]:gap-3 p-3 min-[320px]:p-4 bg-white rounded-xl min-[320px]:rounded-2xl border border-gray-100 group hover:border-gray-200 transition-all"
                        >
                          <div className="w-7 min-[320px]:w-9 h-7 min-[320px]:h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xs min-[320px]:text-sm flex-shrink-0">
                            {c.username?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-gray-800 mb-0.5">
                              {c.username}
                            </p>
                            <p className="text-[11px] min-[400px]:text-xs sm:text-sm text-gray-600 leading-relaxed break-words">
                              {c.content}
                            </p>
                          </div>
                          {user?.id === c.user_id && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteComment(c.id)}
                              className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-600 transition-all flex-shrink-0 w-5 min-[320px]:w-6 h-5 min-[320px]:h-6 flex items-center justify-center rounded-full hover:bg-red-50"
                            >
                              ✕
                            </motion.button>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                  {comments.length > 3 && (
                    <button
                      onClick={() => setShowAllComments(true)}
                      className="w-full mt-1 min-[320px]:mt-2 py-2 min-[320px]:py-2.5 rounded-xl border border-gray-200 text-gray-600 text-[10px] min-[320px]:text-xs font-bold hover:bg-gray-50 transition-colors"
                    >
                      View all {comments.length} comments
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {}
        {recipe.steps?.length > 0 && (
          <div className="mt-6 sm:mt-8 lg:mt-10">
            <motion.section
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-base min-[320px]:text-lg sm:text-xl font-black text-gray-900 mb-4 min-[320px]:mb-5">
                Instructions
              </h2>
              <ol className="space-y-3 min-[320px]:space-y-4">
                {recipe.steps.map((step, i) => (
                  <motion.li
                    key={i}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-40px" }}
                    className="flex gap-3 min-[320px]:gap-4 p-3 min-[320px]:p-4 sm:p-5 bg-white rounded-xl min-[320px]:rounded-2xl border border-gray-100 group hover:border-emerald-200 transition-all duration-200"
                  >
                    <span className="flex-shrink-0 w-6 min-[320px]:w-7 h-6 min-[320px]:h-7 sm:w-8 sm:h-8 bg-emerald-600 text-white rounded-lg min-[320px]:rounded-xl flex items-center justify-center text-[10px] min-[320px]:text-xs sm:text-sm font-black">
                      {i + 1}
                    </span>
                    <p className="text-xs min-[320px]:text-sm sm:text-base text-gray-700 leading-relaxed">
                      {step}
                    </p>
                  </motion.li>
                ))}
              </ol>
            </motion.section>
          </div>
        )}
      </div>

      {}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.45)" }}
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 16 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                <TrashIcon className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-black text-gray-900 text-center mb-2">
                Delete Recipe?
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                This action cannot be undone. The recipe will be permanently
                removed.
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

      {showLikesModal && (
        <RecipeLikesModal
          users={likesList}
          loading={likesLoading}
          onClose={() => setShowLikesModal(false)}
        />
      )}

      {showAllReviews && (
        <AllReviewsModal
          reviews={reviews}
          onClose={() => setShowAllReviews(false)}
        />
      )}

      {showAllComments && (
        <AllCommentsModal
          comments={comments}
          user={user}
          handleDeleteComment={handleDeleteComment}
          onClose={() => setShowAllComments(false)}
        />
      )}
    </div>
  );
}
