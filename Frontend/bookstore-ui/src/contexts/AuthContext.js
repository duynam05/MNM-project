import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { buildApiUrl } from '../config/api';

const AuthContext = createContext();
const USER_STORAGE_KEY = 'currentUser';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const setToken = useCallback((t) => {
    setTokenState(t);

    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
  }, []);

  const login = useCallback((userData, token) => {
    setUser(userData);
    setToken(token);

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
  }, [setToken]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(USER_STORAGE_KEY);

    window.dispatchEvent(new Event("logout"));
  }, [setToken]);

  const fetchMe = useCallback(async (token) => {
    try {
      const res = await fetch(buildApiUrl('/users/my-info'), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      console.log("MY INFO:", data);

      if (res.ok) {
        setUser(data.result);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.result));
      } else {
        console.warn("Invalid token → logout");
        logout();
      }
    } catch (err) {
      console.error("fetchMe error:", err);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      fetchMe(token);
    } else {
      setLoading(false);
    }
  }, [fetchMe, token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
