import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getConversations, getMessages, sendMessage } from '../api/services';
import { useAuth } from '../context/AuthContext';

export default function Messages() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    getConversations()
      .then((res) => setConversations(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (userId) {
      getMessages(userId)
        .then((res) => setMessages(res.data))
        .catch(console.error);
    } else {
      setMessages([]);
    }
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (userId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [userId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await sendMessage(userId, { content: text });
      setMessages([...messages, res.data]);
      setText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find((c) => String(c.user_id) === String(userId));

  return (
    <div className="min-h-screen bg-[#fafaf8] pt-14">
      <div className="max-w-5xl mx-auto px-4 py-6 pb-10">
        <motion.h1
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-black text-gray-900 mb-5 flex items-center gap-2"
        >
          Messages
          <span className="text-gray-400 font-normal">✉️</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-0 h-[calc(100vh-200px)] bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* Conversations sidebar */}
          <div className="w-72 border-r border-gray-100 flex-shrink-0 flex flex-col">
            <div className="px-4 py-3 border-b border-gray-50">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Conversations</p>
            </div>
            <div className="flex-1 overflow-y-auto custom-scroll">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-gray-100 rounded w-24" />
                        <div className="h-2 bg-gray-100 rounded w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  <p className="text-4xl mb-2">💬</p>
                  <p className="text-sm font-medium">No conversations yet</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const isActive = String(conv.user_id) === String(userId);
                  return (
                    <motion.div key={conv.user_id} whileHover={{ x: 2 }} transition={{ duration: 0.15 }}>
                      <Link
                        to={`/messages/${conv.user_id}`}
                        className={`flex items-center gap-3 px-4 py-3.5 transition-colors border-b border-gray-50 ${
                          isActive ? 'bg-[#E8F7F2]' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 text-white"
                          style={{ background: isActive ? '#2A9D72' : '#d1fae5', color: isActive ? 'white' : '#065f46' }}
                        >
                          {conv.username?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm truncate ${isActive ? 'text-[#1F7A56]' : 'text-gray-900'}`}>
                            @{conv.username}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{conv.last_message || 'Start chatting'}</p>
                        </div>
                        {isActive && (
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#2A9D72' }} />
                        )}
                      </Link>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col min-w-0">
            {!userId ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-3">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="text-5xl"
                >
                  💬
                </motion.div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-500">Select a conversation</p>
                  <p className="text-xs text-gray-400 mt-0.5">to start chatting</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3 bg-white">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                    style={{ background: '#2A9D72' }}
                  >
                    {activeConv?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">@{activeConv?.username || 'User'}</p>
                    <p className="text-xs text-gray-400">Tap to view profile</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 custom-scroll bg-[#fafaf8]">
                  {messages.length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-center py-10">
                      <div>
                        <p className="text-4xl mb-2">✨</p>
                        <p className="text-sm text-gray-400 font-medium">Start the conversation!</p>
                      </div>
                    </div>
                  )}
                  <AnimatePresence initial={false}>
                    {messages.map((msg, i) => {
                      const isMine = msg.sender_id === user?.id;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.25 }}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs sm:max-w-sm px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm ${
                              isMine
                                ? 'text-white rounded-br-sm'
                                : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                            }`}
                            style={isMine ? { background: '#2A9D72' } : {}}
                          >
                            {msg.content}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-2 bg-white">
                  <input
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{ '--tw-ring-color': '#2A9D72' }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    type="submit"
                    disabled={sending || !text.trim()}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    style={{ background: '#2A9D72' }}
                  >
                    {sending ? (
                      <motion.svg animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                        className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </motion.svg>
                    ) : (
                      <>Send <span>→</span></>
                    )}
                  </motion.button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}