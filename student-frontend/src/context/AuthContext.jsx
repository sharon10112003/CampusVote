import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const data = await api.get('/auth/profile');
        setUser(data);
      }
    } catch (error) {
      console.error('Failed to load profile', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (registerNumber, passwordOrDob, isStudent = false) => {
    setLoading(true);
    try {
      const body = { registerNumber };
      if (isStudent) {
        body.dob = passwordOrDob;
      } else {
        body.password = passwordOrDob;
      }
      const data = await api.post('/auth/login', body);
      localStorage.setItem('token', data.token);
      setUser({
        _id: data._id,
        name: data.name,
        registerNumber: data.registerNumber,
        email: data.email,
        role: data.role,
        department: data.department,
      });
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser: fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
