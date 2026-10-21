
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  loginRequest,
  logoutRequest,
} from "./auth.api";

import {
  refreshSession,
} from "../../lib/apiClient";

import {
  setAccessToken,
  clearAccessToken,
} from "../../lib/authToken";

import AuthContext from "./AuthContext";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const restoreSession = useCallback(async () => {
    try {
      const session = await refreshSession();
      setUser(session?.user || null);
    } catch {
      clearAccessToken();
      setUser(null);
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    const handleExpired = () => {
      clearAccessToken();
      setUser(null);
    };

    window.addEventListener("auth:expired", handleExpired);

    return () => {
      window.removeEventListener("auth:expired", handleExpired);
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const response = await loginRequest({ email, password });

    const token = response?.data?.accessToken;
    const authenticatedUser = response?.data?.user;

    if (!token || !authenticatedUser) {
      throw new Error("Invalid login response.");
    }

    setAccessToken(token);
    setUser(authenticatedUser);

    return authenticatedUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      clearAccessToken();
      setUser(null);
    }
  }, []);

  // Used after a successful password change.
  // The server has already revoked refresh sessions.
  const clearSession = useCallback(() => {
    clearAccessToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      authenticated: Boolean(user),
      mustChangePassword: Boolean(user?.mustChangePassword),
      login,
      logout,
      clearSession,
      restoreSession,
    }),
    [
      user,
      initializing,
      login,
      logout,
      clearSession,
      restoreSession,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;