import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('primecode_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        } catch (error) {
          console.error("Auth init error:", error);
          localStorage.removeItem('primecode_token');
          localStorage.removeItem('primecode_user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('primecode_token', res.data.token);
    localStorage.setItem('primecode_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('primecode_token', res.data.token);
    localStorage.setItem('primecode_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const loginAsGuest = () => {
    const guestUser = {
      id: null,
      name: 'Guest',
      email: '',
      role: 'guest',
      avatar: ''
    };
    localStorage.setItem('primecode_user', JSON.stringify(guestUser));
    setUser(guestUser);
    return { success: true, user: guestUser };
  };

  const logout = () => {
    localStorage.removeItem('primecode_token');
    localStorage.removeItem('primecode_user');
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await api.put('/users/profile', data);
    setUser({ ...user, ...res.data.user });
    localStorage.setItem('primecode_user', JSON.stringify({ ...user, ...res.data.user }));
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, loginAsGuest, login, register, logout, updateProfile, loading, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
