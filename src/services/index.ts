import { User } from '../models/User';

/* tslint:disable only-arrow-functions */

export interface IService<T extends User> {
  add(user: T, ...params: any[]): MaybeAsync<T>;
  delete(identifier: any, ...params: any[]): MaybeAsync<T>;
  update(identifier: any, ...params: any[]): MaybeAsync<T>;
  get(identifier: any, ...params: any[]): MaybeAsync<T | undefined>;
}

function isOverriden<T extends User, U extends BaseService<T>, V extends IService<T>>(
  target: U,
  prop: keyof U | keyof V
): prop is keyof U {
  return prop in target;
}

export abstract class BaseService<T extends User> implements IService<T> {
  constructor(protected readonly origin: IService<T>) {}

  static wrap<T extends User, U extends IService<T>, V extends BaseService<T>>( // User type, origin type, this type
    this: { new (origin: IService<T>, ...constructorArgs: any[]): V },
    origin: U,
    ...constructorArgs: any[]
  ): U & V {
    return new Proxy<U & V>(new this(origin, constructorArgs) as U & V, {
      get(target: U & V, prop: keyof U | keyof V): U[keyof U] | V[keyof V] {
        if (isOverriden<T, V, U>(target, prop)) return (target as V)[prop];

        return (target.origin as U)[prop];
      },
    });
  }

  add(user: T, ...params: any[]): any {
    return this.origin.add(user, ...params);
  }
  delete(identifier: any, ...params: any[]): any {
    return this.origin.delete(identifier, ...params);
  }
  update(identifier: any, ...params: any[]): any {
    return this.origin.update(identifier, ...params);
  }
  get(identifier: any, ...params: any[]): any {
    return this.origin.get(identifier, ...params);
  }
}
