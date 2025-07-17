import { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export const AuthContext = createContext({
  token: null,
  login: async (_email: string, _password: string) => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const loadToken = async () => {
      const stored = await SecureStore.getItemAsync('accessToken');
      if (stored) setToken(stored);
    };
    loadToken();
  }, []);

  const login = async (email, password) => {
    console.log(JSON.stringify({ username: email, password }));
    const res = await fetch('https://api-livetakeoff.herokuapp.com/api/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ username: email, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    await SecureStore.setItemAsync('accessToken', data.access);
    setToken(data.access);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};