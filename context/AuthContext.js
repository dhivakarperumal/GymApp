import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Restore session on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        const storedUser = await AsyncStorage.getItem("user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.log("Auth restore error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // 🔑 Login
  const login = async (userData, userToken) => {
    setUser(userData);
    setToken(userToken);

    await AsyncStorage.setItem("token", userToken);
    await AsyncStorage.setItem("user", JSON.stringify(userData));
  };

  // 🚪 Logout
  const logout = async () => {
    setUser(null);
    setToken(null);

    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);