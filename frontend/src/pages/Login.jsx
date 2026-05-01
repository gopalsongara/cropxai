import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Sprout } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../utils/api';

export const Login = () => {
  const { t, language, setLanguage } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [selectedRole, setSelectedRole] = useState('farmer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getLoginErrorMessage = (status, fallbackMessage) => {
    if (status === 401) return fallbackMessage || 'Invalid email or password';
    if (status === 500) return 'Server error';
    return fallbackMessage || 'Login failed';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          role: selectedRole,
          language,
        }),
      });

      const data = await response.json();
      if (!response.ok || data?.success === false) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cropx_token');
        localStorage.removeItem('cropx_role');
        localStorage.removeItem('cropx_user');
        throw new Error(getLoginErrorMessage(response.status, data?.error));
      }
      const userRole = data?.user?.role;
      if (!data?.token || !userRole) {
        throw new Error('Invalid login response');
      }

      login({ token: data.token, role: userRole, user: data.user || null });
      setError('');
      navigate(userRole === 'labadmin' ? '/lab-dashboard' : '/dashboard', { replace: true });
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('cropx_token');
      localStorage.removeItem('cropx_role');
      localStorage.removeItem('cropx_user');
      setError(err.message || t.auth.loginError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f7f4] px-4 flex items-center justify-center">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
            <Sprout className="w-6 h-6 text-green-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{t.auth.title}</h1>
            <p className="text-sm text-slate-500">{t.auth.subtitle}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">
              {language === 'hi' ? 'लॉगिन प्रकार' : 'Login Type'}
            </p>
            <div className="grid grid-cols-2 bg-slate-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setSelectedRole('farmer')}
                className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                  selectedRole === 'farmer' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                {language === 'hi' ? 'Farmer Login' : 'Farmer Login'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('labadmin')}
                className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                  selectedRole === 'labadmin' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                {language === 'hi' ? 'Lab Admin Login' : 'Lab Admin Login'}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              {language === 'hi' ? 'भाषा' : 'Language'}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">{t.auth.email}</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder={t.auth.emailPlaceholder}
                className="w-full border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">{t.auth.password}</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder={t.auth.passwordPlaceholder}
                className="w-full border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? t.auth.loggingIn : t.auth.loginButton}
          </button>
        </form>

        <div className="mt-5 text-xs text-slate-400 bg-slate-50 rounded-xl p-3">
          <p>{t.auth.demoTitle}</p>
          <p className="mt-1">{t.auth.demoHint}</p>
        </div>

        <p className="mt-4 text-sm text-slate-500 text-center">
          {t.auth.noAccount}{' '}
          <Link to="/register" className="text-green-700 font-semibold hover:text-green-800">
            {t.auth.goRegister}
          </Link>
        </p>
      </div>
    </div>
  );
};
