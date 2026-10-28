import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getMeRequest,
  loginRequest,
  logoutRequest,
} from "./auth.api";

import {
  refreshSession,
  invalidateAuthSession,
} from "../../lib/apiClient";

import {
  setAccessToken,
} from "../../lib/authToken";

import AuthContext from "./AuthContext";

const AuthProvider = ({ children }) => {
  /*
  |--------------------------------------------------------------------------
  | Authentication State
  |--------------------------------------------------------------------------
  */

  const [user, setUser] = useState(null);

  const [initializing, setInitializing] =
    useState(true);

  /*
  |--------------------------------------------------------------------------
  | Authentication Generation
  |--------------------------------------------------------------------------
  |
  | Prevent stale asynchronous authentication operations from
  | restoring user state after logout or session revocation.
  |
  */

  const authGenerationRef = useRef(0);

  const restorePromiseRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | Clear Local Authentication
  |--------------------------------------------------------------------------
  */

  const clearSession = useCallback(() => {
    authGenerationRef.current += 1;

    invalidateAuthSession();

    setUser(null);

    setInitializing(false);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Restore Session
  |--------------------------------------------------------------------------
  */

  const restoreSession = useCallback(async () => {
    if (restorePromiseRef.current) {
      return restorePromiseRef.current;
    }

    const generationAtStart =
      authGenerationRef.current;

    const promise = (async () => {
      try {
        const session = await refreshSession();

        if (
          generationAtStart !==
          authGenerationRef.current
        ) {
          return null;
        }

        const restoredUser = session?.user || null;

        setUser(restoredUser);

        return restoredUser;
      } catch {
        if (
          generationAtStart ===
          authGenerationRef.current
        ) {
          invalidateAuthSession();
          setUser(null);
        }

        return null;
      } finally {
        if (
          generationAtStart ===
          authGenerationRef.current
        ) {
          setInitializing(false);
        }
      }
    })();

    restorePromiseRef.current = promise;

    try {
      return await promise;
    } finally {
      if (restorePromiseRef.current === promise) {
        restorePromiseRef.current = null;
      }
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Initial Session Restoration
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  /*
  |--------------------------------------------------------------------------
  | Handle Expired or Revoked Sessions
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleExpired = () => {
      clearSession();
    };

    window.addEventListener(
      "auth:expired",
      handleExpired
    );

    return () => {
      window.removeEventListener(
        "auth:expired",
        handleExpired
      );
    };
  }, [clearSession]);

  /*
  |--------------------------------------------------------------------------
  | Login
  |--------------------------------------------------------------------------
  */

  const login = useCallback(
    async ({ email, password }) => {
      const generationAtStart =
        authGenerationRef.current;

      const response = await loginRequest({
        email,
        password,
      });

      const token = response?.data?.accessToken;

      const authenticatedUser =
        response?.data?.user;

      if (!token || !authenticatedUser) {
        throw new Error(
          "Invalid login response."
        );
      }

      if (
        generationAtStart !==
        authGenerationRef.current
      ) {
        throw new Error(
          "Authentication state changed during login. Please try again."
        );
      }

      setAccessToken(token);

      setUser(authenticatedUser);

      setInitializing(false);

      return authenticatedUser;
    },
    []
  );

  /*
  |--------------------------------------------------------------------------
  | Refresh Current User
  |--------------------------------------------------------------------------
  */

  const refreshUser = useCallback(async () => {
    const generationAtStart =
      authGenerationRef.current;

    const response = await getMeRequest();

    const refreshedUser = response?.data?.user;

    if (!refreshedUser) {
      throw new Error(
        "Unable to load your profile information."
      );
    }

    if (
      generationAtStart !==
      authGenerationRef.current
    ) {
      throw new Error(
        "Authentication state changed while loading your profile."
      );
    }

    setUser(refreshedUser);

    return refreshedUser;
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const logout = useCallback(async () => {
    /*
    |--------------------------------------------------------------------------
    | Invalidate pending authentication operations immediately.
    |--------------------------------------------------------------------------
    */

    authGenerationRef.current += 1;

    /*
    |--------------------------------------------------------------------------
    | Send logout request before clearing the access token.
    |--------------------------------------------------------------------------
    |
    | The backend revokes the current session using the
    | HTTP-only refresh cookie.
    |
    */

    try {
      await logoutRequest();
    } catch (error) {
      console.error(
        "Logout request failed:",
        error
      );
    } finally {
      invalidateAuthSession();

      setUser(null);

      setInitializing(false);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Context Value
  |--------------------------------------------------------------------------
  */

  const value = useMemo(
    () => ({
      user,

      initializing,

      authenticated: Boolean(user),

      mustChangePassword: Boolean(
        user?.mustChangePassword
      ),

      login,

      logout,

      clearSession,

      restoreSession,

      refreshUser,
    }),
    [
      user,
      initializing,
      login,
      logout,
      clearSession,
      restoreSession,
      refreshUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;