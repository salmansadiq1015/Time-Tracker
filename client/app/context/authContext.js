"use client";
import {
  useState,
  useEffect,
  useContext,
  createContext,
  useCallback,
} from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    user: null,
    token: "",
  });
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  axios.defaults.headers.common["Authorization"] = auth.token;

  useEffect(() => {
    const token = localStorage.getItem("Ttoken");
    const user = localStorage.getItem("Tuser");

    if (token && user) {
      const userData = JSON.parse(user);
      setAuth((prev) => ({
        ...prev,
        token: token,
        user: userData,
      }));
    }
    setIsLoading(false);
  }, []);

  // Check token expiry
  useEffect(() => {
    const logoutUser = () => {
      localStorage.removeItem("Ttoken");
      localStorage.removeItem("Tuser");
      setAuth({ user: null, token: "" });
      // Optionally redirect
      // window.location.href = "/auth/login";
    };

    const checkTokenExpiry = () => {
      const token = localStorage.getItem("Ttoken");

      if (
        !token ||
        typeof token !== "string" ||
        token.split(".").length !== 3
      ) {
        // Invalid or missing token
        logoutUser();
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        if (!payload?.exp || typeof payload.exp !== "number") {
          throw new Error("Invalid token payload");
        }

        const isExpired = Date.now() > payload.exp * 1000;

        if (isExpired) {
          logoutUser();
        }
      } catch (err) {
        console.error("JWT validation failed:", err);
        logoutUser();
      }
    };

    checkTokenExpiry();
  }, []);

  // Signout
  const handleLogout = useCallback(async () => {
    localStorage.removeItem("Ttoken");
    localStorage.removeItem("Tuser");
    setAuth({ user: null, token: "" });
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        isLoading,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContent = () => useContext(AuthContext);
