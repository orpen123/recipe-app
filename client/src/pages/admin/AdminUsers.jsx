import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/admin/users')
      .then(res => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this user? This will cascade and delete all their recipes and comments.')) return;
    
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user');
    }
  };

  if (loading) return <div className="animate-pulse h-96 bg-white rounded-3xl" />;

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-stone-100 overflow-hidden">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              <th className="px-6 py-4 text-xs font-black text-stone-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-black text-stone-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-xs font-black text-stone-500 uppercase tracking-wider">Recipes</th>
              <th className="px-6 py-4 text-xs font-black text-stone-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-4 text-xs font-black text-stone-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-stone-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-stone-900">{u.username}</span>
                    {u.is_admin ? (
                      <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-[10px] uppercase font-black px-2 py-0.5 rounded-full">
                        Admin
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                  {u.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-stone-900">
                  {u.recipes_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {u.is_admin ? (
                    <span className="text-stone-300 cursor-not-allowed inline-flex items-center gap-1 text-xs">
                      <AlertTriangle size={14}/> Protected
                    </span>
                  ) : (
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ml-auto"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-stone-100">
        {users.map(u => (
          <div key={u.id} className="px-3 min-[500px]:px-5 py-3 min-[500px]:py-4 hover:bg-stone-50/50 transition-colors flex flex-col gap-2 min-[500px]:gap-4">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-stone-900 text-[11px] min-[500px]:text-base">{u.username}</span>
                  {u.is_admin ? (
                    <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-[7px] min-[500px]:text-[10px] uppercase font-black px-1.5 py-0.5 rounded-full">
                      Admin
                    </span>
                  ) : null}
                </div>
                <span className="text-[9px] min-[500px]:text-sm text-stone-500 break-all">{u.email}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex gap-3 min-[500px]:gap-6 text-[9px] min-[500px]:text-sm text-stone-500">
                <div><span className="font-bold text-stone-900">{u.recipes_count}</span> Recipes</div>
                <div>{new Date(u.created_at).toLocaleDateString()}</div>
              </div>
              
              <div>
                {u.is_admin ? (
                  <span className="text-stone-300 cursor-not-allowed inline-flex items-center gap-1 text-[9px] min-[500px]:text-xs">
                    <AlertTriangle size={11}/> Protected
                  </span>
                ) : (
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 min-[500px]:px-3 py-1 min-[500px]:py-1.5 rounded-lg transition-colors flex items-center gap-1 text-[9px] min-[500px]:text-sm"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
