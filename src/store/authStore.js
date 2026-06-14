import { create } from "zustand";

const authStore = create((set) => {
  // Initialize from localStorage
  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const initialUser = storedUser ? JSON.parse(storedUser) : null;

  return {
    user: initialUser,
    isAuthenticated: !!initialUser,

    setUser: (user) => {
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
      set({ user, isAuthenticated: !!user });
    },

    logout: () => {
      localStorage.removeItem("user");
      set({ user: null, isAuthenticated: false });
    },

    // Initialize auth state from localStorage on app load
    initializeAuth: () => {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      set({ user, isAuthenticated: !!user });
    },
  };
});

export default authStore;
