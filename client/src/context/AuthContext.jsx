import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore session from token
  useEffect(() => {
    const token = localStorage.getItem('fs_token');
    if (!token) { setLoading(false); return; }

    api.get('/auth/me')
      .then(({ data }) => setUser(data))
      .catch(() => localStorage.removeItem('fs_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('fs_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('fs_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('fs_token');
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const { data } = await api.patch('/auth/profile', updates);
    setUser(data);
    return data;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const { data } = await api.patch('/auth/password', { currentPassword, newPassword });
    return data;
  };

  const deleteAccount = async (password) => {
    const { data } = await api.delete('/auth/account', { data: { password } });
    localStorage.removeItem('fs_token');
    setUser(null);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, changePassword, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
