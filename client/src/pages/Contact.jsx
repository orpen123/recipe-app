import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MailSvg = () => (
  <svg className="w-6 min-[320px]:w-8 h-6 min-[320px]:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
  </svg>
);

const CheckSvg = () => (
  <svg className="w-10 min-[320px]:w-14 h-10 min-[320px]:h-14 text-emerald-500 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setLoading(true);
      try {
        await fetch("https://formsubmit.co/ajax/soulaymaane@gmail.com", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            message: formData.message,
            _subject: "New Matbakhy Contact Message!"
          }),
        });
        
        setSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
      } catch (error) {
        console.error(error);
        alert("Well, this is embarrassing! Something went wrong sending the message.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] pt-20 min-[320px]:pt-24 px-3 min-[320px]:px-4 pb-16 relative overflow-hidden">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] sm:w-full h-80 min-[320px]:h-96 bg-gradient-to-b from-emerald-100/40 to-transparent pointer-events-none z-0"></div>
      
      <div className="max-w-2xl mx-auto relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl min-[320px]:rounded-[2rem] p-5 min-[320px]:p-8 sm:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden relative"
        >
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>

          <div className="flex justify-center mb-4 min-[320px]:mb-6 pt-2">
            <div className="w-12 min-[320px]:w-16 h-12 min-[320px]:h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
               <MailSvg />
            </div>
          </div>
          
          <h1 className="text-2xl min-[320px]:text-3xl sm:text-4xl font-black text-center text-gray-900 mb-2 tracking-tight">
            Get in Touch
          </h1>
          <p className="text-center text-gray-500 text-[10px] min-[320px]:text-xs sm:text-sm mb-6 min-[320px]:mb-8 px-1 min-[320px]:px-4">
            Have a question, suggestion, or just want to say hi? We'd love to hear from you! Just fill out the form below.
          </p>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 min-[320px]:py-10"
              >
                <div className="mb-4 min-[320px]:mb-6">
                  <div className="w-20 min-[320px]:w-24 h-20 min-[320px]:h-24 rounded-full bg-emerald-50 flex items-center justify-center mx-auto border-4 border-emerald-100">
                     <CheckSvg />
                  </div>
                </div>
                <h2 className="text-xl min-[320px]:text-2xl font-bold text-gray-900 mb-2">Message Sent!</h2>
                <p className="text-gray-500 mb-6 text-[10px] min-[320px]:text-sm">
                  Thank you for reaching out. Your message securely flew to our inbox.
                </p>
                <p className="text-[10px] min-[320px]:text-xs text-amber-600 bg-amber-50 rounded-xl p-3 mb-6 font-medium">
                  <strong>First Time Sender?</strong> You might receive an email from FormSubmit to verify your message. Please click it to make sure it reaches us!
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-5 min-[320px]:px-6 py-2 min-[320px]:py-2.5 rounded-full border-2 border-emerald-500 text-emerald-600 font-bold hover:bg-emerald-50 transition-all text-xs min-[320px]:text-sm"
                >
                  Send Another
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-3 min-[320px]:space-y-4"
              >
                <div>
                  <label className="block text-[10px] min-[320px]:text-sm font-bold text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 min-[320px]:px-4 py-2 min-[320px]:py-3 rounded-xl min-[320px]:rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-emerald-500 bg-gray-50 focus:bg-white transition-all text-[11px] min-[320px]:text-sm"
                    style={{ '--tw-ring-color': '#2A9D72' }}
                    placeholder="Chef John"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-[10px] min-[320px]:text-sm font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 min-[320px]:px-4 py-2 min-[320px]:py-3 rounded-xl min-[320px]:rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-emerald-500 bg-gray-50 focus:bg-white transition-all text-[11px] min-[320px]:text-sm"
                    style={{ '--tw-ring-color': '#2A9D72' }}
                    placeholder="john@example.com"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-[10px] min-[320px]:text-sm font-bold text-gray-700 mb-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3 min-[320px]:px-4 py-2 min-[320px]:py-3 rounded-xl min-[320px]:rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-emerald-500 bg-gray-50 focus:bg-white transition-all text-[11px] min-[320px]:text-sm resize-none"
                    style={{ '--tw-ring-color': '#2A9D72' }}
                    placeholder="How can we help you?"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 min-[320px]:py-4 mt-2 min-[320px]:mt-4 rounded-xl min-[320px]:rounded-2xl text-white font-black text-xs min-[320px]:text-sm transition-all hover:bg-emerald-500 shadow-[0_4px_14px_0_rgba(42,157,114,0.39)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: '#2A9D72' }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 min-[320px]:h-5 w-4 min-[320px]:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
