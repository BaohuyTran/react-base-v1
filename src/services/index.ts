/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import { AxiosRequestConfig } from "axios";
import httpClient from "./httpClient";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

interface ApiServiceProps {
  url: string;
  params?: string;
  config?: AxiosRequestConfig;
  data?: unknown;
  id?: number | string;
  // endpoint?: string;
}

interface ApiQueryServiceProps<TOptions> extends ApiServiceProps {
  key: string;
  options: TOptions;
}

interface IApiMethod {
  get: <T>(props: ApiServiceProps) => Promise<T>;
  post: <T>(props: ApiServiceProps) => Promise<T>;
  put: <T>(props: ApiServiceProps) => Promise<T>;
  patch: <T>(props: ApiServiceProps) => Promise<T>;
  delete: <T>(props: ApiServiceProps) => Promise<T>;
}

export const getApiMethodInstance = (apiService: string): IApiMethod => {
  return {
    get: async <T>({ url, params, config }: ApiServiceProps) => {
      return httpClient.get<T>(`${apiService}${url}`, {
        ...config,
        params,
      });
    },
    post: async <T = unknown>({
      url,
      data,
      params,
      config,
    }: ApiServiceProps) => {
      return httpClient.post<T>(`${apiService}${url}`, data, {
        ...config,
        params,
      });
    },
    put: async <T = unknown>({
      url,
      data,
      params,
      config,
    }: ApiServiceProps) => {
      return httpClient.put<T>(`${apiService}${url}`, data, {
        ...config,
        params,
      });
    },
    patch: async <T = unknown>({
      url,
      data,
      params,
      config,
    }: ApiServiceProps) => {
      return httpClient.patch<T>(`${apiService}${url}`, data, {
        ...config,
        params,
      });
    },

    delete: async <T = unknown>({
      url,
      config,
      params,
      id,
    }: ApiServiceProps) => {
      return httpClient.delete<T>(`${apiService}${url}/${id}`, {
        ...config,
        params,
      });
    },
  };
};

export class ApiService {
  apiMethod: IApiMethod;

  constructor(service: string) {
    this.apiMethod = getApiMethodInstance(service);
  }

  useGet = <T>({
    url,
    params,
    options,
    config,
  }: ApiQueryServiceProps<
    Omit<UseQueryOptions<T>, "queryKey" | "queryFn">
  >) => {
    return useQuery({
      queryKey: [url, params],
      queryFn: () => this.apiMethod.get<T>({ url, params, config }),
      ...options,
    });
  };

  usePostQuery = <T>({
    url,
    data,
    params,
    options,
    config,
  }: ApiQueryServiceProps<
    Omit<UseQueryOptions<T>, "queryKey" | "queryFn">
  >) => {
    return useQuery({
      queryKey: [url, params],
      queryFn: () => this.apiMethod.post<T>({ url, data, params, config }),
      ...options,
    });
  };

  usePut = () => {};

  usePatch = () => {};

  useDelete = () => {};
}
