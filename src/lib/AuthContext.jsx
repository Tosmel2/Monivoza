/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/api/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getUser();
        setUser(userData);
      } else {
        setAuthError({ type: "auth_required" });
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      // Don't set auth error on initialization - just keep user logged out
    } finally {
      setIsLoadingAuth(false);
      setIsLoadingPublicSettings(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      setAuthError(null);

      // once authentication is successful route the user directly to the
      // appropriate dashboard instead of landing page. we detect the role so
      // admins are sent to the admin dashboard while regular customers land on
      // the normal dashboard.
      const redirectPath = response.user?.role === "admin" ? "/AdminDashboard" : "/Dashboard";
      navigate(redirectPath);

      return response;
    } catch (error) {
      setAuthError({ type: "login_failed", message: error.message });
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      setAuthError(null);
      return response;
    } catch (error) {
      setAuthError({ type: "register_failed", message: error.message });
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setAuthError(null);
    navigate("/login");
  };

  const navigateToLogin = () => {
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        login,
        register,
        logout,
        navigateToLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
