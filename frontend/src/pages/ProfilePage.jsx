import React, { useEffect, useMemo, useState } from 'react';
import { MapPin, Sprout, Tractor, Globe, PencilLine, LogOut, BarChart3, CloudSun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const textMap = {
  en: {
    profile: 'Profile',
    editProfile: 'Edit Profile',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    changeLanguage: 'Change Language',
    logout: 'Logout',
    location: 'Location',
    mainCrops: 'Main Crops',
    farmSize: 'Farm Size',
    language: 'Language',
    accountSettings: 'Account Settings',
    farmDetails: 'Farm Details',
    farmingStats: 'Farming Statistics',
    totalPestScans: 'Total Pest Scans',
    recommendedCrops: 'Recommended Crops',
    weatherRegion: 'Weather Region',
    lastLogin: 'Last Login',
    joinDate: 'Joined',
    farmer: 'Farmer',
    admin: 'Lab Admin',
    loading: 'Loading profile...',
    failed: 'Failed to load profile',
    name: 'Name',
    phone: 'Phone',
    preferredCrops: 'Preferred Crops',
    english: 'English',
    hindi: 'Hindi',
    noCrops: 'No crops added yet',
    soilType: 'Soil type',
    soilPlaceholder: 'e.g. Alluvial, Black, Clay loam',
    updateSuccess: 'Profile updated successfully.',
    updateFailed: 'Failed to update profile.',
    retry: 'Retry',
    noData: 'N/A',
    editTitle: 'Edit Your Profile',
    profileImage: 'Profile image',
    uploadImage: 'Upload image',
    recentActivity: 'Recent Activity',
    noRecentActivity: 'No recent activity yet.',
  },
  hi: {
    profile: 'प्रोफाइल',
    editProfile: 'प्रोफाइल संपादित करें',
    saveChanges: 'सेव करें',
    cancel: 'रद्द करें',
    changeLanguage: 'भाषा बदलें',
    logout: 'लॉगआउट',
    location: 'स्थान',
    mainCrops: 'मुख्य फसलें',
    farmSize: 'खेत का आकार',
    language: 'भाषा',
    accountSettings: 'खाता सेटिंग्स',
    farmDetails: 'खेती विवरण',
    farmingStats: 'खेती आंकड़े',
    totalPestScans: 'कुल कीट स्कैन',
    recommendedCrops: 'सुझाई गई फसलें',
    weatherRegion: 'मौसम क्षेत्र',
    lastLogin: 'पिछला लॉगिन',
    joinDate: 'जुड़ने की तारीख',
    farmer: 'किसान',
    admin: 'लैब एडमिन',
    loading: 'प्रोफाइल लोड हो रही है...',
    failed: 'प्रोफाइल लोड नहीं हो पाई',
    name: 'नाम',
    phone: 'फोन',
    preferredCrops: 'पसंदीदा फसलें',
    english: 'अंग्रेज़ी',
    hindi: 'हिंदी',
    noCrops: 'अभी तक कोई फसल नहीं जोड़ी गई',
    soilType: 'मिट्टी का प्रकार',
    soilPlaceholder: 'जैसे जलोढ़, काली, चिकनी दोमट',
    updateSuccess: 'प्रोफाइल सफलतापूर्वक अपडेट हो गई।',
    updateFailed: 'प्रोफाइल अपडेट नहीं हो पाई।',
    retry: 'फिर से कोशिश करें',
    noData: 'उपलब्ध नहीं',
    editTitle: 'अपनी प्रोफाइल संपादित करें',
    profileImage: 'प्रोफाइल फोटो',
    uploadImage: 'फोटो अपलोड करें',
    recentActivity: 'हाल की गतिविधि',
    noRecentActivity: 'अभी हाल की गतिविधि नहीं है।',
  },
};

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { user, setUser, isUserLoading, refreshUserProfile, updateUserProfile, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [recentActivity, setRecentActivity] = useState([]);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    location: '',
    farmSize: '',
    crops: '',
    soilType: '',
    language: 'en',
  });

  const uiLanguage = user?.language === 'hi' ? 'hi' : language === 'hi' ? 'hi' : 'en';
  const tx = textMap[uiLanguage];

  const loadProfile = async () => {
    try {
      setError('');
      const data = await refreshUserProfile();
      setUser(data?.user || null);
      setStats(data?.stats || null);
      setRecentActivity(Array.isArray(data?.recentActivity) ? data.recentActivity : []);
      if (data?.user?.language) {
        setLanguage(data.user.language);
      }
    } catch {
      setError(tx.failed);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setFormState({
      name: user?.name || '',
      phone: user?.phone || '',
      location: user?.location || '',
      farmSize: user?.farmSize || '',
      crops: Array.isArray(user?.crops) ? user.crops.join(', ') : '',
      soilType: user?.soilType || '',
      language: user?.language === 'hi' ? 'hi' : 'en',
    });
    setProfileImageFile(null);
  }, [user]);

  const roleLabel = uiLanguage === 'hi'
    ? (user?.role === 'labadmin' ? tx.admin : tx.farmer)
    : (user?.role === 'labadmin' ? tx.admin : tx.farmer);

  const avatarLetter = useMemo(
    () => (user?.name?.charAt(0)?.toUpperCase() || 'U'),
    [user?.name]
  );

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleToggleLanguage = () => {
    const nextLanguage = uiLanguage === 'hi' ? 'en' : 'hi';
    setLanguage(nextLanguage);
    updateUserProfile({ language: nextLanguage }).catch(() => {});
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      setIsSaving(true);
      setSaveMessage('');
      const nextCrops = formState.crops
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      const languageValue = formState.language === 'hi' ? 'hi' : 'en';
      const payload = profileImageFile ? new FormData() : {};
      const entries = {
        name: formState.name,
        phone: formState.phone,
        location: formState.location,
        farmSize: formState.farmSize,
        soilType: formState.soilType?.trim() || '',
        language: languageValue,
        mainCrops: nextCrops,
        crops: nextCrops,
      };

      if (payload instanceof FormData) {
        Object.entries(entries).forEach(([k, v]) => {
          payload.append(k, Array.isArray(v) ? JSON.stringify(v) : String(v));
        });
        payload.append('profileImage', profileImageFile);
      } else {
        Object.assign(payload, entries);
      }

      const updated = await updateUserProfile(payload);

      setUser((prev) => ({ ...(prev || {}), ...(updated || {}) }));
      setLanguage(updated?.language === 'hi' ? 'hi' : 'en');
      setSaveMessage(textMap[updated?.language === 'hi' ? 'hi' : 'en'].updateSuccess);
      setIsEditOpen(false);
      await loadProfile();
    } catch {
      setSaveMessage(tx.updateFailed);
    } finally {
      setIsSaving(false);
    }
  };

  if (isUserLoading && !user) {
    return (
      <section className="p-4 md:p-8">
        <div className="animate-pulse rounded-3xl bg-white p-6 shadow-sm h-44" />
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="animate-pulse rounded-2xl bg-white p-5 shadow-sm h-28" />
          <div className="animate-pulse rounded-2xl bg-white p-5 shadow-sm h-28" />
        </div>
        <p className="mt-4 text-sm text-slate-500">{tx.loading}</p>
      </section>
    );
  }

  if (error && !user) {
    return (
      <section className="p-4 md:p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
          <p>{tx.failed}</p>
          <button
            type="button"
            onClick={loadProfile}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            {tx.retry}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="p-4 md:p-8 space-y-5">
      <div className="rounded-3xl bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 p-6 md:p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-lime-200 to-green-300 text-green-900 text-2xl md:text-3xl font-bold flex items-center justify-center shadow-md">
              {user?.profileImage || user?.avatar ? (
                <img
                  src={user?.profileImage || user?.avatar}
                  alt={user?.name || 'User'}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                avatarLetter
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{user?.name || tx.profile}</h1>
              <p className="text-green-50 mt-1">{user?.email || tx.noData}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">{roleLabel}</span>
                <span className="text-xs text-green-100">
                  {tx.joinDate}: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : tx.noData}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-green-700 px-4 py-2.5 text-sm font-semibold hover:bg-green-50 transition-colors"
          >
            <PencilLine className="w-4 h-4" />
            {tx.editProfile}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl bg-white p-5 md:p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">{tx.farmDetails}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-100 p-4 bg-slate-50/70">
              <p className="text-xs font-semibold uppercase text-slate-500 mb-1 inline-flex items-center gap-2"><MapPin className="w-4 h-4" />{tx.location}</p>
              <p className="text-slate-800 font-medium">{user?.location || tx.noData}</p>
            </div>
            <div className="rounded-xl border border-slate-100 p-4 bg-slate-50/70">
              <p className="text-xs font-semibold uppercase text-slate-500 mb-1 inline-flex items-center gap-2"><Sprout className="w-4 h-4" />{tx.mainCrops}</p>
              <p className="text-slate-800 font-medium">
                {Array.isArray(user?.crops) && user.crops.length > 0 ? user.crops.join(', ') : tx.noCrops}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 p-4 bg-slate-50/70">
              <p className="text-xs font-semibold uppercase text-slate-500 mb-1 inline-flex items-center gap-2"><Tractor className="w-4 h-4" />{tx.farmSize}</p>
              <p className="text-slate-800 font-medium">{user?.farmSize || tx.noData}</p>
            </div>
            <div className="rounded-xl border border-slate-100 p-4 bg-slate-50/70">
              <p className="text-xs font-semibold uppercase text-slate-500 mb-1">{tx.soilType}</p>
              <p className="text-slate-800 font-medium">{user?.soilType?.trim() ? user.soilType : tx.noData}</p>
            </div>
            <div className="rounded-xl border border-slate-100 p-4 bg-slate-50/70">
              <p className="text-xs font-semibold uppercase text-slate-500 mb-1 inline-flex items-center gap-2"><Globe className="w-4 h-4" />{tx.language}</p>
              <p className="text-slate-800 font-medium">{uiLanguage === 'hi' ? tx.hindi : tx.english}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 md:p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">{tx.accountSettings}</h2>
          <div className="space-y-3">
            <button type="button" onClick={() => setIsEditOpen(true)} className="w-full rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-100 transition-colors">{tx.editProfile}</button>
            <button type="button" onClick={handleToggleLanguage} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">{tx.changeLanguage}</button>
            <button type="button" onClick={handleLogout} className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"><LogOut className="w-4 h-4" />{tx.logout}</button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 md:p-6 shadow-sm border border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">{tx.farmingStats}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-100 p-4 bg-slate-50/70">
            <p className="text-xs text-slate-500">{tx.totalPestScans}</p>
            <p className="mt-1 text-xl font-bold text-slate-800 inline-flex items-center gap-2"><BarChart3 className="w-5 h-5 text-green-600" />{stats?.totalPestScans ?? 0}</p>
          </div>
          <div className="rounded-xl border border-slate-100 p-4 bg-slate-50/70">
            <p className="text-xs text-slate-500">{tx.recommendedCrops}</p>
            <p className="mt-1 text-xl font-bold text-slate-800">{stats?.recommendedCropsCount ?? (user?.crops?.length || 0)}</p>
          </div>
          <div className="rounded-xl border border-slate-100 p-4 bg-slate-50/70">
            <p className="text-xs text-slate-500">{tx.weatherRegion}</p>
            <p className="mt-1 text-lg font-semibold text-slate-800 inline-flex items-center gap-2"><CloudSun className="w-5 h-5 text-green-600" />{stats?.weatherRegion || user?.location || tx.noData}</p>
          </div>
          <div className="rounded-xl border border-slate-100 p-4 bg-slate-50/70">
            <p className="text-xs text-slate-500">{tx.lastLogin}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{stats?.lastLogin ? new Date(stats.lastLogin).toLocaleString() : tx.noData}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 md:p-6 shadow-sm border border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">{tx.recentActivity}</h2>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-slate-500">{tx.noRecentActivity}</p>
        ) : (
          <div className="space-y-2">
            {recentActivity.slice(0, 5).map((item, idx) => (
              <div key={`${item.createdAt}-${idx}`} className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-500">
                  {item.crop} • {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {saveMessage ? (
        <div className={`rounded-xl border px-4 py-3 text-sm ${saveMessage.includes('success') || saveMessage.includes('सफल') ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {saveMessage}
        </div>
      ) : null}

      {isEditOpen ? (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-slate-100 p-5 md:p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{tx.editTitle}</h3>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-sm text-slate-700">
                {tx.name}
                <input value={formState.name} onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300" />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-700">
                {tx.phone}
                <input value={formState.phone} onChange={(e) => setFormState((prev) => ({ ...prev, phone: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300" />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-700">
                {tx.location}
                <input value={formState.location} onChange={(e) => setFormState((prev) => ({ ...prev, location: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300" />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-700">
                {tx.farmSize}
                <input value={formState.farmSize} onChange={(e) => setFormState((prev) => ({ ...prev, farmSize: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300" />
              </label>
              <label className="flex flex-col gap-1 text-sm text-slate-700">
                {tx.soilType}
                <input
                  value={formState.soilType}
                  onChange={(e) => setFormState((prev) => ({ ...prev, soilType: e.target.value }))}
                  placeholder={tx.soilPlaceholder}
                  className="rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </label>
              <label className="md:col-span-2 flex flex-col gap-1 text-sm text-slate-700">
                {tx.preferredCrops}
                <input value={formState.crops} onChange={(e) => setFormState((prev) => ({ ...prev, crops: e.target.value }))} placeholder={uiLanguage === 'hi' ? 'गेहूं, चावल, मक्का' : 'Wheat, Rice, Maize'} className="rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300" />
              </label>
              <label className="md:col-span-2 flex flex-col gap-1 text-sm text-slate-700">
                {tx.language}
                <select value={formState.language} onChange={(e) => setFormState((prev) => ({ ...prev, language: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300">
                  <option value="en">{tx.english}</option>
                  <option value="hi">{tx.hindi}</option>
                </select>
              </label>
              <label className="md:col-span-2 flex flex-col gap-1 text-sm text-slate-700">
                {tx.profileImage}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfileImageFile(e.target.files?.[0] || null)}
                  className="rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
                />
                <span className="text-xs text-slate-500">{tx.uploadImage}</span>
              </label>
              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setIsEditOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  {tx.cancel}
                </button>
                <button type="submit" disabled={isSaving} className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60">
                  {isSaving ? `${tx.saveChanges}...` : tx.saveChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
};
