import { parseError } from '@/utils';

interface Config extends RequestInit {
  url: string;
  origin?: string;
  method?: Method;
  responseType?: ResponseType;
}

type Method = 'GET' | 'DELETE' | 'HEAD' | 'POST' | 'PUT' | 'PATCH';
type ResponseType = 'arraybuffer' | 'blob' | 'json' | 'text' | 'formData';

interface Result<T = unknown> {
  data: T;
  /** 请求配置项 */
  config: Config;
  /** 响应状态码 */
  status: number;
  /** 状态码消息 */
  statusText: string;
  /** 请求头 */
  headers: Headers;
}

export class TotteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TotteError';
  }
}

class Totte {
  constructor() {}

  async request<T>(config: Config): Promise<Result<T>> {
    config.method ??= 'GET';
    config.responseType ??= 'json';

    const url = (config.origin ?? '') + config.url;
    const response = await fetch(url, config);
    const result: Result = {
      data: null,
      status: response.status,
      config,
      statusText: response.statusText,
      headers: response.headers,
    };

    try {
      switch (config.responseType) {
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
    return <Result<T>>result;
  }
  async get() {}
  async delete() {}
  async head() {}
  async post() {}
  async put() {}
  async patch() {}
}

interface TotteInstance extends Totte {
  (...args: Parameters<Totte['request']>): ReturnType<Totte['request']>;
}

function createInstance(): TotteInstance {
  const context = new Totte();
  const instance = Totte.prototype.request.bind(context);
  const keys = <Array<keyof Totte>>Object.getOwnPropertyNames(Totte.prototype);

  for (const key of keys) {
    Reflect.set(instance, key, context[key]);
  }
  return <TotteInstance>instance;
}

const totte = createInstance();

export default totte;
