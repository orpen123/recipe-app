import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, UtensilsCrossed } from 'lucide-react';

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user || !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  const tabs = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'Manage Recipes', path: '/admin/recipes', icon: UtensilsCrossed },
  ];

  return (
    <div className="pt-16 pb-20 min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-3 min-[500px]:px-6 lg:px-12 py-5 min-[500px]:py-8">
        <h1 className="text-base min-[500px]:text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mb-4 min-[500px]:mb-6 sm:mb-8">Admin Control Panel</h1>

        <div className="flex gap-1.5 min-[500px]:gap-3 overflow-x-auto pb-3 mb-4 min-[500px]:mb-8" style={{ scrollbarWidth: 'none' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex items-center gap-1 min-[500px]:gap-2 px-2.5 min-[500px]:px-5 py-1.5 min-[500px]:py-2.5 rounded-full font-bold text-[10px] min-[500px]:text-sm whitespace-nowrap transition-colors ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-white text-stone-600 hover:bg-emerald-50 border border-stone-200'
                }`}
              >
                <Icon size={14} />
                {tab.name}
              </Link>
            );
          })}
        </div>

        <Outlet />
      </div>
    </div>
  );
}
