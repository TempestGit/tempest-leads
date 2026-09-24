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

const AuthProvider = ({
  children,
}) => {
  const [
    user,
    setUser,
  ] = useState(null);

  const [
    initializing,
    setInitializing,
  ] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | Restore Session
  |--------------------------------------------------------------------------
  |
  | refreshSession() has a global lock.
  |
  | Therefore React StrictMode can call this more than once without creating
  | multiple refresh-token rotations.
  |
  */

  const restoreSession =
    useCallback(async () => {
      try {
        const session =
          await refreshSession();

        setUser(
          session?.user ||
            null
        );
      } catch {
        clearAccessToken();

        setUser(null);
      } finally {
        setInitializing(
          false
        );
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
  | Authentication Expired
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleExpired =
      () => {
        clearAccessToken();

        setUser(null);
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
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Login
  |--------------------------------------------------------------------------
  */

  const login =
    useCallback(
      async ({
        email,
        password,
      }) => {
        const response =
          await loginRequest({
            email,
            password,
          });

        const token =
          response?.data
            ?.accessToken;

        const authenticatedUser =
          response?.data?.user;

        if (
          !token ||
          !authenticatedUser
        ) {
          throw new Error(
            "Invalid login response."
          );
        }

        setAccessToken(
          token
        );

        setUser(
          authenticatedUser
        );

        return authenticatedUser;
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const logout =
    useCallback(
      async () => {
        try {
          await logoutRequest();
        } catch (error) {
          /*
           * Even if the server session has already expired,
           * clear the local authentication state.
           */
          console.error(
            "Logout request failed:",
            error
          );
        } finally {
          clearAccessToken();

          setUser(null);
        }
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | Context
  |--------------------------------------------------------------------------
  */

  const value =
    useMemo(
      () => ({
        user,

        initializing,

        authenticated:
          Boolean(user),

        login,

        logout,

        restoreSession,
      }),
      [
        user,
        initializing,
        login,
        logout,
        restoreSession,
      ]
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;