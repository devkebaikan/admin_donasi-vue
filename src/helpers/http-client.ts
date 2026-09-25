import { useAuthStore } from "@/stores/auth";
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  AxiosError,
} from "axios";

interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

const API_BASE_URL = "/api";

const CLIENT_KEY =
  (import.meta.env.VITE_PUBLIC_CLIENT_KEY as string) ||
  (import.meta.env.VITE_CLIENT_KEY as string) ||
  "";

const DEFAULT_TIMEOUT = 30000; // 30 detik

class HttpClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        Accept: "application/json",
        ...(CLIENT_KEY ? { "X-Client-Key": CLIENT_KEY } : {}),
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Interceptor Request
    this.instance.interceptors.request.use((config) => {
      // Pastikan X-Client-Key selalu disertakan pada setiap request
      if (CLIENT_KEY) {
        config.headers["X-Client-Key"] = CLIENT_KEY;
      }

      const auth = useAuthStore();
      let token = null;

      // Parse token dari session storage
      if (auth.user) {
        if (typeof auth.user === "string") {
          try {
            const parsed = JSON.parse(auth.user);
            token =
              parsed?.token ||
              parsed?.data?.access_token ||
              parsed?.access_token ||
              null;
          } catch (e) {
            console.warn("Invalid auth data in storage", e);
          }
        } else if (typeof auth.user === "object") {
          const userData = auth.user as any;
          token =
            userData?.token ||
            userData?.data?.access_token ||
            userData?.access_token ||
            null;
        }
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    // Interceptor Response
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ErrorResponse>) => {
        if (error.response?.status === 401) {
          // Jika token invalid, hapus dan arahkan ke login
          const auth = useAuthStore();
          auth.removeSession();
        }

        // Log error saat development
        if (import.meta.env.DEV) {
          console.error("API Error:", error.response?.data || error.message);
        }

        return Promise.reject(error);
      },
    );
  }

  // 🧩 Helper methods
  public get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.instance.get<T>(url, config);
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.instance.post<T>(url, data, config);
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.instance.put<T>(url, data, config);
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.instance.delete<T>(url, config);
  }

  public patch<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.instance.patch<T>(url, config);
  }
}

export default new HttpClient();
