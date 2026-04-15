import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../api/services';

const toSlug = (title) =>
  title?.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') || '';

function notifLink(notif) {
  switch (notif.type) {
    case 'like':
    case 'comment':
    case 'new_recipe':
      return `/recipe/${notif.related_id}-${toSlug(notif.related_recipe_title)}`;
    case 'message':
      return `/messages/${notif.related_id}`;
    case 'follow':
      return `/profile/${notif.related_username || notif.related_id}`;
    default:
      return null;
  }
}

function notifIcon(type) {
  switch (type) {
    case 'like':       return '❤️';
    case 'comment':    return '💬';
    case 'new_recipe': return '✨';
    case 'follow':     return '👤';
    case 'message':    return '✉️';
    default:           return '🔔';
  }
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

function NotifCard({ notif, index, onRead }) {
  const navigate = useNavigate();
  const link = notifLink(notif);
  const icon = notifIcon(notif.type);
  const isUnread = !notif.is_read;

  const handleClick = async () => {
    if (isUnread) {
      await onRead(notif.id);
    }
    if (link) navigate(link);
  };

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      layout
      onClick={handleClick}
      className={`relative flex items-start gap-2 min-[450px]:gap-3 p-3 min-[450px]:p-4 rounded-2xl border transition-all cursor-pointer group ${
        isUnread
          ? 'bg-emerald-50/60 border-emerald-100 hover:bg-emerald-50'
          : 'bg-white border-gray-100 hover:bg-gray-50'
      }`}
    >
      {isUnread && (
        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
      )}
      <div className={`w-8 min-[450px]:w-10 h-8 min-[450px]:h-10 rounded-xl flex items-center justify-center text-base min-[450px]:text-lg shrink-0 ${
        isUnread ? 'bg-emerald-100' : 'bg-gray-100'
      }`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0 pr-3 min-[450px]:pr-4">
        <p className={`text-[11px] min-[450px]:text-xs sm:text-sm leading-snug ${isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-600'}`}>
          {notif.message}
        </p>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-1 font-medium">
          {timeAgo(notif.created_at)}
        </p>
        {link && (
          <p className="text-[10px] text-emerald-600 font-bold mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            Tap to view →
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function Notifications() {
  const { user } = useAuth();
  const { resetUnread } = useNotifications();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setLoading(true);
    getNotifications()
      .then((res) => {
        setNotifications(Array.isArray(res.data) ? res.data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleRead = useCallback(async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      resetUnread();
    } catch (e) {
      console.error(e);
    }
  }, [resetUnread]);

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      resetUnread();
    } catch (e) {
      console.error(e);
    } finally {
      setMarkingAll(false);
    }
  };

  const totalUnreadCount = notifications.filter((n) => !n.is_read).length;
  const displayedNotifications = expanded ? notifications : notifications.slice(0, 8);
  const unread = displayedNotifications.filter((n) => !n.is_read);
  const read   = displayedNotifications.filter((n) =>  n.is_read);

  return (
    <div className="min-h-screen bg-[#fafaf8] pt-14">
      <div className="max-w-2xl mx-auto px-3 min-[450px]:px-6 py-4 min-[450px]:py-6 sm:py-10">

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-xl min-[450px]:text-2xl sm:text-3xl font-black text-gray-900">Notifications</h1>
            <p className="text-xs min-[450px]:text-sm text-gray-400 mt-0.5">
              {totalUnreadCount > 0 ? `${totalUnreadCount} unread` : 'All caught up!'}
            </p>
          </div>
          {totalUnreadCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleMarkAll}
              disabled={markingAll}
              className="text-xs sm:text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl hover:bg-emerald-100 transition-all disabled:opacity-50"
            >
              {markingAll ? 'Marking...' : '✓ Mark all read'}
            </motion.button>
          )}
        </motion.div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
              className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full"
            />
            <p className="text-sm text-gray-400 font-medium">Loading notifications…</p>
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="text-6xl mb-4">🔔</div>
            <p className="text-lg font-black text-gray-800 mb-1">No notifications yet</p>
            <p className="text-sm text-gray-400 max-w-xs">
              When someone likes, comments, or follows you — it will show up here.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold"
              style={{ background: '#2A9D72', boxShadow: '0 8px 20px -4px rgba(42,157,114,0.3)' }}
            >
              Browse Recipes
            </Link>
          </motion.div>
        )}

        <div className={`transition-all ${expanded ? 'max-h-[65vh] overflow-y-auto pr-2 min-[450px]:pr-4 -mr-2 min-[450px]:-mr-4 custom-scroll' : ''}`}>
          
          {!loading && unread.length > 0 && (
            <div className="mb-6">
              <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-3 px-1">
                Unread
              </p>
              <div className="flex flex-col gap-2">
                <AnimatePresence>
                  {unread.map((n, i) => (
                    <NotifCard key={n.id} notif={n} index={i} onRead={handleRead} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {!loading && read.length > 0 && (
            <div>
              {unread.length > 0 && (
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3 px-1">
                  Earlier
                </p>
              )}
              <div className="flex flex-col gap-2">
                <AnimatePresence>
                  {read.map((n, i) => (
                    <NotifCard key={n.id} notif={n} index={i} onRead={handleRead} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {!loading && !expanded && notifications.length > 8 && (
          <div className="mt-6 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setExpanded(true)}
              className="text-xs sm:text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-6 py-2.5 rounded-xl hover:bg-emerald-100 transition-all shadow-sm"
            >
              See all notifications ↓
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
