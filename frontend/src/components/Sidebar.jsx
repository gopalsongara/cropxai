import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sprout, 
  Bug, 
  MessageSquare, 
  TrendingUp, 
  User,
  Mic,
  Home,
  Building2,
  FlaskConical
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { role, user } = useAuth();
  const isLabAdmin = role === 'labadmin';
  const userName = user?.name || (isLabAdmin ? 'Lab Admin' : 'Farmer');
  const userPlan = isLabAdmin ? 'Lab Admin' : user?.plan || 'Farmer Plan';
  const avatarLetter = userName.charAt(0).toUpperCase() || 'F';

  const farmerNavItems = [
    { path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: t.nav.dashboard, iconMob: <Home className="w-6 h-6 mb-1" />, labelMob: t.bottomNav.home },
    { path: '/pest-detection', icon: <Bug className="w-5 h-5" />, label: t.nav.pestDetection, iconMob: <Bug className="w-6 h-6 mb-1" />, labelMob: t.bottomNav.pests },
    { path: '/ai-chat', icon: <MessageSquare className="w-5 h-5" />, label: t.nav.aiChat, iconMob: <Mic className="w-6 h-6 mb-1" />, labelMob: t.bottomNav.aiChat, isMobileCenter: true },
    { path: '/market-insights', icon: <TrendingUp className="w-5 h-5" />, label: t.nav.marketInsights, iconMob: <TrendingUp className="w-6 h-6 mb-1" />, labelMob: t.bottomNav.market },
    { path: '/crop-recommendation', icon: <Sprout className="w-5 h-5" />, label: t.nav.cropRecommendation, iconMob: <User className="w-6 h-6 mb-1" />, labelMob: t.bottomNav.profile, isMobileProfile: true },
  ];
  const adminNavItems = [
    { path: '/lab-dashboard', icon: <Building2 className="w-5 h-5" />, label: 'Lab Dashboard', iconMob: <Home className="w-6 h-6 mb-1" />, labelMob: 'Lab' },
    { path: '/lab-status', icon: <FlaskConical className="w-5 h-5" />, label: 'Soil Reports', iconMob: <Bug className="w-6 h-6 mb-1" />, labelMob: 'Reports' },
    { path: '/lab-processing', icon: <MessageSquare className="w-5 h-5" />, label: 'Farmer Requests', iconMob: <Mic className="w-6 h-6 mb-1" />, labelMob: 'Requests', isMobileCenter: true },
    { path: '/soil-report', icon: <TrendingUp className="w-5 h-5" />, label: 'Analytics', iconMob: <TrendingUp className="w-6 h-6 mb-1" />, labelMob: 'Analytics' },
    { path: '/ai-analysis', icon: <Sprout className="w-5 h-5" />, label: 'Sample Management', iconMob: <User className="w-6 h-6 mb-1" />, labelMob: 'Samples', isMobileProfile: true },
  ];
  const navItems = isLabAdmin ? adminNavItems : farmerNavItems;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 fixed h-full z-10 shadow-sm">
        <div className="p-6 flex items-center gap-3">
          <Sprout className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="font-bold text-xl text-green-700 tracking-tight leading-none">{t.appTitle}</h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-1">{t.tagline}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            item.adminOnly && role !== 'labadmin' ? null : (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
            )
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-green-50 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
              {avatarLetter}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 leading-tight">{userName}</p>
              <p className="text-xs text-slate-500 mt-0.5">{userPlan}</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Mobile Floating Chat Button (For Center Nav Item) */}
      <div className="md:hidden fixed bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center z-30">
        <NavLink to="/ai-chat" className="w-16 h-16 bg-[#006400] text-white rounded-full flex items-center justify-center shadow-xl shadow-green-900/30 hover:scale-105 transition-transform border-4 border-white">
          <Mic className="w-7 h-7" />
        </NavLink>
        <span className="text-green-800 text-[11px] font-bold mt-2 uppercase tracking-wide">{t.bottomNav.askAiChat}</span>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-100 flex justify-between px-2 pb-safe pt-2 z-20 h-[72px] text-[10px] font-bold text-slate-400 uppercase tracking-wider shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
        {navItems.map((item) => {
          if (item.adminOnly && role !== 'labadmin') {
            return null;
          }

          if (item.desktopOnly) {
            return null;
          }

          if (item.isMobileCenter) {
            return (
              <div key={item.path} className="w-1/5 flex flex-col items-center justify-center opacity-0 pointer-events-none">
                {item.iconMob}
                <span>{item.labelMob}</span>
              </div>
            );
          }
          
          const targetPath = item.path;
          
          return (
            <NavLink
              key={item.path}
              to={targetPath}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-1/5 relative transition-colors ${
                  isActive ? 'text-[#43a047]' : 'hover:text-slate-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute -top-2 w-12 h-1 bg-[#43a047] rounded-b-full"></div>}
                  {item.iconMob}
                  <span>{item.labelMob}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};
