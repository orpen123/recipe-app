import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Users, UtensilsCrossed, MessageCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return <div className="animate-pulse h-64 bg-white rounded-3xl" />;
  }

  const kpis = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Recipes', value: stats.totalRecipes, icon: UtensilsCrossed, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Platform Interactions', value: stats.totalInteractions, icon: MessageCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-8">
      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 min-[500px]:gap-6">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={kpi.label} 
              className="bg-white p-3 min-[500px]:p-6 rounded-2xl min-[500px]:rounded-[2rem] shadow-sm border border-stone-100 flex items-center gap-3 min-[500px]:gap-5"
            >
              <div className={`w-9 h-9 min-[500px]:w-14 min-[500px]:h-14 rounded-xl min-[500px]:rounded-2xl flex items-center justify-center shrink-0 ${kpi.bg} ${kpi.color}`}>
                <Icon size={16} className="min-[500px]:w-6 min-[500px]:h-6" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[9px] min-[500px]:text-sm font-bold text-stone-500 uppercase tracking-wider">{kpi.label}</p>
                <p className="text-lg min-[500px]:text-3xl font-black text-stone-900 mt-0 min-[500px]:mt-1">{kpi.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-3 min-[500px]:p-6 sm:p-8 rounded-2xl min-[500px]:rounded-[2rem] shadow-sm border border-stone-100"
      >
        <div className="flex items-center gap-2 mb-3 min-[500px]:mb-6">
          <TrendingUp className="text-emerald-600 w-4 h-4 min-[500px]:w-6 min-[500px]:h-6" />
          <h2 className="text-sm min-[500px]:text-xl font-bold text-stone-900">Most Active Members</h2>
        </div>
        
        <div className="space-y-2 min-[500px]:space-y-4">
          {stats.topUsers?.map((u, i) => (
            <div key={u.id} className="flex items-center justify-between gap-2 p-2.5 min-[500px]:p-4 rounded-xl min-[500px]:rounded-2xl border border-stone-100 hover:bg-stone-50 transition-colors">
              <div className="flex items-center gap-2 min-[500px]:gap-4 min-w-0">
                <div className="w-5 h-5 min-[500px]:w-8 min-[500px]:h-8 shrink-0 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[9px] min-[500px]:text-sm">
                  #{i + 1}
                </div>
                {u.avatar ? (
                  <img src={u.avatar} alt={u.username} className="w-7 h-7 min-[500px]:w-10 min-[500px]:h-10 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 min-[500px]:w-10 min-[500px]:h-10 shrink-0 rounded-full bg-stone-200 flex items-center justify-center font-bold text-stone-600 text-[10px] min-[500px]:text-sm">
                    {u.username[0].toUpperCase()}
                  </div>
                )}
                <span className="font-bold text-stone-800 text-[11px] min-[500px]:text-base truncate">{u.username}</span>
              </div>
              
              <div className="flex gap-3 min-[500px]:gap-4 text-[9px] min-[500px]:text-sm font-semibold text-stone-500 text-right shrink-0">
                <div><span className="text-stone-900">{u.total_recipes}</span> <span className="hidden min-[350px]:inline">Recipes</span></div>
                <div><span className="text-stone-900">{u.total_comments}</span> <span className="hidden min-[350px]:inline">Actions</span></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
