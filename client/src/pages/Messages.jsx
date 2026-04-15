import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getConversations, getMessages, sendMessage, deleteConversation } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Send, MessageCircle, Sparkles, MoreVertical } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function Messages() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);
  const { socket } = useNotifications();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (!user || !socket) return;

    const handleNewMessage = (newMessage) => {
      getConversations()
        .then((res) => setConversations(res.data))
        .catch(console.error);

      setMessages((prev) => {
        const currentUserId = window.__activeChatUserId__;
        const involves = currentUserId && (
          String(newMessage.sender_id) === String(currentUserId) ||
          String(newMessage.receiver_id) === String(currentUserId)
        );
        if (!involves) return prev;
        if (prev.find(m => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    };

    const handleTyping = (fromUserId) => {
      const currentUserId = window.__activeChatUserId__;
      if (currentUserId && String(fromUserId) === String(currentUserId)) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = (fromUserId) => {
      const currentUserId = window.__activeChatUserId__;
      if (currentUserId && String(fromUserId) === String(currentUserId)) {
        setIsTyping(false);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
      socket.emit('leave_chat');
      window.__activeChatUserId__ = null;
    };
  }, [user, socket]);

  useEffect(() => {
    window.__activeChatUserId__ = userId || null;

    if (userId && socket && socket.connected) {
      socket.emit('join_chat', userId);
    } else if (userId && socket) {
      socket.once('connect', () => socket.emit('join_chat', userId));
    }

    setIsTyping(false);
  }, [userId, socket]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    getConversations()
      .then((res) => setConversations(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, navigate]);

  useEffect(() => {
    if (userId) {
      setMessages([]);
      getMessages(userId)
        .then((res) => setMessages(Array.isArray(res.data) ? res.data : []))
        .catch(console.error);
    } else {
      setMessages([]);
    }
  }, [userId]);

  useEffect(() => {
    const container = document.getElementById('messages-container');
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    if (userId && inputRef.current) inputRef.current.focus();
  }, [userId]);

  const handleTextChange = useCallback((e) => {
    setText(e.target.value);
    if (!socket || !userId) return;

    socket.emit('typing', userId);
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket?.emit('stop_typing', userId);
    }, 1500);
  }, [userId, socket]);

  const handleDeleteConversation = async () => {
    if (!confirmDelete) return;
    try {
      await deleteConversation(confirmDelete.userId);
      setConversations(prev => prev.filter(c => String(c.user_id) !== String(confirmDelete.userId)));
      if (String(userId) === String(confirmDelete.userId)) navigate('/messages');
      setConfirmDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    socket?.emit('stop_typing', userId);
    clearTimeout(typingTimerRef.current);
    setSending(true);
    try {
      const res = await sendMessage(userId, { content: text });
      
      setMessages((prev) => {
        if (prev.find(m => m.id === res.data.id)) return prev;
        return [...prev, res.data];
      });
      setText('');
      getConversations().then((r) => setConversations(r.data));
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find((c) => String(c.user_id) === String(userId));
  const displayUsername = activeConv?.username || location.state?.presetUsername || 'User';
  const isMobileChatActive = !!userId;

  return (
    <div className="flex flex-col h-[100dvh] bg-[#f9fafb] pt-[52px] sm:pt-[60px] md:pt-[72px]">
      <div className="flex-1 max-w-7xl w-full mx-auto p-0 md:p-4 md:mb-4 flex flex-col md:flex-row border-t md:border border-gray-200 bg-white md:shadow-xl md:rounded-3xl overflow-hidden md:shadow-emerald-900/5">

        {}
        <div className={`flex-col border-r border-gray-100 ${isMobileChatActive ? 'hidden md:flex' : 'flex'} w-full md:w-[320px] lg:w-[380px] shrink-0`}>
          <div className="px-4 md:px-5 py-3 md:py-4 border-b border-gray-100/80 bg-white sticky top-0 z-10 hidden md:block">
            <h1 className="text-lg md:text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              Messages
              <span className="flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-[10px] p-1">
                <MessageCircle size={15} strokeWidth={2.5} />
              </span>
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto custom-scroll">
            {loading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-11 h-11 rounded-full bg-emerald-50 shrink-0" />
                    <div className="flex-1 py-1 space-y-2">
                      <div className="h-3 w-1/3 bg-gray-100 rounded-full" />
                      <div className="h-2 w-3/4 bg-gray-50 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3 border border-emerald-100">
                  <MessageCircle size={22} className="text-emerald-400" />
                </div>
                <p className="text-sm font-bold text-gray-800 mb-1">No messages yet</p>
                <p className="text-xs text-gray-400">Start a chat from any recipe page.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {conversations.map((conv) => {
                  const isActive = String(conv.user_id) === String(userId);
                  return (
                    <div key={conv.user_id} className={`relative flex items-center gap-3 px-3 md:px-4 py-3 transition-all group ${isActive ? 'bg-emerald-50' : 'hover:bg-gray-50'}`}>
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-emerald-500 rounded-r-full" />}
                      <Link to={`/messages/${conv.user_id}`} className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center text-xs md:text-sm font-black shrink-0 ${isActive ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-emerald-100 text-emerald-700'}`}>
                          {conv.username?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-xs md:text-sm truncate ${isActive ? 'text-emerald-900' : 'text-gray-900'}`}>
                            {conv.username}
                          </p>
                          <p className={`text-[10px] md:text-xs truncate font-medium ${isActive ? 'text-emerald-600' : 'text-gray-500'}`}>
                            {conv.last_message || 'Start chatting...'}
                          </p>
                        </div>
                      </Link>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.preventDefault(); setConfirmDelete({ userId: conv.user_id, username: conv.username }); }}
                        className="shrink-0 opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        title="Delete conversation"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </motion.button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {}
        <div className={`flex-1 flex flex-col bg-[#FDFCFC] ${!isMobileChatActive ? 'hidden md:flex' : 'flex'} overflow-hidden`}>
          {!userId ? (
            <div className="h-full flex flex-col items-center justify-center p-6 bg-gray-50/50">
              <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center mb-4 rotate-3 hover:-rotate-3 transition-transform duration-500">
                <Sparkles size={26} className="text-emerald-400" />
              </div>
              <h2 className="text-base font-bold text-gray-800 mb-1">Your Inbox</h2>
              <p className="text-xs text-gray-500 text-center max-w-[220px] leading-relaxed">Select a conversation or start one from a recipe page.</p>
            </div>
          ) : (
            <>
              {}
              <div className="h-[56px] md:h-[64px] shrink-0 border-b border-gray-100 bg-white flex items-center px-2 md:px-5 shadow-sm">
                <Link to="/messages" className="md:hidden p-2 mr-1 text-gray-500 bg-gray-50 rounded-xl active:bg-gray-100 transition-colors">
                  <ChevronLeft size={18} strokeWidth={2.5} />
                </Link>
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center font-black text-xs md:text-sm shadow-md shadow-emerald-500/20 shrink-0 ml-1">
                  {displayUsername[0]?.toUpperCase() || '?'}
                </div>
                <div className="ml-2 md:ml-3 min-w-0">
                  <p className="font-bold text-gray-900 text-xs md:text-sm truncate leading-tight">@{displayUsername}</p>
                  <AnimatePresence mode="wait">
                    {isTyping ? (
                      <motion.div
                        key="typing-status"
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -3 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-1"
                      >
                        <span className="text-[10px] md:text-[11px] font-semibold text-emerald-500">typing</span>
                        <span className="flex items-end gap-[3px] pb-[1px]">
                          {[0, 1, 2].map(i => (
                            <motion.span
                              key={i}
                              className="w-[3px] h-[3px] rounded-full bg-emerald-500 block"
                              animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
                            />
                          ))}
                        </span>
                      </motion.div>
                    ) : (
                      <motion.p
                        key="online-status"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-[10px] md:text-[11px] font-semibold text-emerald-500"
                      >
                        Online
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <button className="ml-auto p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors shrink-0">
                  <MoreVertical size={17} />
                </button>
              </div>

              {}
              <div id="messages-container" className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-4 flex flex-col gap-2 custom-scroll">
                {messages.length === 0 && !isTyping && (
                  <div className="flex flex-col items-center justify-center flex-1 opacity-60">
                    <p className="bg-emerald-100 text-emerald-800 text-[10px] md:text-xs font-black px-4 py-1.5 rounded-full mb-2 uppercase tracking-wide">New Chat</p>
                    <p className="text-xs text-gray-500 font-medium">Say hi to @{displayUsername}!</p>
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => {
                    const isMine = msg.sender_id === user?.id;
                    return (
                      <motion.div
                        key={msg.id || i}
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] md:max-w-[65%] break-words flex flex-col ${
                          isMine
                            ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-sm shadow-sm shadow-emerald-600/10'
                            : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm shadow-sm'
                        } px-3 sm:px-4 py-2 sm:py-2.5`}>
                          <span className="text-[12px] sm:text-[13px] md:text-sm font-medium leading-snug">{msg.content}</span>
                          <span className={`text-[9px] mt-1 font-medium opacity-60 ${isMine ? 'text-right text-white' : 'text-right text-gray-400'}`}>
                            {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      key="typing-bubble"
                      initial={{ opacity: 0, y: 10, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm px-4 py-3 flex items-center gap-[5px]">
                        {[0, 1, 2].map(i => (
                          <motion.span
                            key={i}
                            className="w-2 h-2 rounded-full bg-emerald-400 block"
                            animate={{ opacity: [0.4, 1, 0.4], y: [0, -4, 0] }}
                            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.22, ease: 'easeInOut' }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>

              {}
              <div className="shrink-0 bg-white border-t border-gray-100 px-2 sm:px-3 md:px-5 py-2 sm:py-3 pb-5 md:pb-3">
                <form
                  onSubmit={handleSend}
                  className="flex items-center gap-1.5 md:gap-2 bg-gray-50 p-1 md:p-1.5 rounded-2xl border border-gray-200 focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-50 transition-all duration-200"
                >
                  <input
                    ref={inputRef}
                    value={text}
                    onChange={handleTextChange}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent px-2.5 md:px-3 py-1.5 md:py-2 text-sm outline-none placeholder:text-gray-400 text-gray-800 min-w-0"
                  />
                  <motion.button
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    type="submit"
                    disabled={sending || !text.trim()}
                    className="p-2 sm:p-2.5 md:p-3 bg-emerald-600 text-white rounded-xl disabled:opacity-40 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-colors flex items-center justify-center shrink-0"
                  >
                    {sending
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <Send size={15} strokeWidth={2.5} />
                    }
                  </motion.button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      {}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </div>
              <h3 className="text-base font-black text-gray-900 text-center mb-1">Delete Conversation?</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                All messages with <span className="font-bold text-gray-800">@{confirmDelete.username}</span> will be permanently deleted for you.
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteConversation}
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