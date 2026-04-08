import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import RecipeCard from '../components/RecipeCard';
import { getUserProfile, getFollowers, getFollowing, followUser, unfollowUser, updateProfile } from '../api/services';
import { useAuth } from '../context/AuthContext';

// ─── Variants ─────────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const statVariant = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i) => ({
    opacity: 1, scale: 1,
    transition: { delay: 0.3 + i * 0.1, type: 'spring', stiffness: 200, damping: 15 },
  }),
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#fafaf8] pt-14 animate-pulse">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
          <div className="w-24 h-24 rounded-2xl bg-gray-100 flex-shrink-0" />
          <div className="flex-1 space-y-3 w-full">
            <div className="h-7 bg-gray-100 rounded w-40" />
            <div className="h-4 bg-gray-100 rounded w-60" />
            <div className="flex gap-6 mt-2">
              {[1, 2, 3].map(i => <div key={i} className="h-12 w-16 bg-gray-100 rounded-xl" />)}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser, loginUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', bio: '', avatar: '' });
  const [saving, setSaving] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwn = currentUser?.id === Number(id);

  useEffect(() => {
    setLoading(true);
    Promise.all([getUserProfile(id), getFollowers(id), getFollowing(id)])
      .then(([profileRes, followersRes, followingRes]) => {
        setProfile(profileRes.data.user);
        setRecipes(profileRes.data.recipes || []);
        setFollowers(followersRes.data);
        setFollowing(followingRes.data);
        setIsFollowing(followersRes.data.some((f) => f.id === currentUser?.id));
        setEditForm({
          username: profileRes.data.user.username,
          bio: profileRes.data.user.bio || '',
          avatar: profileRes.data.user.avatar || '',
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleFollow = async () => {
    if (!currentUser || followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(id);
        setFollowers(followers.filter((f) => f.id !== currentUser.id));
      } else {
        await followUser(id);
        setFollowers([...followers, currentUser]);
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await updateProfile(id, editForm);
      setProfile(res.data);
      loginUser(localStorage.getItem('token'), res.data);
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ProfileSkeleton />;
  if (!profile) return (
    <div className="min-h-screen bg-[#fafaf8] pt-14 flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl mb-4">👤</p>
        <p className="text-lg font-bold text-gray-700 mb-2">User not found</p>
        <Link to="/" className="text-sm font-bold hover:underline" style={{ color: '#2A9D72' }}>← Back to Home</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafaf8] pt-14">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Profile Header Card */}
        <motion.div
          custom={0} variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-black flex-shrink-0 overflow-hidden border-2 shadow-sm"
              style={{ borderColor: '#E8F7F2' }}
            >
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white" style={{ background: '#2A9D72' }}>
                  {profile.username?.[0]?.toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left w-full">
              {editing ? (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-3 max-w-sm mx-auto sm:mx-0"
                  >
                    <input
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all"
                      style={{ '--tw-ring-color': '#2A9D72' }}
                      placeholder="Username"
                    />
                    <input
                      value={editForm.avatar}
                      onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition-all"
                      placeholder="Avatar URL"
                    />
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={2}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 transition-all"
                      placeholder="Short bio..."
                    />
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="flex-1 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                        style={{ background: '#2A9D72' }}
                      >
                        {saving ? (
                          <motion.svg animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                            className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </motion.svg>
                        ) : '✓ Save'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setEditing(false)}
                        className="flex-1 border border-gray-200 text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <>
                  <h1 className="text-xl sm:text-2xl font-black text-gray-900 mb-1">@{profile.username}</h1>
                  {profile.bio && <p className="text-gray-500 text-sm mb-3 max-w-sm mx-auto sm:mx-0">{profile.bio}</p>}

                  {/* Stats */}
                  <div className="flex gap-5 mt-3 justify-center sm:justify-start">
                    {[
                      { value: recipes.length, label: 'Recipes' },
                      { value: followers.length, label: 'Followers' },
                      { value: following.length, label: 'Following' },
                    ].map((stat, i) => (
                      <motion.div key={stat.label} custom={i} variants={statVariant} initial="hidden" animate="visible" className="text-center sm:text-left">
                        <p className="font-black text-gray-900 text-lg">{stat.value}</p>
                        <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2.5 mt-5 justify-center sm:justify-start flex-wrap">
                    {isOwn ? (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          onClick={() => setEditing(true)}
                          className="px-5 py-2.5 rounded-full border border-gray-200 text-sm font-bold hover:bg-gray-50 transition-colors text-gray-700"
                        >
                          ✏️ Edit Profile
                        </motion.button>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                          <Link
                            to="/messages"
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold text-white transition-colors"
                            style={{ background: '#2A9D72' }}
                          >
                            ✉️ Messages
                          </Link>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                          <Link
                            to="/create"
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold transition-colors"
                            style={{ color: '#2A9D72', background: '#E8F7F2' }}
                          >
                            🍳 New Recipe
                          </Link>
                        </motion.div>
                      </>
                    ) : currentUser && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          onClick={handleFollow}
                          disabled={followLoading}
                          className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all disabled:opacity-60 ${
                            isFollowing
                              ? 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                              : 'text-white'
                          }`}
                          style={!isFollowing ? { background: '#2A9D72' } : {}}
                        >
                          {isFollowing ? '✓ Following' : '+ Follow'}
                        </motion.button>
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                          <Link
                            to={`/messages/${profile.id}`}
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-gray-200 text-sm font-bold hover:bg-gray-50 transition-colors text-gray-700"
                          >
                            ✉️ Message
                          </Link>
                        </motion.div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Recipes Section */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg sm:text-xl font-black text-gray-900">
              Recipes
              <span className="ml-2 text-sm font-normal text-gray-400">({recipes.length})</span>
            </h2>
            {isOwn && (
              <Link
                to="/create"
                className="text-sm font-bold hover:underline"
                style={{ color: '#2A9D72' }}
              >
                + Add Recipe
              </Link>
            )}
          </div>
          {recipes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
              <div className="text-5xl mb-3">🍽️</div>
              <p className="font-semibold text-gray-600 mb-1">No recipes yet.</p>
              {isOwn && (
                <Link
                  to="/create"
                  className="mt-2 inline-block text-sm font-bold hover:underline"
                  style={{ color: '#2A9D72' }}
                >
                  Create your first recipe!
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {recipes.map((recipe, i) => (
                <motion.div
                  key={recipe.id}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                >
                  <RecipeCard recipe={recipe} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}