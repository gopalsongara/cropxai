import React from 'react';
import { X, Bell, LogOut, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

export const SettingsModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout, updateUserProfile } = useAuth();
  const {
    language,
    setLanguage,
    notifications,
    updateNotification,
    clearAppCache,
    appVersion,
    syncStatus,
  } = useSettings();

  if (!isOpen) return null;

  const isHindi = language === 'hi';
  const userPlan = user?.role === 'labadmin' ? 'Lab Admin' : 'Farmer Plan';

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login', { replace: true });
  };

  const setLanguagePersisted = (nextLang) => {
    setLanguage(nextLang);
    updateUserProfile({ language: nextLang }).catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md h-full bg-white shadow-2xl border-l border-slate-100 overflow-y-auto animate-[slideIn_0.2s_ease-out]">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">{isHindi ? 'सेटिंग्स' : 'Settings'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-2xl border border-slate-100 p-4 bg-slate-50/60">
            <p className="text-xs uppercase text-slate-500 font-semibold">{isHindi ? 'प्रोफाइल' : 'Profile'}</p>
            <p className="text-base font-semibold text-slate-800 mt-1">{user?.name || 'Farmer'}</p>
            <p className="text-sm text-slate-500">{user?.email || 'No email found'}</p>
            <p className="text-xs text-green-700 font-semibold mt-1">{isHindi ? 'प्लान:' : 'Plan:'} {userPlan}</p>
          </div>

          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-sm font-semibold text-slate-800 mb-3">{isHindi ? 'भाषा' : 'Language'}</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLanguagePersisted('en')}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${language === 'en' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                English
              </button>
              <button
                onClick={() => setLanguagePersisted('hi')}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${language === 'hi' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                हिंदी
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-sm font-semibold text-slate-800 mb-3">{isHindi ? 'नोटिफिकेशन' : 'Notifications'}</p>
            <div className="space-y-2">
              {[
                { key: 'weather', label: isHindi ? 'मौसम अलर्ट' : 'Weather alerts' },
                { key: 'market', label: isHindi ? 'मार्केट अलर्ट' : 'Market alerts' },
                { key: 'pest', label: isHindi ? 'कीट अलर्ट' : 'Pest alerts' },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span className="text-sm text-slate-700 inline-flex items-center gap-2"><Bell className="w-4 h-4 text-green-600" />{item.label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(notifications[item.key])}
                    onChange={(e) => updateNotification(item.key, e.target.checked)}
                    className="h-4 w-4 accent-green-600"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="text-sm font-semibold text-slate-800 mb-3">{isHindi ? 'खाता कार्रवाई' : 'Account Actions'}</p>
            <div className="space-y-2">
              <button
                onClick={handleLogout}
                className="w-full rounded-xl bg-green-700 text-white py-2.5 text-sm font-semibold hover:bg-green-800 transition-colors inline-flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                {isHindi ? 'लॉगआउट' : 'Logout'}
              </button>
              <button
                disabled
                className="w-full rounded-xl bg-slate-100 text-slate-400 py-2.5 text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                {isHindi ? 'अकाउंट हटाएं (जल्द)' : 'Delete Account (Soon)'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 p-4 bg-slate-50/60">
            <p className="text-sm font-semibold text-slate-800 mb-2">{isHindi ? 'CropX AI के बारे में' : 'About CropX AI'}</p>
            <p className="text-xs text-slate-600">{isHindi ? 'स्मार्ट फार्मिंग के लिए एक आधुनिक AI प्लेटफॉर्म।' : 'A modern AI platform for smarter farming decisions.'}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>{isHindi ? 'संस्करण' : 'Version'}: {appVersion}</span>
              <span>{isHindi ? 'सिंक' : 'Sync'}: {syncStatus}</span>
            </div>
            <button
              onClick={clearAppCache}
              className="mt-3 text-xs font-semibold text-green-700 hover:text-green-800"
            >
              {isHindi ? 'ऐप कैश साफ करें' : 'Clear app cache'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
