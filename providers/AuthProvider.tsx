import { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export const AuthContext = createContext({
  token: null,
  login: async (_email: string, _password: string) => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      const stored = await SecureStore.getItemAsync('accessToken');
      if (stored) setToken(stored);
      setLoading(false);
    };
    loadToken();
  }, []);

  const login = async (email, password) => {
    const res = await fetch('https://api-livetakeoff.herokuapp.com/api/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ username: email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    await SecureStore.setItemAsync('accessToken', data.access);
    await SecureStore.setItemAsync('refreshToken', data.refresh);
    setToken(data.access);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    setToken(null);
  };

  const refreshAccessToken = async () => {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    if (!refreshToken) return;

    const res = await fetch('https://api-livetakeoff.herokuapp.com/api/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
    });

    if (res.ok) {
        const data = await res.json();
        await SecureStore.setItemAsync('accessToken', data.access);
        setToken(data.access);
        return data.access;
    } else {
        // Refresh failed: logout
        await logout();
    }
 };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};