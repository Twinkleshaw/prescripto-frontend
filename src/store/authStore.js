import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null, // "admin" | "doctor"

      setAuth: (user, token, role) => set({ user, token, role }),

      logout: () => set({ user: null, token: null, role: null }),

      isAuthenticated: () => !!useAuthStore.getState().token,
    }),
    {
      name: "prescripto-auth", // key in localStorage
    },
  ),
);
