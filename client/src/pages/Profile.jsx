import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import RecipeCard from "../components/RecipeCard";
import {
  getUserProfile,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
  removeFollower,
  updateProfile,
  getLikedRecipes,
} from "../api/services";
import { useAuth } from "../context/AuthContext";

const EditSvg = ({ className = "w-4 h-4" }) => (
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

const MailSvg = ({ className = "w-4 h-4" }) => (
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

const ChefSvg = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
  </svg>
);

const PlusSvg = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const HeartSvg = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CalendarSvg = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const UserSvg = ({ className = "w-16 h-16" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const PlateStrokenSvg = ({ className = "w-16 h-16" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 11l1-4h16l1 4" />
    <rect x="2" y="11" width="20" height="3" rx="1" />
    <path d="M5 14v5a1 1 0 001 1h12a1 1 0 001-1v-5" />
    <path d="M9 9V7a3 3 0 016 0v2" />
  </svg>
);

const CheckSvg = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

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

const COVER_GRADIENTS = [
  "linear-gradient(135deg,#2A9D72 0%,#1a6b4e 100%)",
  "linear-gradient(135deg,#3b82f6 0%,#6366f1 100%)",
  "linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)",
  "linear-gradient(135deg,#8b5cf6 0%,#ec4899 100%)",
  "linear-gradient(135deg,#0ea5e9 0%,#14b8a6 100%)",
  "linear-gradient(135deg,#1f2937 0%,#374151 100%)",
];

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#fafaf8] pt-14 animate-pulse">
      <div className="h-44 bg-gray-200 w-full" />
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start gap-5 -mt-14 mb-8">
          <div className="w-28 h-28 rounded-3xl bg-gray-300 border-4 border-white shadow-lg flex-shrink-0" />
          <div className="flex-1 space-y-3 pt-16 sm:pt-4 w-full">
            <div className="h-7 bg-gray-200 rounded w-40" />
            <div className="h-4 bg-gray-200 rounded w-64" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-gray-200" />
          ))}
        </div>
      </div>
    </div>
  );
}

function UserListModal({
  title,
  users,
  onClose,
  currentUserId,
  isOwnProfile,
  listType,
  onRemoveUser,
}) {
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
          {}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-black text-gray-900 text-base">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>

          {}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {users.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <p className="text-4xl mb-2">👥</p>
                <p className="text-sm font-medium">
                  No {title.toLowerCase()} yet
                </p>
              </div>
            ) : (
              users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <Link
                    to={`/profile/${u.username}`}
                    onClick={onClose}
                    className="flex items-center gap-3 flex-1 min-w-0"
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
                  </Link>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {isOwnProfile &&
                      u.id !== currentUserId &&
                      listType === "followers" && (
                        <button
                          onClick={() => onRemoveUser(u.id, "followers")}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    {isOwnProfile &&
                      u.id !== currentUserId &&
                      listType === "following" && (
                        <button
                          onClick={() => onRemoveUser(u.id, "following")}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                        >
                          Unfollow
                        </button>
                      )}
                    {(!isOwnProfile || u.id === currentUserId) &&
                      u.id !== currentUserId && (
                        <Link
                          to={`/profile/${u.username}`}
                          onClick={onClose}
                          className="text-xs font-bold text-[#2A9D72]"
                        >
                          View →
                        </Link>
                      )}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Profile() {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, loginUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("recipes"); 
  const [modal, setModal] = useState(null); 

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    bio: "",
    avatar: "",
    coverIndex: 0,
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [followLoading, setFollowLoading] = useState(false);

  const isOwn = currentUser && profile && currentUser.id === profile.id;

  const loadProfile = useCallback(() => {
    setLoading(true);
    Promise.all([
      getUserProfile(identifier),
      getFollowers(identifier),
      getFollowing(identifier),
    ])
      .then(([profileRes, followersRes, followingRes]) => {
        const user = profileRes.data.user || profileRes.data;
        const recipeList = profileRes.data.recipes || [];
        setProfile(user);
        setRecipes(recipeList);
        setFollowers(Array.isArray(followersRes.data) ? followersRes.data : []);
        setFollowing(Array.isArray(followingRes.data) ? followingRes.data : []);
        setIsFollowing(followersRes.data.some((f) => f.id === currentUser?.id));
        setEditForm({
          username: user.username,
          bio: user.bio || "",
          avatar: user.avatar || "",
          coverIndex: user.cover_index || 0,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [identifier, currentUser?.id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (activeTab === "liked" && likedRecipes.length === 0) {
      getLikedRecipes(identifier)
        .then((res) => setLikedRecipes(Array.isArray(res.data) ? res.data : []))
        .catch(console.error);
    }
  }, [activeTab, identifier]);

  const handleFollow = async () => {
    if (!currentUser || !profile) {
      navigate("/login");
      return;
    }
    if (followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(profile.id);
        setFollowers((prev) => prev.filter((f) => f.id !== currentUser.id));
      } else {
        await followUser(profile.id);
        setFollowers((prev) => [...prev, currentUser]);
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleRemoveUserFromList = async (targetUserId, type) => {
    try {
      if (type === "followers") {
        await removeFollower(targetUserId);
        setFollowers(followers.filter((u) => u.id !== targetUserId));
      } else if (type === "following") {
        await unfollowUser(targetUserId);
        setFollowing(following.filter((u) => u.id !== targetUserId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async () => {
    if (!editForm.username.trim()) {
      setSaveError("Username is required");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const res = await updateProfile(profile.id, {
        username: editForm.username.trim(),
        bio: editForm.bio.trim(),
        avatar: editForm.avatar.trim() || null,
        cover_index: editForm.coverIndex,
      });
      setProfile(res.data);
      loginUser(localStorage.getItem("token"), res.data);
      setEditing(false);
    } catch (err) {
      setSaveError(err.response?.data?.error || "Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ProfileSkeleton />;
  if (!profile)
    return (
      <div className="min-h-screen bg-[#fafaf8] pt-14 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-300">
            <UserSvg className="w-8 h-8" />
          </div>
          <p className="text-lg font-bold text-gray-700 mb-2">Chef not found</p>
          <Link
            to="/"
            className="text-sm font-bold hover:underline"
            style={{ color: "#2A9D72" }}
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );

  const coverGradient =
    COVER_GRADIENTS[profile.cover_index ?? editForm.coverIndex ?? 0];
  const displayRecipes = activeTab === "liked" ? likedRecipes : recipes;
  const totalLikes = recipes.reduce((s, r) => s + (r.likes_count || 0), 0);

  return (
    <div className="min-h-screen bg-[#fafaf8] pt-14">
      {}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative h-44 sm:h-52 w-full overflow-hidden"
        style={{ background: coverGradient }}
      >
        {}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
      </motion.div>

      <div className="max-w-4xl mx-auto px-4">
        {}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative -mt-16 mb-6"
        >
          <div className="bg-white rounded-[1.5rem] min-[320px]:rounded-3xl border border-gray-100 shadow-sm px-4 min-[320px]:px-6 pt-6 min-[320px]:pt-8 pb-4 min-[320px]:pb-6 sm:px-8">
            {}
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 min-[320px]:gap-5">
              {}
              <div className="relative flex-shrink-0 -mt-16 min-[320px]:-mt-20 sm:-mt-24">
                <div
                  className="w-20 min-[320px]:w-28 h-20 min-[320px]:h-28 sm:w-32 sm:h-32 rounded-[1rem] min-[320px]:rounded-3xl border-4 border-white shadow-xl overflow-hidden"
                  style={{ background: "#2A9D72" }}
                >
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white">
                      {profile.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                {}
                <div
                  className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white shadow"
                  style={{ background: "#2A9D72" }}
                />
              </div>

              {}
              {!editing && (
                <div className="flex flex-wrap gap-2 sm:ml-auto">
                  {isOwn ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-1.5 px-2.5 min-[400px]:px-4 py-1.5 min-[400px]:py-2 rounded-full border border-gray-200 text-[10px] min-[400px]:text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        ✏️ Edit Profile
                      </motion.button>
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Link
                          to="/messages"
                          className="inline-flex items-center gap-1.5 px-2.5 min-[400px]:px-4 py-1.5 min-[400px]:py-2 rounded-full text-[10px] min-[400px]:text-sm font-bold text-white transition-colors"
                          style={{ background: "#2A9D72" }}
                        >
                          ✉️ Messages
                        </Link>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Link
                          to="/create"
                          className="inline-flex items-center gap-1.5 px-2.5 min-[400px]:px-4 py-1.5 min-[400px]:py-2 rounded-full text-[10px] min-[400px]:text-sm font-bold transition-colors"
                          style={{ color: "#2A9D72", background: "#E8F7F2" }}
                        >
                          🍳 New Recipe
                        </Link>
                      </motion.div>
                    </>
                  ) : (
                    currentUser && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleFollow}
                          disabled={followLoading}
                          className={`px-4 min-[320px]:px-5 py-2 rounded-full text-xs min-[320px]:text-sm font-bold transition-all disabled:opacity-60 ${
                            isFollowing
                              ? "border border-gray-200 text-gray-700 hover:bg-gray-50"
                              : "text-white"
                          }`}
                          style={!isFollowing ? { background: "#2A9D72" } : {}}
                        >
                          {followLoading ? (
                            "..."
                          ) : isFollowing ? (
                            <span className="flex items-center gap-1">
                              <CheckSvg className="w-3.5 h-3.5" /> Following
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <PlusSvg className="w-3.5 h-3.5" /> Follow
                            </span>
                          )}
                        </motion.button>
                        <motion.div
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Link
                            to={`/messages/${profile.id}`}
                            className="inline-flex items-center gap-1.5 px-3 min-[320px]:px-4 py-2 rounded-full border border-gray-200 text-xs min-[320px]:text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <MailSvg className="w-3.5 h-3.5" /> Message
                          </Link>
                        </motion.div>
                      </>
                    )
                  )}
                </div>
              )}
            </div>

            {}
            <AnimatePresence mode="wait">
              {editing ? (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-6 space-y-4 max-w-lg"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] min-[400px]:text-xs font-bold text-gray-500 mb-1.5">
                        Username
                      </label>
                      <input
                        value={editForm.username}
                        onChange={(e) =>
                          setEditForm({ ...editForm, username: e.target.value })
                        }
                        className="w-full px-3 min-[400px]:px-4 py-2 min-[400px]:py-2.5 rounded-lg min-[400px]:rounded-xl border border-gray-200 text-[10px] min-[400px]:text-sm focus:outline-none focus:ring-2 transition-all"
                        style={{ "--tw-ring-color": "#2A9D72" }}
                        placeholder="Username"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] min-[400px]:text-xs font-bold text-gray-500 mb-1.5">
                        Avatar URL
                      </label>
                      <input
                        value={editForm.avatar}
                        onChange={(e) =>
                          setEditForm({ ...editForm, avatar: e.target.value })
                        }
                        className="w-full px-3 min-[400px]:px-4 py-2 min-[400px]:py-2.5 rounded-lg min-[400px]:rounded-xl border border-gray-200 text-[10px] min-[400px]:text-sm focus:outline-none focus:ring-2 transition-all"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] min-[400px]:text-xs font-bold text-gray-500 mb-1.5">
                      Bio
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) =>
                        setEditForm({ ...editForm, bio: e.target.value })
                      }
                      rows={2}
                      className="w-full px-3 min-[400px]:px-4 py-2 min-[400px]:py-2.5 rounded-lg min-[400px]:rounded-xl border border-gray-200 text-[10px] min-[400px]:text-sm resize-none focus:outline-none focus:ring-2 transition-all"
                      placeholder="Tell the world about your cooking style..."
                    />
                  </div>

                  {}
                  <div>
                    <label className="block text-[10px] min-[400px]:text-xs font-bold text-gray-500 mb-2">
                      Profile Colour
                    </label>
                    <div className="flex gap-1.5 min-[400px]:gap-2 flex-wrap ">
                      {COVER_GRADIENTS.map((g, i) => (
                        <button
                          key={i}
                          onClick={() =>
                            setEditForm({ ...editForm, coverIndex: i })
                          }
                          className={`w-6 min-[400px]:w-8 h-6 min-[400px]:h-8 rounded-[10px] min-[400px]:rounded-xl transition-all ${
                            editForm.coverIndex === i
                              ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                              : "hover:scale-105"
                          }`}
                          style={{ background: g }}
                        />
                      ))}
                    </div>
                  </div>

                  {saveError && (
                    <p className="text-red-500 text-xs font-medium">
                      {saveError}
                    </p>
                  )}

                  <div className="flex gap-1.5 min-[400px]:gap-2 pt-1">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex-1 text-white text-[10px] min-[400px]:text-sm font-bold px-2 min-[400px]:px-4 py-2 min-[400px]:py-2.5 rounded-lg min-[400px]:rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-1 min-[400px]:gap-2 whitespace-nowrap"
                      style={{ background: "#2A9D72" }}
                    >
                      {saving ? (
                        <motion.svg
                          animate={{ rotate: 360 }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.8,
                            ease: "linear",
                          }}
                          className="h-3 min-[400px]:h-4 w-3 min-[400px]:w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </motion.svg>
                      ) : (
                        "✓ Save Changes"
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setEditing(false);
                        setSaveError("");
                      }}
                      className="flex-1 border border-gray-200 text-[10px] min-[400px]:text-sm font-bold px-2 min-[400px]:px-4 py-2 min-[400px]:py-2.5 rounded-lg min-[400px]:rounded-xl hover:bg-gray-50 transition-colors text-gray-700 whitespace-nowrap"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-4"
                >
                  {}
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-base min-[420px]:text-xl sm:text-2xl font-black text-gray-900">
                      @{profile.username}
                    </h1>
                    {isOwn && (
                      <span
                        className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                        style={{ background: "#E8F7F2", color: "#2A9D72" }}
                      >
                        You
                      </span>
                    )}
                  </div>

                  {}
                  {profile.bio && (
                    <p className="text-gray-500 text-[11px] min-[420px]:text-sm mt-1.5 max-w-md leading-relaxed">
                      {profile.bio}
                    </p>
                  )}

                  {}
                  <div className="flex flex-wrap items-center gap-2 mt-3 text-[10px] min-[420px]:text-xs text-gray-400">
                    {profile.created_at && (
                      <span className="flex items-center gap-1">
                        <CalendarSvg className="w-3.5 h-3.5" /> Member since{" "}
                        {formatDate(profile.created_at)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <HeartSvg className="w-3.5 h-3.5 text-red-400" />{" "}
                      {totalLikes.toLocaleString()} total likes
                    </span>
                  </div>

                  {}
                  <div className="flex gap-1.5 min-[320px]:gap-3 mt-4 min-[320px]:mt-5 flex-wrap">
                    {[
                      { label: "Recipes", value: recipes.length, key: null },
                      {
                        label: "Followers",
                        value: followers.length,
                        key: "followers",
                      },
                      {
                        label: "Following",
                        value: following.length,
                        key: "following",
                      },
                    ].map((stat) => (
                      <motion.button
                        key={stat.label}
                        whileHover={{ scale: stat.key ? 1.05 : 1 }}
                        whileTap={{ scale: stat.key ? 0.97 : 1 }}
                        onClick={() => stat.key && setModal(stat.key)}
                        className={`flex flex-col items-center px-2.5 min-[420px]:px-5 py-2 min-[420px]:py-3 rounded-xl min-[420px]:rounded-2xl transition-all ${
                          stat.key
                            ? "bg-[#fafaf8] hover:bg-[#E8F7F2] cursor-pointer border border-gray-100"
                            : "bg-[#fafaf8] border border-gray-100"
                        }`}
                      >
                        <span className="text-sm min-[400px]:text-xl font-black text-gray-900">
                          {stat.value}
                        </span>
                        <span className="text-[8px] min-[400px]:text-xs text-gray-500 font-medium mt-0.5">
                          {stat.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {}
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-4 min-[320px]:mb-5 w-full overflow-x-auto pb-1"
        >
          <div className="flex gap-0.5 min-[400px]:gap-1 bg-white border border-gray-100 rounded-[14px] min-[400px]:rounded-2xl p-1 shadow-sm w-fit">
            {[
              {
                key: "recipes",
                label: `Recipes (${recipes.length})`,
                icon: <ChefSvg className="w-4 h-4" />,
              },
              {
                key: "liked",
                label: `Liked`,
                icon: <HeartSvg className="w-4 h-4 text-red-400" />,
              },
            ].map((tab) => (
              <motion.button
                key={tab.key}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1 min-[400px]:gap-1.5 px-3 min-[400px]:px-5 py-1.5 min-[400px]:py-2 rounded-[10px] min-[400px]:rounded-xl text-[10px] min-[400px]:text-sm font-bold transition-all ${
                  activeTab === tab.key
                    ? "text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                style={activeTab === tab.key ? { background: "#2A9D72" } : {}}
              >
                {tab.icon} {tab.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="pb-12"
        >
          {}
          {isOwn && activeTab === "recipes" && (
            <div className="flex items-center justify-end mb-4">
              <Link
                to="/create"
                className="text-sm font-bold hover:underline"
                style={{ color: "#2A9D72" }}
              >
                + Add Recipe
              </Link>
            </div>
          )}

          <AnimatePresence mode="wait">
            {displayRecipes.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20 bg-white rounded-3xl border border-gray-100"
              >
                <div className="text-5xl mb-3">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto text-gray-300">
                    {activeTab === "liked" ? (
                      <HeartSvg className="w-8 h-8 text-red-300" />
                    ) : (
                      <PlateStrokenSvg className="w-8 h-8" />
                    )}
                  </div>
                </div>
                <p className="font-semibold text-gray-600 mb-1">
                  {activeTab === "liked"
                    ? isOwn
                      ? "No liked recipes yet."
                      : "No liked recipes."
                    : "No recipes yet."}
                </p>
                {isOwn && activeTab === "recipes" && (
                  <Link
                    to="/create"
                    className="mt-2 inline-block text-sm font-bold hover:underline"
                    style={{ color: "#2A9D72" }}
                  >
                    Create your first recipe!
                  </Link>
                )}
                {isOwn && activeTab === "liked" && (
                  <Link
                    to="/"
                    className="mt-2 inline-block text-sm font-bold hover:underline"
                    style={{ color: "#2A9D72" }}
                  >
                    Explore recipes to like
                  </Link>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-3 gap-3 min-[400px]:gap-4"
              >
                {displayRecipes.map((recipe, i) => (
                  <motion.div key={recipe.id} variants={fadeUp} custom={i}>
                    <RecipeCard recipe={recipe} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {}
      <AnimatePresence>
        {modal === "followers" && (
          <UserListModal
            title="Followers"
            users={followers}
            currentUserId={currentUser?.id}
            isOwnProfile={isOwn}
            listType="followers"
            onRemoveUser={handleRemoveUserFromList}
            onClose={() => setModal(null)}
          />
        )}
        {modal === "following" && (
          <UserListModal
            title="Following"
            users={following}
            currentUserId={currentUser?.id}
            isOwnProfile={isOwn}
            listType="following"
            onRemoveUser={handleRemoveUserFromList}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
