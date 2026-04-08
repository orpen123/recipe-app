import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] pt-24 px-4 pb-16">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100"
        >
          <div className="flex justify-center mb-6">
            <span className="text-5xl">📫</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-center text-gray-900 mb-2">
            Get in Touch
          </h1>
          <p className="text-center text-gray-500 text-sm mb-8">
            Have a question, suggestion, or just want to say hi? We'd love to hear from you!
          </p>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h2>
                <p className="text-gray-500 mb-6">Thank you for reaching out. We will get back to you shortly.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2 rounded-xl border border-[#2A9D72] text-[#2A9D72] font-semibold hover:bg-[#E8F7F2] transition-colors"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white transition-all text-sm"
                    style={{ '--tw-ring-color': '#2A9D72' }}
                    placeholder="Chef John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white transition-all text-sm"
                    style={{ '--tw-ring-color': '#2A9D72' }}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white transition-all text-sm resize-none"
                    style={{ '--tw-ring-color': '#2A9D72' }}
                    placeholder="How can we help you?"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 mt-2 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
                  style={{ background: '#2A9D72' }}
                >
                  Send Message
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
