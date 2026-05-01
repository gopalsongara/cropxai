import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LANGUAGE_STORAGE_KEY } from './LanguageContext';
import { apiUrl } from '../utils/api';

const AuthContext = createContext();
const storageKeys = {
  token: 'cropx_token',
  role: 'cropx_role',
  user: 'cropx_user',
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(storageKeys.token) || localStorage.getItem('token'));
  const [role, setRole] = useState(() => localStorage.getItem(storageKeys.role));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKeys.user) || localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  const [isUserLoading, setIsUserLoading] = useState(false);

  const refreshUserProfile = useCallback(async (authToken = token) => {
    if (!authToken) return null;

    const profileResponse = await fetch(apiUrl('/api/profile'), {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (profileResponse.status === 404) {
      const fallbackResponse = await fetch(apiUrl('/api/user/profile'), {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const fallbackData = await fallbackResponse.json();

      if (!fallbackResponse.ok || fallbackData?.success === false) {
        const legacyResponse = await fetch(apiUrl('/api/auth/me'), {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const legacyData = await legacyResponse.json();
        if (!legacyResponse.ok || legacyData?.success === false) {
          const error = new Error(legacyData?.error || fallbackData?.error || 'Failed to load user');
          error.status = legacyResponse.status;
          throw error;
        }
        return {
          success: true,
          user: {
            ...legacyData,
            phone: legacyData?.phone || '',
            location: legacyData?.location || '',
            farmSize: legacyData?.farmSize || '',
            crops: Array.isArray(legacyData?.crops) ? legacyData.crops : [],
            recommendedCrops: Array.isArray(legacyData?.recommendedCrops) ? legacyData.recommendedCrops : [],
            weatherRegion: legacyData?.weatherRegion || legacyData?.location || 'N/A',
            pestScansCount: Number.isFinite(legacyData?.pestScansCount) ? legacyData.pestScansCount : 0,
            avatar: legacyData?.profileImage || legacyData?.avatar || '',
            profileImage: legacyData?.profileImage || legacyData?.avatar || '',
            language: legacyData?.language === 'hi' ? 'hi' : 'en',
          },
          stats: {
            totalPestScans: Number.isFinite(legacyData?.pestScansCount) ? legacyData.pestScansCount : 0,
            recommendedCropsCount: Array.isArray(legacyData?.recommendedCrops)
              ? legacyData.recommendedCrops.length
              : Array.isArray(legacyData?.crops)
                ? legacyData.crops.length
                : 0,
            weatherRegion: legacyData?.weatherRegion || legacyData?.location || 'N/A',
            lastLogin: legacyData?.lastLogin || null,
          },
        };
      }
      return {
        success: true,
        user: {
          ...(fallbackData?.user || {}),
          phone: fallbackData?.user?.phone || '',
          location: fallbackData?.user?.location || '',
          farmSize: fallbackData?.user?.farmSize || '',
          crops: Array.isArray(fallbackData?.user?.crops) ? fallbackData.user.crops : [],
          recommendedCrops: Array.isArray(fallbackData?.user?.recommendedCrops) ? fallbackData.user.recommendedCrops : [],
          weatherRegion: fallbackData?.user?.weatherRegion || fallbackData?.stats?.weatherRegion || fallbackData?.user?.location || 'N/A',
          pestScansCount: Number.isFinite(fallbackData?.user?.pestScansCount) ? fallbackData.user.pestScansCount : 0,
          avatar: fallbackData?.user?.profileImage || fallbackData?.user?.avatar || '',
          profileImage: fallbackData?.user?.profileImage || fallbackData?.user?.avatar || '',
          language: fallbackData?.user?.language === 'hi' ? 'hi' : 'en',
        },
        stats: {
          totalPestScans: Number.isFinite(fallbackData?.stats?.totalPestScans)
            ? fallbackData.stats.totalPestScans
            : Number.isFinite(fallbackData?.user?.pestScansCount)
              ? fallbackData.user.pestScansCount
              : 0,
          recommendedCropsCount: Number.isFinite(fallbackData?.stats?.recommendedCropsCount)
            ? fallbackData.stats.recommendedCropsCount
            : Array.isArray(fallbackData?.user?.recommendedCrops)
              ? fallbackData.user.recommendedCrops.length
              : Array.isArray(fallbackData?.user?.crops)
                ? fallbackData.user.crops.length
                : 0,
          weatherRegion: fallbackData?.stats?.weatherRegion || fallbackData?.user?.weatherRegion || fallbackData?.user?.location || 'N/A',
          lastLogin: fallbackData?.stats?.lastLogin || fallbackData?.user?.lastLogin || null,
        },
      };
    }

    const profileData = await profileResponse.json();
    if (!profileResponse.ok || profileData?.success === false) {
      const error = new Error(profileData?.error || 'Failed to load user');
      error.status = profileResponse.status;
      throw error;
    }

    return profileData;
  }, [token]);

  const updateUserProfile = useCallback(async (payload) => {
    if (!token) {
      throw new Error('Unauthorized');
    }

    const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
    const response = await fetch(apiUrl('/api/profile/update'), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      },
      body: isFormData ? payload : JSON.stringify(payload),
    });
    const parseJsonSafe = async (res) => res.json().catch(() => ({}));
    let finalResponse = response;
    let data = await parseJsonSafe(response);
    if (response.status === 404) {
      finalResponse = await fetch(apiUrl('/api/user/profile'), {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        },
        body: isFormData ? payload : JSON.stringify(payload),
      });
      data = await parseJsonSafe(finalResponse);
    }

    if (!finalResponse.ok || data?.success === false) {
      const error = new Error(data?.error || 'Failed to update profile');
      error.status = finalResponse.status;
      throw error;
    }

    setUser((prevUser) => ({
      ...(prevUser || {}),
      ...(data?.user || {}),
    }));

    if (data?.user?.language) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, data.user.language);
      localStorage.setItem('lang', data.user.language);
    }

    return data?.user;
  }, [token]);

  const login = ({ token: nextToken, role: nextRole, user: nextUser }) => {
    localStorage.setItem(storageKeys.token, nextToken);
    localStorage.setItem('token', nextToken);
    localStorage.setItem(storageKeys.role, nextRole);
    localStorage.setItem(storageKeys.user, JSON.stringify(nextUser || null));
    localStorage.setItem('user', JSON.stringify(nextUser || null));
    setToken(nextToken);
    setRole(nextRole);
    setUser(nextUser || null);
  };

  const logout = () => {
    localStorage.removeItem(storageKeys.token);
    localStorage.removeItem('token');
    localStorage.removeItem(storageKeys.role);
    localStorage.removeItem(storageKeys.user);
    localStorage.removeItem('user');
    setToken(null);
    setRole(null);
    setUser(null);
  };

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();
    const loadUser = async () => {
      try {
        setIsUserLoading(true);
        const data = await refreshUserProfile(token);
        if (!controller.signal.aborted) {
          setUser(data?.user || null);
          localStorage.setItem(storageKeys.user, JSON.stringify(data?.user || null));
          localStorage.setItem('user', JSON.stringify(data?.user || null));
          if (data?.user?.role) {
            const normalizedRole = data.user.role === 'labadmin' ? 'labadmin' : 'farmer';
            localStorage.setItem(storageKeys.role, normalizedRole);
            setRole(normalizedRole);
          }
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setUser(null);
          if (error?.status === 401) {
            localStorage.removeItem(storageKeys.token);
            localStorage.removeItem('token');
            localStorage.removeItem(storageKeys.role);
            localStorage.removeItem(storageKeys.user);
            localStorage.removeItem('user');
            setToken(null);
            setRole(null);
            setUser(null);
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsUserLoading(false);
        }
      }
    };

    loadUser();
    return () => controller.abort();
  }, [token, refreshUserProfile]);

  const value = useMemo(
    () => ({
      token,
      role,
      user,
      setUser,
      isUserLoading,
      isAuthenticated: Boolean(token),
      login,
      logout,
      refreshUserProfile,
      updateUserProfile,
    }),
    [token, role, user, isUserLoading, refreshUserProfile, updateUserProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
