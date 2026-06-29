import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/auth.store";
import { getErrorMessage } from "@/lib/utils/errors";
import { getApiUrl } from "@/lib/api/config";

export const apiClient = axios.create({
  headers: { "Content-Type": "application/json" },
});

// --- Inject baseURL dynamically before each request ---
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (!config.baseURL) {
      const baseUrl = await getApiUrl();
      config.baseURL = `${baseUrl}/api/v1`;
    }

    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
);

// --- Response interceptor: auto-refresh on 401 ---
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || original._retry) {
      const errorMessage = getErrorMessage(error);
      const structuredError = new Error(errorMessage);
      return Promise.reject(structuredError);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return apiClient(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    const { refreshToken, setTokens, clear } = useAuthStore.getState();

    if (!refreshToken) {
      clear();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    try {
      const baseUrl = await getApiUrl();
      const { data } = await axios.post(
        `${baseUrl}/api/v1/auth/refresh-token`,
        { refresh_token: refreshToken },
      );
      setTokens(data.access_token, data.refresh_token || refreshToken!);
      processQueue(null, data.access_token);
      original.headers.Authorization = `Bearer ${data.access_token}`;
      return apiClient(original);
    } catch (err) {
      processQueue(err, null);
      clear();
      window.location.href = "/login";
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);
