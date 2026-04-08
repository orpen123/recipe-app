import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../api/services';
import { useAuth } from '../context/AuthContext';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (notifications.every(n => n.is_read)) return;
    try {
      await markAllNotificationsAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications(notifications.map(n => 
          n.id === notification.id ? { ...n, is_read: 1 } : n
        ));
      } catch (err) {}
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fafaf8] pt-14 flex items-center justify-center text-gray-500">
        Please sign in to view notifications.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] pt-14">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-black text-gray-900 flex items-center gap-2"
          >
            Notifications
            <span className="text-gray-400 font-normal">🔔</span>
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMarkAllRead}
            disabled={notifications.every(n => n.is_read) || notifications.length === 0}
            className="text-xs font-bold px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mark all read
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-gray-100" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <p className="text-5xl mb-3 opacity-50">📭</p>
              <p className="font-semibold text-gray-500">You're all caught up!</p>
              <p className="text-sm mt-1">No new notifications here.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              <AnimatePresence>
                {notifications.map((notif, i) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={notif.type === 'message' ? `/messages/${notif.related_id}` : '#'}
                      onClick={() => handleNotificationClick(notif)}
                      className={`block px-6 py-5 transition-all border-b border-gray-50 last:border-0 hover:bg-gray-50 ${
                        !notif.is_read ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg ${
                          !notif.is_read ? 'bg-emerald-100 shadow-sm' : 'bg-gray-100'
                        }`}>
                          {notif.type === 'message' ? '✉️' : '🔔'}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className={`text-sm text-gray-800 ${!notif.is_read ? 'font-bold' : 'font-medium'}`}>
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notif.created_at).toLocaleDateString(undefined, { 
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        {!notif.is_read && (
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0 mt-2 shadow-sm" />
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
