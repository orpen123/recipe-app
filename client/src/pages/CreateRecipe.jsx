import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  createRecipe,
  getAllRecipes,
  getRecipe,
  updateRecipe,
} from "../api/services";
import { useAuth } from "../context/AuthContext";

const formVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 120, damping: 14 },
  },
};

function Field({ label, children, required }) {
  return (
    <motion.div variants={itemVariants} className="space-y-1.5">
      <label className="block text-[10px] min-[500px]:text-sm font-bold text-gray-700">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </motion.div>
  );
}

const inputCls =
  "w-full px-3 py-2 min-[500px]:py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent text-[11px] min-[500px]:text-sm transition-all bg-white placeholder:text-gray-400";

const ingBase =
  "px-2 min-[400px]:px-3 py-2 min-[320px]:py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent text-[11px] min-[400px]:text-xs min-[500px]:text-sm transition-all bg-white placeholder:text-gray-400";

export default function CreateRecipe() {
  const { idAndSlug } = useParams();
  const id = idAndSlug?.split("-")[0];
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    category: "",
    prep_time: "",
    cook_time: "",
    servings: "",
  });
  const [ingredients, setIngredients] = useState([{ name: "", quantity: "To taste" }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchCategories = async () => {
      try {
        const res = await getAllRecipes();
        const uniqueCategories = [
          ...new Set(res.data.map((recipe) => recipe.category)),
        ];
        const formattedCategories = uniqueCategories
          .filter((cat) => cat && cat.trim())
          .map((cat) => ({
            value: cat,
            label: cat.charAt(0).toUpperCase() + cat.slice(1),
          }));
        setCategories(formattedCategories);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setCategories([
          { value: "breakfast", label: "Breakfast" },
          { value: "lunch", label: "Lunch" },
          { value: "dinner", label: "Dinner" },
          { value: "dessert", label: "Dessert" },
          { value: "snack", label: "Snack" },
          { value: "vegetarian", label: "Vegetarian" },
        ]);
      }
    };

    fetchCategories();

    if (isEditing) {
      getRecipe(id)
        .then((res) => {
          const r = res.data;
          setForm({
            title: r.title || "",
            description: r.description || "",
            image: r.image || "",
            category: r.category || "",
            prep_time: r.prep_time || "",
            cook_time: r.cook_time || "",
            servings: r.servings || "",
          });
          if (r.ingredients && r.ingredients.length > 0) {
            setIngredients(
              r.ingredients.map((ing) => ({
                name: ing.name || "",
                quantity: ing.quantity || "",
              }))
            );
          }
        })
        .catch(console.error);
    }
  }, [id, user, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (e.target.name === "image") setImageError(false);
  };

  const handleIngredient = (i, field, value) => {
    setIngredients((prev) =>
      prev.map((ing, index) =>
        index === i ? { ...ing, [field]: value } : ing
      )
    );
  };

  const addIngredient = () =>
    setIngredients((prev) => [...prev, { name: "", quantity: "To taste" }]);

  const removeIngredient = (i) =>
    setIngredients((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Recipe title is required");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const validIngredients = ingredients.filter((ing) => ing.name.trim());
      const payload = {
        ...form,
        prep_time: Number(form.prep_time) || null,
        cook_time: Number(form.cook_time) || null,
        servings: Number(form.servings) || null,
        ingredients: validIngredients,
      };

      const toSlug = (title) =>
        title?.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-") || "";
      const slug = toSlug(form.title);

      if (isEditing) {
        await updateRecipe(id, payload);
        navigate(`/recipe/${id}-${slug}`);
      } else {
        const res = await createRecipe(payload);
        navigate(`/recipe/${res.data.id}-${slug}`);
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to save recipe. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] pt-14">
      <div className="max-w-2xl mx-auto px-3 min-[320px]:px-4 py-6 min-[320px]:py-10">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-5 min-[320px]:mb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-6 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Recipes
          </Link>
          <h1 className="text-lg min-[500px]:text-2xl sm:text-3xl font-black text-gray-900 mb-1">
            {isEditing ? "Edit Recipe" : "Create Recipe"}
          </h1>
          <p className="text-gray-400 text-[10px] min-[500px]:text-sm">
            {isEditing
              ? "Update your recipe details."
              : "Share your delicious recipe with the community."}
          </p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-xl flex items-center gap-2.5"
            >
              <span className="text-base shrink-0">⚠️</span>
              <p className="font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form
          variants={formVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl min-[320px]:rounded-3xl border border-gray-100 shadow-sm p-3 min-[400px]:p-5 sm:p-8 space-y-3 min-[400px]:space-y-5 min-[500px]:space-y-6"
        >
          <Field label="Recipe Title" required>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Spaghetti Carbonara"
              required
              className={inputCls}
            />
          </Field>

          <Field label="Description">
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Tell us about your recipe, what makes it special..."
              className={`${inputCls} resize-none`}
            />
          </Field>

          <Field label="Image URL">
            <input
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className={inputCls}
            />
            <AnimatePresence>
              {form.image && !imageError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mt-2 relative rounded-xl overflow-hidden h-36 bg-gray-50"
                >
                  <img
                    src={form.image}
                    alt="preview"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <span className="absolute bottom-2 right-2 text-[10px] font-bold text-white/80 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    Preview
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Field>

          <Field label="Category">
            <div className="relative">
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={`${inputCls} appearance-none pr-10 cursor-pointer`}
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </Field>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-1.5 min-[400px]:gap-3"
          >
            {[
              { name: "prep_time", label: "Prep (min)", placeholder: "15" },
              { name: "cook_time", label: "Cook (min)", placeholder: "30" },
              { name: "servings", label: "Servings", placeholder: "4" },
            ].map(({ name, label, placeholder }) => (
              <div key={name}>
                <label className="block text-[9px] min-[400px]:text-xs font-bold text-gray-700 mb-1 min-[400px]:mb-1.5 leading-tight">
                  {label}
                </label>
                <input
                  name={name}
                  type="number"
                  min="0"
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="w-full px-2 min-[400px]:px-3 py-2 min-[400px]:py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:border-transparent text-[11px] min-[400px]:text-sm transition-all bg-white placeholder:text-gray-400"
                />
              </div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-[10px] min-[500px]:text-sm font-bold text-gray-700 mb-2 min-[500px]:mb-3">
              Ingredients
              <span className="ml-1.5 text-[9px] min-[500px]:text-xs font-normal text-gray-400">
                ({ingredients.filter((i) => i.name.trim()).length} added)
              </span>
            </label>
            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {ingredients.map((ing, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex gap-1.5 min-[400px]:gap-2"
                  >
                    <input
                      value={ing.name}
                      onChange={(e) =>
                        handleIngredient(i, "name", e.target.value)
                      }
                      placeholder="Ingredient name"
                      className={`${ingBase} flex-1 min-w-0`}
                    />
                    <input
                      value={ing.quantity}
                      onChange={(e) =>
                        handleIngredient(i, "quantity", e.target.value)
                      }
                      placeholder="Qty"
                      className={`${ingBase} w-16 min-[400px]:w-20 min-[500px]:w-24 shrink-0`}
                    />
                    {ingredients.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => removeIngredient(i)}
                        className="w-8 min-[400px]:w-10 h-8 min-[400px]:h-10 flex items-center justify-center rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0 text-xs min-[400px]:text-base"
                      >
                        ✕
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={addIngredient}
              className="mt-2 min-[500px]:mt-3 flex items-center gap-1 min-[500px]:gap-1.5 text-[11px] min-[500px]:text-sm font-bold py-1.5 min-[500px]:py-2 px-2.5 min-[500px]:px-3 rounded-xl transition-colors"
              style={{ color: "#2A9D72", background: "#E8F7F2" }}
            >
              + Add Ingredient
            </motion.button>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-2">
            <motion.button
              whileHover={!loading ? { scale: 1.015 } : {}}
              whileTap={!loading ? { scale: 0.985 } : {}}
              type="submit"
              disabled={loading}
              className="w-full text-white font-black py-2.5 min-[500px]:py-3.5 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-[11px] min-[500px]:text-sm sm:text-base"
              style={{
                background: loading ? "#4db88e" : "#2A9D72",
                boxShadow: "0 10px 20px -6px rgba(42,157,114,0.3)",
              }}
            >
              {loading ? (
                <>
                  <motion.svg
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      ease: "linear",
                    }}
                    className="h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </motion.svg>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? "✓ Update Recipe" : "Publish Recipe"}</span>
              )}
            </motion.button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
}
