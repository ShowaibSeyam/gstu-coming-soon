"use client";

import { createContext, useContext } from "react";
import { signIn, signUp, signOut, useSession } from "../lib/auth-client";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const { data: session, isPending, error } = useSession();

  // Login with Email/Password
  const login = async (email, password) => {
    try {
      const { data, error } = await signIn.email({ email, password });
      if (error) throw new Error(error.message || "Failed to sign in");
      return data.user;
    } catch (err) {
      console.error("Login failed", err);
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Error signing out", err);
    }
  };

  // Register with Email/Password (new users default to 'student' role)
  const register = async (name, email, password) => {
    try {
      const { data, error } = await signUp.email({ name, email, password });
      if (error) throw new Error(error.message || "Failed to sign up");
      return data.user;
    } catch (err) {
      console.error("Register failed", err);
      throw err;
    }
  };

  const user = session?.user || null;
  const role = user?.role || "student";

  // Convenience role helpers
  const isStudent = role === "student";
  const isTeacher = role === "teacher";
  const isSuperAdmin = role === "superadmin";
  const isTeacherOrAdmin = isTeacher || isSuperAdmin;

  /**
   * Returns the path for the role-appropriate dashboard.
   */
  const getDashboardPath = () => {
    if (isSuperAdmin) return "/dashboard/superadmin";
    if (isTeacher) return "/dashboard/teacher";
    return "/dashboard/student";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading: isPending,
        login,
        logout,
        register,
        isStudent,
        isTeacher,
        isSuperAdmin,
        isTeacherOrAdmin,
        getDashboardPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
