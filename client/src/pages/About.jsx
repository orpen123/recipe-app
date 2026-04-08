import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="min-h-screen bg-[#fafaf8] pt-24 px-4 pb-16">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100"
        >
          <div className="flex justify-center mb-6">
            <span className="text-5xl">🍳</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-center text-gray-900 mb-6">
            About <span className="text-[#2A9D72]">Matbakhy</span>
          </h1>
          <div className="space-y-6 text-gray-600 leading-relaxed text-sm sm:text-base">
            <p>
              Welcome to <strong>Matbakhy</strong>, your ultimate destination for discovering, sharing, and savoring the best homemade recipes from around the world.
            </p>
            <p>
              Our mission is to bring people together through the joy of cooking. Whether you're a seasoned chef or just starting in the kitchen, Matbakhy offers a welcoming community where you can find inspiration for your next meal, learn new techniques, and share your own culinary masterpieces.
            </p>
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">What We Offer</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Discover Recipes:</strong> Browse hundreds of user-submitted recipes categorized by cuisine, meal type, and dietary preferences.</li>
              <li><strong>Save Favorites:</strong> Found something you love? Save it to your personal collection to easily find it later.</li>
              <li><strong>Connect with Others:</strong> Follow your favorite home chefs, exchange messages, and build your cooking network.</li>
              <li><strong>Share Your Creations:</strong> Upload your own recipes with photos, step-by-step instructions, and ingredients to inspire others.</li>
            </ul>
            <p className="pt-6 font-medium text-center italic text-gray-500">
              "Good food is very often, even most often, simple food."
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
