import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { markNotificationAsRead } from '../api/services';

const NotificationContext = createContext(null);
export const useNotifications = () => useContext(NotificationContext);

let _audioCtx = null;

function getAudioCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return _audioCtx;
}

function unlockAudio() {
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') ctx.resume();
}

function playChime() {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.45);
  } catch (_) {}
}

function getNotificationUrl(notif) {
  switch (notif.type) {
    case 'like':
    case 'comment':
    case 'new_recipe':
      
      if (notif.recipe_id && notif.recipe_title) {
        const slug = notif.recipe_title
          .toLowerCase().trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-');
        return `/recipe/${notif.recipe_id}-${slug}`;
      }
      return null;
    case 'follow':
      return notif.actor_username ? `/profile/${notif.actor_username}` : null;
    case 'message':
      return notif.sender_id ? `/messages/${notif.sender_id}` : null;
    default:
      return null;
  }
}

function NotificationToast({ notif, onClose, onNavigate, onRead }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icon = notif.type === 'like' ? '❤️'
    : notif.type === 'follow' ? '👤'
    : notif.type === 'comment' ? '💬'
    : notif.type === 'message' ? '✉️'
    : notif.type === 'new_recipe' ? '✨' : '🔔';

  const url = getNotificationUrl(notif);

  const handleClick = () => {
    onClose();
    if (onRead && notif.id) onRead(notif.id);
    if (url) onNavigate(url);
  };

  const typeLabel = notif.type === 'like' ? 'Tap to view recipe'
    : notif.type === 'follow' ? 'Tap to view profile'
    : notif.type === 'message' ? 'Tap to open chat'
    : notif.type === 'comment' ? 'Tap to view recipe'
    : notif.type === 'new_recipe' ? 'Tap to view recipe'
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.93 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      className={`flex items-center gap-3 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-black/10 p-3 pr-3 max-w-[310px] w-full ${url ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={url ? handleClick : undefined}
    >
      {}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] rounded-full bg-emerald-400 opacity-60"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 5.5, ease: 'linear' }}
        style={{ position: 'absolute', borderRadius: '0 0 16px 16px' }}
      />

      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 text-lg select-none">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[11px] md:text-xs font-bold text-gray-900 leading-snug line-clamp-2">
          {notif.message}
        </p>
        {typeLabel && url && (
          <p className="text-[9px] md:text-[10px] text-emerald-600 font-semibold mt-0.5">
            {typeLabel} →
          </p>
        )}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="shrink-0 w-6 h-6 ml-1 rounded-full flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors text-[10px] font-bold"
      >
        ✕
      </button>
    </motion.div>
  );
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [globalSocket, setGlobalSocket] = useState(null);
  const currentPathRef = useRef(location.pathname);
  const [toasts, setToasts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    currentPathRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    const unlock = () => {
      unlockAudio();
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('click', unlock);
    };
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('click', unlock);
    return () => {
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('click', unlock);
    };
  }, []);

  const addToast = useCallback((notif) => {
    if (notif.type === 'message' && currentPathRef.current.startsWith('/messages')) {
      return; 
    }
    const id = Date.now();
    setToasts(prev => [...prev, { ...notif, _toastId: id }]);
    setUnreadCount(prev => prev + 1);
    playChime();
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t._toastId !== id));
  }, []);

  const handleReadToast = useCallback(async (id) => {
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      if (id) await markNotificationAsRead(id);
    } catch (e) {
      console.error('Failed to mark notification as read', e);
    }
  }, []);

  const resetUnread = useCallback(() => setUnreadCount(0), []);
  const setUnread = useCallback((n) => setUnreadCount(n), []);

  useEffect(() => {
    if (!user) {
      if (globalSocket) {
        globalSocket.disconnect();
        setGlobalSocket(null);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000`;
    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['polling', 'websocket'],
    });
    setGlobalSocket(newSocket);

    newSocket.on('connect', () => newSocket.emit('setup', user.id));
    newSocket.on('new_notification', (notif) => addToast(notif));

    return () => {
      newSocket.disconnect();
      setGlobalSocket(null);
    };
  }, [user]);

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnread, resetUnread, socket: globalSocket }}>
      {children}

      <div className="fixed top-16 right-3 md:right-5 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
        <AnimatePresence initial={false}>
          {toasts.map(t => (
            <div key={t._toastId} className="pointer-events-auto relative">
              <NotificationToast
                notif={t}
                onClose={() => removeToast(t._toastId)}
                onRead={handleReadToast}
                onNavigate={navigate}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}
