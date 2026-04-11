import { motion } from 'framer-motion';

const DiscoverSvg = () => (
  <svg className="w-5 min-[320px]:w-6 h-5 min-[320px]:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const SaveSvg = () => (
  <svg className="w-5 min-[320px]:w-6 h-5 min-[320px]:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);
const ConnectSvg = () => (
  <svg className="w-5 min-[320px]:w-6 h-5 min-[320px]:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const ShareSvg = () => (
  <svg className="w-5 min-[320px]:w-6 h-5 min-[320px]:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
    <polyline points="16 6 12 2 8 6"/>
    <line x1="12" y1="2" x2="12" y2="15"/>
  </svg>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function About() {
  return (
    <div className="min-h-screen bg-[#fafaf8] pt-20 min-[320px]:pt-24 pb-16 min-[320px]:pb-20 px-3 min-[320px]:px-4 relative overflow-hidden">
      {}
      <div className="absolute top-0 right-0 -mr-20 min-[320px]:-mr-40 -mt-20 min-[320px]:-mt-40 w-64 min-[320px]:w-96 h-64 min-[320px]:h-96 bg-emerald-100/40 rounded-full blur-[60px] min-[320px]:blur-[80px] z-0 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 min-[320px]:-ml-40 -mb-20 min-[320px]:-mb-40 w-64 min-[320px]:w-96 h-64 min-[320px]:h-96 bg-emerald-50/40 rounded-full blur-[60px] min-[320px]:blur-[80px] z-0 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10 w-full overflow-hidden">
        
        {}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-10 min-[320px]:mb-16 sm:mb-24"
        >
          <div className="inline-flex items-center gap-1.5 min-[320px]:gap-2 px-2.5 min-[320px]:px-3 py-1 min-[320px]:py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] min-[320px]:text-xs sm:text-sm font-bold mb-4 min-[320px]:mb-6 shadow-sm">
            <span className="w-1.5 min-[320px]:w-2 h-1.5 min-[320px]:h-2 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]"></span>
            Our Mission
          </div>
          <h1 className="text-3xl min-[320px]:text-4xl sm:text-6xl md:text-7xl font-black text-gray-900 mb-4 min-[320px]:mb-6 tracking-tight leading-[1.1] break-words">
            Elevating <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400">
              Home Cooking.
            </span>
          </h1>
          <p className="text-[11px] min-[320px]:text-sm sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed px-1">
            We're building the ultimate community for food lovers. Discover, share, and connect through the universal language of delicious food.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-3 min-[320px]:gap-4 lg:gap-6"
        >
          {}
          <motion.div variants={itemVariants} className="bg-white p-5 min-[320px]:p-8 sm:p-10 rounded-3xl min-[320px]:rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] min-[320px]:shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 min-[320px]:w-32 h-24 min-[320px]:h-32 bg-emerald-50 rounded-bl-[3rem] min-[320px]:rounded-bl-[4rem] z-0 transition-transform duration-500 group-hover:scale-110"></div>
            <div className="relative z-10 w-10 min-[320px]:w-14 h-10 min-[320px]:h-14 rounded-xl min-[320px]:rounded-2xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center mb-4 min-[320px]:mb-6 shadow-sm">
              <DiscoverSvg />
            </div>
            <h3 className="relative z-10 text-lg min-[320px]:text-xl sm:text-2xl font-bold text-gray-900 mb-2 min-[320px]:mb-3">Discover Recipes</h3>
            <p className="relative z-10 text-gray-500 leading-relaxed text-[10px] min-[320px]:text-xs sm:text-base">
              Browse thousands of user-submitted meals from all around the globe. Filter by categories, cuisines, and difficulty perfectly tailored to your taste.
            </p>
          </motion.div>

          {}
          <motion.div variants={itemVariants} className="bg-emerald-600 p-5 min-[320px]:p-8 sm:p-10 rounded-3xl min-[320px]:rounded-[2rem] border border-emerald-500 shadow-md min-[320px]:shadow-lg hover:shadow-xl transition-all duration-300 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 min-[320px]:w-32 h-24 min-[320px]:h-32 bg-emerald-500 rounded-bl-[3rem] min-[320px]:rounded-bl-[4rem] z-0 transition-transform duration-500 group-hover:scale-110"></div>
            <div className="relative z-10 w-10 min-[320px]:w-14 h-10 min-[320px]:h-14 rounded-xl min-[320px]:rounded-2xl bg-white/20 text-white flex items-center justify-center mb-4 min-[320px]:mb-6 backdrop-blur-md shadow-sm">
              <SaveSvg />
            </div>
            <h3 className="relative z-10 text-lg min-[320px]:text-xl sm:text-2xl font-bold mb-2 min-[320px]:mb-3">Save Favorites</h3>
            <p className="relative z-10 text-emerald-50 leading-relaxed text-[10px] min-[320px]:text-xs sm:text-base">
              Build your private cookbook. Save recipes with a single tap and organize them into beautiful collections for quick access anytime you need.
            </p>
          </motion.div>

          {}
          <motion.div variants={itemVariants} className="bg-gray-900 p-5 min-[320px]:p-8 sm:p-10 rounded-3xl min-[320px]:rounded-[2rem] border border-gray-800 shadow-md min-[320px]:shadow-lg hover:shadow-xl transition-all duration-300 text-white relative overflow-hidden group md:col-span-2 lg:col-span-1">
             <div className="absolute inset-x-0 bottom-0 h-24 min-[320px]:h-40 bg-gradient-to-t from-gray-800/80 to-transparent pointer-events-none z-0"></div>
            <div className="relative z-10 w-10 min-[320px]:w-14 h-10 min-[320px]:h-14 rounded-xl min-[320px]:rounded-2xl bg-white/10 text-white flex items-center justify-center mb-4 min-[320px]:mb-6 backdrop-blur-md shadow-sm">
              <ConnectSvg />
            </div>
            <h3 className="relative z-10 text-lg min-[320px]:text-xl sm:text-2xl font-bold mb-2 min-[320px]:mb-3">Connect & Engage</h3>
            <p className="relative z-10 text-gray-400 leading-relaxed text-[10px] min-[320px]:text-xs sm:text-base">
              Follow your favorite home chefs, leave thoughtful reviews, exchange direct messages, and grow your culinary network globally.
            </p>
          </motion.div>

          {}
          <motion.div variants={itemVariants} className="bg-white p-5 min-[320px]:p-8 sm:p-10 rounded-3xl min-[320px]:rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] min-[320px]:shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-24 min-[320px]:w-40 h-24 min-[320px]:h-40 bg-emerald-50 rounded-tl-[3rem] min-[320px]:rounded-tl-[4rem] z-0 transition-transform duration-500 group-hover:scale-110"></div>
            <div className="relative z-10 w-10 min-[320px]:w-14 h-10 min-[320px]:h-14 rounded-xl min-[320px]:rounded-2xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center mb-4 min-[320px]:mb-6 shadow-sm">
              <ShareSvg />
            </div>
            <h3 className="relative z-10 text-lg min-[320px]:text-xl sm:text-2xl font-bold text-gray-900 mb-2 min-[320px]:mb-3">Share Creations</h3>
            <p className="relative z-10 text-gray-500 leading-relaxed text-[10px] min-[320px]:text-xs sm:text-base">
              Got a secret family recipe? Share it with the world. Upload stunning photos, neatly list ingredients, and guide others step-by-step.
            </p>
          </motion.div>
        </motion.div>

        {}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-14 min-[320px]:mt-20 sm:mt-24 pb-4 min-[320px]:pb-8 text-center px-2 min-[320px]:px-4"
        >
          <div className="text-4xl min-[320px]:text-5xl text-emerald-200 mb-1 min-[320px]:mb-2 font-serif opacity-60">"</div>
          <h2 className="text-xl min-[320px]:text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 leading-tight max-w-3xl mx-auto break-words">
            Good food is very often, even most often, <span className="font-black text-emerald-600 relative inline-block">simple food.<span className="absolute -bottom-0.5 min-[320px]:-bottom-1 w-full h-1 min-[320px]:h-1.5 bg-emerald-500 rounded-full left-0 opacity-20"></span></span>
          </h2>
          <p className="text-gray-400 mt-4 min-[320px]:mt-6 font-bold uppercase tracking-[0.1em] min-[320px]:tracking-[0.2em] text-[9px] min-[320px]:text-xs sm:text-sm text-center">
             — Anthony Bourdain
          </p>
        </motion.div>
        
      </div>
    </div>
  );
}
