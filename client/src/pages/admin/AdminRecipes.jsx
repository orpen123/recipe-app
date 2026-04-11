import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const toSlug = (title) =>
  title
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-") || "";

export default function AdminRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecipes = () => {
    setLoading(true);
    api.get('/admin/recipes')
      .then(res => setRecipes(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this recipe permanently?')) return;
    
    try {
      await api.delete(`/admin/recipes/${id}`);
      fetchRecipes();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete recipe');
    }
  };

  if (loading) return <div className="animate-pulse h-96 bg-white rounded-3xl" />;

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-stone-100 overflow-hidden">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              <th className="px-6 py-4 text-xs font-black text-stone-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-4 text-xs font-black text-stone-500 uppercase tracking-wider">Author</th>
              <th className="px-6 py-4 text-xs font-black text-stone-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-black text-stone-500 uppercase tracking-wider">Likes</th>
              <th className="px-6 py-4 text-xs font-black text-stone-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {recipes.map(r => (
              <tr key={r.id} className="hover:bg-stone-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link to={`/recipe/${r.id}-${toSlug(r.title)}`} className="flex items-center gap-2 font-bold text-emerald-600 hover:text-emerald-700">
                    <span className="truncate max-w-[200px]">{r.title}</span>
                    <ExternalLink size={14} />
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-stone-600">
                  {r.author_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                  <span className="bg-stone-100 px-2 py-1 rounded-md">{r.category}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-stone-900">
                  {r.likes_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ml-auto"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-stone-100">
        {recipes.map(r => (
          <div key={r.id} className="px-3 min-[500px]:px-5 py-3 min-[500px]:py-4 hover:bg-stone-50/50 transition-colors flex flex-col gap-2 min-[500px]:gap-4">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-0.5 min-w-0 pr-3">
                <Link to={`/recipe/${r.id}-${toSlug(r.title)}`} className="flex items-center gap-1.5 font-bold text-emerald-600 hover:text-emerald-700 text-[11px] min-[500px]:text-base">
                  <span className="truncate">{r.title}</span>
                  <ExternalLink size={12} className="shrink-0" />
                </Link>
                <div className="text-[9px] min-[500px]:text-sm text-stone-500 flex items-center gap-1.5">
                  <span>By <span className="font-bold text-stone-700">{r.author_name}</span></span>
                  <span className="w-1 h-1 rounded-full bg-stone-300"></span>
                  <span className="bg-stone-100 px-1.5 py-0.5 rounded text-[7px] min-[500px]:text-[10px] uppercase font-bold">{r.category}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex gap-3 text-[9px] min-[500px]:text-sm text-stone-500">
                <div><span className="font-bold text-stone-900">{r.likes_count}</span> Likes</div>
              </div>
              
              <div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 min-[500px]:px-3 py-1 min-[500px]:py-1.5 rounded-lg transition-colors flex items-center gap-1 text-[9px] min-[500px]:text-sm shrink-0"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
