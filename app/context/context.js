"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

// Base API URL
const BASE_URL = "http://localhost:8000"; // Replace with actual API URL
const API_KEY = process.env.NEXT_PUBLIC_API_KEY; // Ensure this is in .env.local

// Create Context
const AuthContext = createContext(undefined);

// AuthProvider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState("");
  const router = useRouter();

  // Create Axios Instance (Without Authorization Header)
  const api = axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
  });

  // Attach Axios Interceptor (Fetch Token Dynamically)
  api.interceptors.request.use(
    async (config) => {
      if (typeof window !== "undefined") {
        const accessToken = localStorage.getItem("token"); // Get the latest token
        console.log("🔹 Token from localStorage:", accessToken);

        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Load token from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
      }
    }
  }, []);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await api.get("/api/user/profile");
        setUser(response.data);
      } catch (error) {
        console.error("Auth check error:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          setToken("");
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [token]); // Runs when token changes

  // Login Function
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await api.post("/api/user/login", { email, password });
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  // Signup Function
  const signup = async (name, email, password) => {
    setIsLoading(true);
    try {
      await api.post("/api/user/register", { name, email, password });
    } finally {
      setIsLoading(false);
    }
  };

  // Logout Function
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    router.push("/auth/login");
  };

  console.log(user)
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        api,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use Auth Context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
