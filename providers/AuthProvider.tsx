import { createContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

export const AuthContext = createContext({
  token: null,
  currentUser: null,
  setCurrentUser: (_user: any) => {},
  login: async (_email: string, _password: string): Promise<any> => {
    return null;
  },
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      const stored = await SecureStore.getItemAsync("accessToken");
      if (stored) {
        setToken(stored);
        await fetchCurrentUser(stored);
      }
      setLoading(false);
    };
    loadToken();
  }, []);

  const fetchCurrentUser = async (accessToken) => {
    try {
      const res = await fetch(
        "https://api-livetakeoff.herokuapp.com/api/users/me",
        {
          headers: {
            Authorization: `JWT ${accessToken}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch user");
      const userData = await res.json();
      setCurrentUser(userData);

      return userData; // ✅ return the user so login can return it too
    } catch (err) {
      console.error("Error fetching user:", err);
      return null;
    }
  };

  const login = async (email, password) => {
    const res = await fetch(
      "https://api-livetakeoff.herokuapp.com/api/token/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      }
    );

    if (!res.ok) throw new Error("Login failed");
    const data = await res.json();

    await SecureStore.setItemAsync("accessToken", data.access);
    await SecureStore.setItemAsync("refreshToken", data.refresh);
    setToken(data.access);

    const user = await fetchCurrentUser(data.access); // ✅ now wait and return the result
    return user;
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, currentUser, setCurrentUser, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
