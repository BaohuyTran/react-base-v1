/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { clearLocalStorage, publicEndPoints } from "../utils";
import { includes, some } from "lodash";

class AxiosClient {
  private readonly axiosInstance: AxiosInstance;
  static instance: AxiosClient;
  private retryCount = 0;

  static getInstance() {
    if (!AxiosClient.instance) {
      AxiosClient.instance = new AxiosClient();
    }

    return AxiosClient.instance;
  }

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: "", // Set your base URL here
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.initializeInterceptor();
  }

  setAccessToken = (token: string) => {
    //save token in localStorage
    window.localStorage.setItem("accessToken", token);
  };

  private initializeInterceptor = () => {
    this.axiosInstance.interceptors.request.use(this.handleRequest);
    this.axiosInstance.interceptors.response.use(
      this.handleResponse,
      this.handleError
    );
  };

  // GET
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.get(url, config);
  }

  post<T>(url: string, data: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.post(url, data, config);
  }

  put<T>(url: string, data: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.put(url, data, config);
  }

  patch<T>(
    url: string,
    data: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.axiosInstance.patch(url, data, config);
  }

  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.delete(url, config);
  }

  private handleRequest = (config: InternalAxiosRequestConfig) => {
    const token = window.localStorage.getItem("accessToken");

    if (token && config.headers && !config.headers["Authorization"]) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  };

  private handleResponse = (response: AxiosResponse) => {
    if (
      !["application/json"].includes(response.headers["Content-Type"] as string)
    )
      return response;

    if (response.data) return response.data;

    return response;
  };

  private handleError = async (error: any) => {
    const originalRequest = error.config;

    if (
      (error.response?.status === 401,
      !some(publicEndPoints, (endpoint) => includes(originalRequest, endpoint)))
    ) {
      originalRequest._retry = true;

      window.console.warn("The token is expired");

      this.retryCount++;

      window.localStorage.removeItem("access_token");

      // re-send a get login request
      this.get("something/login") //should be the login api url
        .then((response: any) => {
          this.retryCount = 0;
          this.setAccessToken(response.access_token);
        })
        .catch((error) => {
          if (this.retryCount > 2) {
            clearLocalStorage();
            window.location.href = "/login";
          }
          window.console.warn("Something wrong. Retry...", error);
        });

      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      window.alert(
        "This is top gorvernment privacy. You are not allowed to access this resource!! Get out of here now!!"
      );
    }
  };
}

export default AxiosClient.getInstance();
