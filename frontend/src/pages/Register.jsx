import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Sprout, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../utils/api';

export const Register = () => {
  const { t, language, setLanguage } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'farmer',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoginHint, setShowLoginHint] = useState(false);

  const getRegisterErrorMessage = (status, fallbackMessage) => {
    if (status === 409) return 'Account already exists. Please login instead.';
    if (status === 500) return 'Server error';
    return fallbackMessage || 'Registration failed';
  };

  const validateForm = () => {
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedPassword = form.password;

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      return 'Please fill all required fields';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return 'Please enter a valid email address';
    }

    if (trimmedPassword.length < 6) {
      return 'Password must be at least 6 characters';
    }

    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowLoginHint(false);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          language,
        }),
      });

      const data = await response.json();
      if (!response.ok || data?.success === false) {
        if (response.status === 409) {
          setShowLoginHint(true);
        }
        throw new Error(getRegisterErrorMessage(response.status, data?.error));
      }
      const userRole = data?.user?.role;
      if (!data?.token || !userRole) {
        throw new Error('Invalid registration response');
      }

      login({ token: data.token, role: userRole, user: data.user || null });
      setError('');
      navigate(userRole === 'labadmin' ? '/lab-dashboard' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || t.auth.registerError);
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
            <h1 className="text-2xl font-bold text-slate-800">{t.auth.registerTitle}</h1>
            <p className="text-sm text-slate-500">{t.auth.registerSubtitle}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
              {language === 'hi' ? 'खाता प्रकार' : 'Account Role'}
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            >
              <option value="farmer">Farmer</option>
              <option value="labadmin">Lab Admin</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">{t.auth.name}</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder={t.auth.namePlaceholder}
                className="w-full border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
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

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-sm text-red-700">{error}</p>
              {showLoginHint ? (
                <Link to="/login" className="mt-1 inline-block text-sm font-semibold text-green-700 hover:text-green-800">
                  Go to Login
                </Link>
              ) : null}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? t.auth.registering : t.auth.registerButton}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-500 text-center">
          {t.auth.haveAccount}{' '}
          <Link to="/login" className="text-green-700 font-semibold hover:text-green-800">
            {t.auth.goLogin}
          </Link>
        </p>
      </div>
    </div>
  );
};
