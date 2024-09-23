import { parseError, paramsToString, assignDeep, objectToFormData, cloneDeep } from '@/utils';

export interface RequestConfig extends RequestInit {
  url: string;
  origin?: string;
  method?: Method;
  headers?: Record<string, string>;
  payload?: object | null;
  responseType?: ResponseType;
}
export type RequestOptions = Omit<RequestConfig, 'url' | 'method' | 'body' | 'payload'>;
export type Method = 'GET' | 'DELETE' | 'HEAD' | 'POST' | 'PUT' | 'PATCH';
export type ResponseType = 'arraybuffer' | 'blob' | 'json' | 'text' | 'formData';

export interface Result<T = unknown> {
  data: T;
  config: RequestConfig;
  status: number;
  statusText: string;
  headers: Headers;
}

class TotteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TotteError';
  }
}

export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
export type ResponseInterceptor<T = unknown, R extends Result<T> = Result<T>> = (
  result: R,
) => void | R | Promise<void | R>;

export class Totte {
  private options: RequestOptions;
  private requestInterceptors: RequestInterceptor[];
  private responseInterceptors: ResponseInterceptor[];

  constructor(options: RequestOptions = {}) {
    this.options = options;
    this.requestInterceptors = [];
    this.responseInterceptors = [];

    this.useRequestInterceptor(config => {
      config.method ??= 'GET';
      config.responseType ??= 'json';
      config.headers = assignDeep<Record<string, string>>(
        {
          'Content-Type': 'application/json',
        },
        config.headers,
      );
      this.parseBody(config);

      return config;
    });
  }

  private parseUrl(config: RequestConfig): string {
    let url: string = (config.origin ?? '') + config.url;

    if (config.method === 'GET') {
      url += (/\?/.test(url) ? '&' : '?') + paramsToString(config.payload);
    }
    return url;
  }

  private parseBody(config: RequestConfig): RequestConfig {
    const { body, method, payload } = config;

    if (method === 'GET' || body || !payload) {
      return config;
    }
    // const has_blob = Object.entries(payload).some(([_, value]) => value instanceof Blob);

    switch (config.headers?.['Content-Type']) {
      case 'application/json':
        config.body = JSON.stringify(payload);
        break;
      case 'multipart/form-data':
        config.body = objectToFormData(payload);
        break;
    }
    return config;
  }

  public useRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  public useResponseInterceptor<T>(interceptor: ResponseInterceptor<T>): void {
    this.responseInterceptors.push(<ResponseInterceptor>interceptor);
  }

  public create(options: RequestOptions): TotteInstance {
    return createInstance(new Totte(options));
  }

  public async request<T>(config: RequestConfig): Promise<Result<T>>;
  public async request<T>(url: string, config?: Omit<RequestConfig, 'url'>): Promise<Result<T>>;
  public async request<T>(
    init: string | RequestConfig,
    config?: Omit<RequestConfig, 'url'>,
  ): Promise<Result<T>> {
    const defaultConfig = cloneDeep(this.options) as RequestConfig;

    switch (typeof init) {
      case 'string':
        assignDeep(defaultConfig, { url: init }, config);
        break;
      case 'object':
        assignDeep(defaultConfig, init);
        break;
      default:
        throw new TotteError('Invalid arguments');
    }
    const req_interceptor_count = this.requestInterceptors.length;

    for (let index = 0; index < req_interceptor_count; index++) {
      const interceptor = this.requestInterceptors[index];
      assignDeep(defaultConfig, await interceptor(defaultConfig));
    }
    const url = this.parseUrl(defaultConfig);
    const response = await fetch(url, defaultConfig);
    const result: Result = {
      data: null,
      status: response.status,
      config: defaultConfig,
      statusText: response.statusText,
      headers: response.headers,
    };

    try {
      switch (defaultConfig.responseType) {
        case 'arraybuffer':
          result.data = await response.arrayBuffer();
          break;
        case 'blob':
          result.data = await response.blob();
          break;
        case 'formData':
          result.data = await response.formData();
          break;
        case 'json':
          result.data = await response.json();
          break;
        case 'text':
          result.data = await response.text();
          break;
      }
    } catch (error) {
      if (!response.ok) {
        throw new TotteError(parseError(error));
      }
    }
    const res_interceptor_count = this.responseInterceptors.length;

    for (let index = 0; index < res_interceptor_count; index++) {
      const interceptor = this.responseInterceptors[index];
      const ripeData = await interceptor(result);

      if (!ripeData) {
        continue;
      }
      result.data = ripeData;
    }
    return <Result<T>>result;
  }

  public get<T>(
    url: string,
    payload?: object | null,
    options: RequestOptions = {},
  ): Promise<Result<T>> {
    return this.request<T>({
      url,
      method: 'GET',
      payload,
      ...options,
    });
  }

  public delete<T>(
    url: string,
    payload?: object | null,
    options: RequestOptions = {},
  ): Promise<Result<T>> {
    return this.request<T>({
      url,
      method: 'DELETE',
      payload,
      ...options,
    });
  }

  public head<T>(
    url: string,
    payload?: object | null,
    options: RequestOptions = {},
  ): Promise<Result<T>> {
    return this.request<T>({
      url,
      method: 'HEAD',
      payload,
      ...options,
    });
  }

  public post<T>(
    url: string,
    payload?: object | null,
    options: RequestOptions = {},
  ): Promise<Result<T>> {
    return this.request<T>({
      url,
      method: 'POST',
      payload,
      ...options,
    });
  }

  public put<T>(
    url: string,
    payload?: object | null,
    options: RequestOptions = {},
  ): Promise<Result<T>> {
    return this.request<T>({
      url,
      method: 'PUT',
      payload,
      ...options,
    });
  }

  public patch<T>(
    url: string,
    payload?: object | null,
    options: RequestOptions = {},
  ): Promise<Result<T>> {
    return this.request<T>({
      url,
      method: 'PATCH',
      payload,
      ...options,
    });
  }
}

interface TotteInstance extends Totte {
  (...args: Parameters<Totte['request']>): ReturnType<Totte['request']>;
}

function createInstance(context: Totte): TotteInstance {
  const instance = Totte.prototype.request.bind(context);
  const keys = <Array<keyof Totte>>Object.getOwnPropertyNames(Totte.prototype);

  for (const key of keys) {
    Reflect.set(instance, key, context[key].bind(context));
  }
  return instance as unknown as TotteInstance;
}

const context = new Totte();
const totte = createInstance(context);

export default totte;
