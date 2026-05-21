import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [lang, setLang]   = useState(localStorage.getItem('gmpp_lang')  || 'fr');
  const [theme, setTheme] = useState(localStorage.getItem('gmpp_theme') || 'dark');

  useEffect(() => {
    const token  = localStorage.getItem('gmpp_token');
    const stored = localStorage.getItem('gmpp_user');
    if (token && stored) {
      try { setUser(JSON.parse(stored)); }
      catch { localStorage.clear(); }
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : '');
    document.documentElement.setAttribute('dir',  lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }, [theme, lang]);

  const login = useCallback(async (email, motDePasse) => {
    const { data } = await authAPI.login({ email, motDePasse });
    localStorage.setItem('gmpp_token',   data.token);
    localStorage.setItem('gmpp_refresh', data.refreshToken);
    localStorage.setItem('gmpp_user',    JSON.stringify(data));
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('gmpp_token');
    localStorage.removeItem('gmpp_refresh');
    localStorage.removeItem('gmpp_user');
    setUser(null);
  }, []);

  // hasRole(...roles) - returns true if user's role matches any of the given roles
  const hasRole = useCallback((...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  const changeLang = useCallback(l => {
    setLang(l);
    localStorage.setItem('gmpp_lang', l);
  }, []);

  const changeTheme = useCallback(t => {
    setTheme(t);
    localStorage.setItem('gmpp_theme', t);
  }, []);

  return (
    <AuthContext.Provider value={{ user, lang, theme, login, logout, hasRole, changeLang, changeTheme }}>
      {children}
    </AuthContext.Provider>
  );
}
