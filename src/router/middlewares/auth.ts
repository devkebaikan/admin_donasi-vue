import { useAuthStore } from "@/stores/auth";
import type { Middleware } from "./middlewarePipeline";

// Wajib login. Redirect ke sign-in (bawa redirectedFrom) kalau belum autentikasi.
export const auth: Middleware = ({ to, next }) => {
  const authStore = useAuthStore();
  if (authStore.isAuthenticated()) return next();
  return next({ name: "auth.sign-in", query: { redirectedFrom: to.fullPath } });
};
