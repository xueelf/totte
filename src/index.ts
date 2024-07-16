export interface RequestConfig extends RequestInit {
  method: Method;
  url: string;
  origin?: string;
}

type Method = 'GET' | 'DELETE' | 'HEAD' | 'POST' | 'PUT' | 'PATCH';

class Totte {
  constructor() {}

  async request(config: RequestConfig) {}
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
  const instance = context.request.bind<TotteInstance>(context);
  const keys = <Array<keyof Totte>>Object.getOwnPropertyNames(Totte.prototype);

  for (const key of keys) {
    instance[key] = context[key].bind(context);
  }
  return instance;
}

export default createInstance();
