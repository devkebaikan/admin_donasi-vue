import { defineStore } from "pinia";
import router from "@/router";
import { useStorage } from "@vueuse/core";
import type { User } from "@/types/auth";
import HttpClient from "@/helpers/http-client";

export const useAuthStore = defineStore("auth_store", () => {
  const user = useStorage<string | null>("VUE_USER", null);

  const saveSession = (newUser: User) => {
    user.value = JSON.stringify(newUser);
  };

  const clearBrowserData = () => {
    user.value = null;
    localStorage.removeItem("VUE_USER");
    sessionStorage.clear();

    // Hapus semua cookies
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      if (name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname};`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
      }
    }
  };

  const removeSession = () => {
    clearBrowserData();
    router.push("/auth/sign-in");
  };

  const logout = async () => {
    try {
      await HttpClient.post("/auth/logout");
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      removeSession();
    }
  };

  const isAuthenticated = () => user.value != null;

  return {
    user,
    saveSession,
    removeSession,
    logout,
    isAuthenticated,
  };
});
