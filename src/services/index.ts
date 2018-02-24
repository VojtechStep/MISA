import { User } from '../models/User';

/* tslint:disable only-arrow-functions */

export interface IService<T extends User> {
  add(user: T, ...params: any[]): MaybeAsync<T>;
  delete(...params: any[]): MaybeAsync<T>;
  update(...params: any[]): MaybeAsync<T>;
  get(...params: any[]): MaybeAsync<T | undefined>;
}

function isOverriden<V extends User, T extends IService<V>, U extends BaseService<V, T>>(
  target: T & U,
  prop: keyof T | keyof U
): prop is keyof U {
  return prop in target;
}

export abstract class BaseService<U extends User, T extends IService<U>> implements IService<U> {
  constructor(protected readonly origin: T) {}

  static wrap<V extends User, T extends BaseService<V, U>, U extends IService<V>>(
    this: { new (origin: U, ...constructorArgs: any[]): T },
    origin: U,
    ...constructorArgs: any[]
  ): T & U {
    return new Proxy<T & U>(new this(origin, constructorArgs) as T & U, {
      get(target: T & U, prop: keyof T | keyof U): T[keyof T] | U[keyof U] {
        if (isOverriden<V, U, T>(target, prop)) return target[prop];

        return target.origin[prop];
      },
    });
  }

  add(user: U, ...params: any[]): any {
    return this.origin.add(user, ...params);
  }
  delete(...params: any[]): any {
    return this.origin.delete(...params);
  }
  update(...params: any[]): any {
    return this.origin.update(...params);
  }
  get(...params: any[]): any {
    return this.origin.get(...params);
  }
}
