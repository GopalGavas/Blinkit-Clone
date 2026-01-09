/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import Axios from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // fetch logged-in user (if cookie exists)
  const fetchUser = async () => {
    try {
      const res = await Axios.get("/user/user-details");
      if (res.data.success) {
        setUser(res.data.data);
      }
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      // errorToast(err.response?.data?.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await Axios.post("/user/login", { email, password });

    if (!res.data.success) {
      throw new Error(res.data.message || "Invalid credentials");
    }

    if (res.data.success) {
      localStorage.setItem("token", res.data.token);
      await fetchUser();
    }

    return res;
  };

  const logout = async () => {
    await Axios.post("/user/logout");
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// custom hook
export const useAuth = () => {
  return useContext(AuthContext);
};
