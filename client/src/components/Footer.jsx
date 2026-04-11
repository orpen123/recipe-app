import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-[#1a2b25] text-white pt-10 min-[320px]:pt-16 pb-6 min-[320px]:pb-8 border-t-[6px] min-[320px]:border-t-[8px] border-[#2A9D72] mt-auto relative overflow-hidden">
      {}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-900/20 rounded-full blur-[80px] pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-4 min-[320px]:px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 min-[450px]:grid-cols-2 lg:grid-cols-6 gap-8 min-[320px]:gap-10 lg:gap-12 items-start">
          
          {}
          <div className="min-[450px]:col-span-2 lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-1.5 min-[320px]:gap-2 w-fit">
              <motion.span
                className="inline-flex items-center justify-center w-7 min-[320px]:w-8 h-7 min-[320px]:h-8 rounded-lg bg-[#2A9D72] text-white shadow-lg"
                whileHover={{
                  rotate: [0, -15, 15, -10, 0],
                  transition: { duration: 0.5 },
                }}
              >
                <svg
                  width="14"
                  height="14"
                  className="min-[320px]:w-4 min-[320px]:h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                  <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                </svg>
              </motion.span>
              <span className="text-lg min-[320px]:text-xl font-bold tracking-tight">
                <span className="text-white">Matbakhy</span>
              </span>
            </Link>
            <p className="text-gray-400 text-[11px] min-[320px]:text-sm leading-relaxed max-w-sm">
              Empowering home cooks worldwide. Explore thousands of delicious,
              healthy, and easy-to-make recipes crafted to elevate your kitchen experience and bring joy to your table.
            </p>
            <div className="flex items-center gap-3 min-[320px]:gap-4 pt-3 min-[320px]:pt-4">
              <a
                href="#"
                className="w-8 min-[320px]:w-10 h-8 min-[320px]:h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#2A9D72] hover:text-white text-gray-400 transition-all duration-300"
              >
                <span className="sr-only">Twitter</span>
                <svg
                  className="w-4 min-[320px]:w-4 h-4 min-[320px]:h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="#"
                className="w-8 min-[320px]:w-10 h-8 min-[320px]:h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#2A9D72] hover:text-white text-gray-400 transition-all duration-300"
              >
                <span className="sr-only">Instagram</span>
                <svg
                  className="w-4 min-[320px]:w-4 h-4 min-[320px]:h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>

        {}
        <div className="lg:col-span-2">
          <h4 className="text-[13px] min-[320px]:text-sm sm:text-base font-bold mb-3 min-[320px]:mb-5 text-white tracking-wide uppercase">
            Developed By
          </h4>
          <ul className="space-y-2.5 min-[320px]:space-y-3 font-medium text-[11px] min-[320px]:text-sm text-gray-400">
            <li className="flex items-center gap-2 group">
              <span className="shrink-0 w-5 h-5 rounded flex items-center justify-center bg-white/5 group-hover:bg-[#2A9D72]/20 text-[#2A9D72] transition-colors">
                <svg className="w-3 h-3 min-[320px]:w-3.5 min-[320px]:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </span>
              <span className="flex-1 min-w-0 font-bold text-gray-200">Soulaimane</span>
            </li>
            <li className="flex items-center gap-2 group">
              <span className="shrink-0 w-5 h-5 rounded flex items-center justify-center bg-white/5 group-hover:bg-[#2A9D72]/20 text-[#2A9D72] transition-colors">
                <svg className="w-3 h-3 min-[320px]:w-3.5 min-[320px]:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </span>
              <a href="mailto:soulaymaane@gmail.com" className="flex-1 hover:text-emerald-400 transition-colors">
                soulaymaane@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-2 group">
              <span className="shrink-0 w-5 h-5 rounded flex items-center justify-center bg-white/5 group-hover:bg-[#2A9D72]/20 text-[#2A9D72] transition-colors">
                <svg className="w-3 h-3 min-[320px]:w-3.5 min-[320px]:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </span>
              <a href="tel:0606383278" className="flex-1 min-w-0 hover:text-emerald-400 transition-colors">
                0606383278
              </a>
            </li>
            <li className="flex items-start gap-2 group">
              <span className="mt-0.5 shrink-0 w-5 h-5 rounded flex items-center justify-center bg-white/5 group-hover:bg-[#2A9D72]/20 text-[#2A9D72] transition-colors">
                <svg className="w-3 h-3 min-[320px]:w-3.5 min-[320px]:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </span>
              <span className="flex-1 min-w-0 leading-tight pt-0.5">
                Rabat, Temara<br/>Maroc
              </span>
            </li>
          </ul>
        </div>

        {}
        <div>
          <h4 className="text-[13px] min-[320px]:text-sm sm:text-base font-bold mb-3 min-[320px]:mb-5 text-white tracking-wide uppercase">
            Quick Links
          </h4>
          <ul className="space-y-2.5 min-[320px]:space-y-3 font-medium text-[11px] min-[320px]:text-sm text-gray-400">
            <li>
              <Link to="/" className="hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-emerald-500/0 group-hover:bg-emerald-500 transition-colors"></span>
                Home
              </Link>
            </li>
            <li>
              <Link to="/favorites" className="hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-emerald-500/0 group-hover:bg-emerald-500 transition-colors"></span>
                Favorites
              </Link>
            </li>
            <li>
              <Link to="/create" className="hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-emerald-500/0 group-hover:bg-emerald-500 transition-colors"></span>
                Submit Recipe
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-emerald-500/0 group-hover:bg-emerald-500 transition-colors"></span>
                About Us
              </Link>
            </li>
          </ul>
        </div>

        {}
        <div>
          <h4 className="text-[13px] min-[320px]:text-sm sm:text-base font-bold mb-3 min-[320px]:mb-5 text-white tracking-wide uppercase">
            Explore
          </h4>
          <ul className="space-y-2.5 min-[320px]:space-y-3 font-medium text-[11px] min-[320px]:text-sm text-gray-400">
            <li>
              <Link to="/?category=appetizers" className="hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-emerald-500/0 group-hover:bg-emerald-500 transition-colors"></span>
                Appetizers
              </Link>
            </li>
            <li>
              <Link to="/?category=main_courses" className="hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-emerald-500/0 group-hover:bg-emerald-500 transition-colors"></span>
                Main Courses
              </Link>
            </li>
            <li>
              <Link to="/?category=desserts" className="hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-emerald-500/0 group-hover:bg-emerald-500 transition-colors"></span>
                Desserts
              </Link>
            </li>
            <li>
              <Link to="/?category=healthy" className="hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-emerald-500/0 group-hover:bg-emerald-500 transition-colors"></span>
                Healthy
              </Link>
            </li>
          </ul>
        </div>
        
        </div>
      </div>

      {}
      <div className="max-w-7xl mx-auto px-4 min-[320px]:px-6 lg:px-12 mt-10 min-[320px]:mt-12 pt-5 min-[320px]:pt-6 border-t border-white/5 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center text-[10px] min-[320px]:text-xs text-gray-500 gap-3 min-[320px]:gap-4 text-center md:text-left">
          <p>
            &copy; {new Date().getFullYear()} Matbakhy. All rights
            reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 min-[320px]:gap-6">
            <Link to="/privacy" className="hover:text-emerald-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-emerald-400 transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="hover:text-emerald-400 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
