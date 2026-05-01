import React from 'react';
import { Settings, Sprout, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { SettingsModal } from './SettingsModal';
import { NotificationBell } from './NotificationBell';

export const Navbar = () => {
  const { t } = useLanguage();
  const { language, setLanguage } = useSettings();
  const { logout, role, isAuthenticated, updateUserProfile } = useAuth();
  const isLabAdmin = role === 'labadmin';
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const toggleLanguage = () => {
    const next = language === 'en' ? 'hi' : 'en';
    setLanguage(next);
    if (isAuthenticated) {
      updateUserProfile({ language: next }).catch(() => {});
    }
  };

  return (
    <>
      <header className="bg-[#f3f7f4] md:bg-white/80 md:backdrop-blur-md sticky top-0 z-20 md:border-b md:border-slate-100 px-4 md:px-8 py-4 md:py-0 md:h-16 flex items-center justify-between">
        {/* Mobile Top Header */}
        <div className="md:hidden w-full flex items-center justify-between bg-white rounded-2xl px-4 py-2 shadow-sm">
          <div className="flex items-center gap-2">
            <Sprout className="w-7 h-7 text-green-700" />
            <span className="font-bold text-lg text-green-700">{t.appTitle}</span>
            {isLabAdmin ? (
              <span className="ml-1 text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                🧪 Lab Admin
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="p-2 text-slate-400 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"
              title="Toggle Language"
            >
              <span className="w-5 h-5 block text-center font-bold font-serif leading-none">
                {language === 'en' ? 'A/文' : '文/A'}
              </span>
            </button>
            {isAuthenticated ? <NotificationBell /> : null}
            <button
              onClick={() => navigate('/profile')}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
              title="Profile"
            >
              <User className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-green-700 hover:bg-green-800 rounded-full transition-colors"
            >
              {t.auth.logout}
            </button>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-2 ml-auto">
          {isLabAdmin ? (
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 mr-1">
              🧪 Lab Admin
            </span>
          ) : null}
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors mr-2"
          >
            <span>{language === 'en' ? 'EN' : 'HI'}</span>
            <span className="text-slate-400 text-xs font-serif">A/文</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm font-medium text-white bg-green-700 rounded-full hover:bg-green-800 transition-colors mr-2"
          >
            {t.auth.logout}
          </button>
          {isAuthenticated ? <NotificationBell /> : null}
          <button
            onClick={() => navigate('/profile')}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
            title="Profile"
          >
            <User className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};
