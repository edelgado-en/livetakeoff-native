import {
  createContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";

type User = Record<string, any>;

type AuthContextValue = {
  token: string | null;
  currentUser: User | null;
  authIsBootstrapping: boolean;
  setCurrentUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue>({
  token: null,
  currentUser: null,
  authIsBootstrapping: false,
  setCurrentUser: (_user: any) => {},
  login: async (_email: string, _password: string): Promise<any> => {
    return null;
  },
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authIsBootstrapping, setAuthIsBootstrapping] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const stored = await SecureStore.getItemAsync("accessToken");
        if (stored) {
          setToken(stored);
          await fetchCurrentUser(stored);
        }
      } catch (err) {
        console.error("Error restoring session:", err);
      } finally {
        setAuthIsBootstrapping(false);
      }
    };
    loadToken();
  }, []);

  const fetchCurrentUser = async (accessToken: string): Promise<User | null> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);

    try {
      const res = await fetch(
        "https://api-livetakeoff.herokuapp.com/api/users/me",
        {
          signal: controller.signal,
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
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const login = async (email: string, password: string): Promise<User | null> => {
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
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        currentUser,
        setCurrentUser,
        login,
        logout,
        authIsBootstrapping,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
