"use client";

import axios from "axios";
import { useAuth } from "@/app/context/context"; // Import useAuth

const BASE_URL = "http://localhost:8000"; // Update with your actual API URL
const API_KEY = process.env.NEXT_PUBLIC_API_KEY; // Ensure it's set in .env.local

const createAxiosInstance = (token) => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY, // Include API Key
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
};


const useAxiosInstance = () => {
  const { token } = useAuth(); // Get token from Auth Context
  const api = createAxiosInstance(token);

  // Attach interceptors
  api.interceptors.request.use(
    (config) => {
      if (typeof window !== "undefined") {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          config.headers.Authorization = `Bearer ${storedToken}`;
        }
      }
      config.headers["x-api-key"] = API_KEY;
      return config;
    },
    (error) => Promise.reject(error)
  );

  return api;
};

export default useAxiosInstance;