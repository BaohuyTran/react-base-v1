/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import { AxiosRequestConfig } from "axios";
import httpClient from "./httpClient";
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import { API_SERVICES } from "../constants";

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

type ApiMutationOptionProps<T> = Omit<
  UseMutationOptions<T, unknown, { data: Record<string, T> }, unknown>,
  "mutationFn"
>;

interface IApiMethod {
  get: <T>(props: ApiServiceProps) => Promise<T>;
  post: <T>(props: ApiServiceProps) => Promise<T>;
  put: <T>(props: ApiServiceProps) => Promise<T>;
  patch: <T>(props: ApiServiceProps) => Promise<T>;
  delete: <T>(props: ApiServiceProps) => Promise<T>;
}

const getApiEndpoint = (service: API_SERVICES): string => {
  return `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${service}`;
};

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
      params,
      config,
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

  usePost = <T>(props: ApiServiceProps, options: ApiMutationOptionProps<T>) => {
    const { url, params, config } = props;

    return useMutation({
      mutationFn: (data) =>
        this.apiMethod.post<T>({ url, data, params, config }),
      ...options,
    });
  };

  usePut = <T>(props: ApiServiceProps, options: ApiMutationOptionProps<T>) => {
    const { url, params, config } = props;

    return useMutation({
      mutationFn: (data) =>
        this.apiMethod.put<T>({ url, data, params, config }),
      ...options,
    });
  };

  usePatch = <T>(
    props: ApiServiceProps,
    options: ApiMutationOptionProps<T>
  ) => {
    const { url, params, config } = props;

    return useMutation({
      mutationFn: (data) =>
        this.apiMethod.patch<T>({ url, data, params, config }),
      ...options,
    });
  };

  useDelete = <T>(
    props: ApiServiceProps,
    options: ApiMutationOptionProps<T>
  ) => {
    const { url, params, config, id } = props;

    return useMutation({
      mutationFn: () => this.apiMethod.delete<T>({ url, params, config, id }),
      ...options,
    });
  };
}

//Export api endpoint
export const TEST_SERVICE_ENPOINT = getApiEndpoint(API_SERVICES.TEST_SERVICE);
export const AUTH_SERVICE_ENPOINT = getApiEndpoint(API_SERVICES.AUTH_SERVICE);

//Export api service method
export const TestService = new ApiService(TEST_SERVICE_ENPOINT);
export const AuthService = new ApiService(AUTH_SERVICE_ENPOINT);
