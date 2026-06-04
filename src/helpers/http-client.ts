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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const DEFAULT_TIMEOUT = 30000; // 30 detik

class HttpClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Interceptor Request
    this.instance.interceptors.request.use((config) => {
      const auth = useAuthStore();
      let token = null;

      // Parse token dari session storage
      if (auth.user && typeof auth.user === "string") {
        try {
          const parsed = JSON.parse(auth.user);
          token = parsed?.token || parsed?.data?.access_token || null;
        } catch (e) {
          console.warn("Invalid auth data in storage", e);
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
