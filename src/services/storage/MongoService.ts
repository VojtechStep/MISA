import { User } from '../../models/User';
import { MongoClient, MongoClientOptions, Db } from 'mongodb';
import { ArgumentError } from 'common-errors';
import { IService } from '..';

export type MongoServiceConnectionOptions = {
  dbUri?: string;
  dbName?: string;
  collectionName?: string;
};

export enum MongoServiceErrors {
  NO_DB_URI,
  NO_DB_NAME,
  NOT_CONNNECTED,
}

export class MongoService<T extends User = User> implements IService<T> {
  private static readonly dbNameExtractionRegex = /[\d\w](?:\/(?:([\d\w]+)(?:\?[\d\w]+=[\d\w]+(?:&[\d\w]+=[\d\w]+)*)?)?)?$/;
  static readonly DEFAULT_COLLECTION_NAME = 'users';
  private readonly options: MongoServiceConnectionOptions = {};
  private client?: MongoClient;
  private db?: Db;

  constructor(options?: MongoServiceConnectionOptions) {
    this.options = options || {};
  }
  getDb(): Db {
    return this.db!;
  }
  async connect(
    serviceOptions?: MongoServiceConnectionOptions,
    clientOptions?: MongoClientOptions
  ): Promise<MongoService<T>> {
    if (serviceOptions) {
      let serviceOptionKey: keyof MongoServiceConnectionOptions;
      for (serviceOptionKey in serviceOptions) {
        if (!serviceOptions.hasOwnProperty(serviceOptionKey)) continue;
        this.options[serviceOptionKey] = serviceOptions[serviceOptionKey];
      }
    }
    if (!this.options.dbUri) {
      // tslint:disable-next-line no-unsafe-any
      throw new ArgumentError(MongoServiceErrors.NO_DB_URI.toString());
    }
    if (!this.options.dbName) {
      const [, extracted] = this.options.dbUri.match(MongoService.dbNameExtractionRegex) as string[];
      if (extracted) this.options.dbName = extracted;
    }
    if (!this.options.dbName) {
      // tslint:disable-next-line no-unsafe-any
      throw new ArgumentError(MongoServiceErrors.NO_DB_NAME.toString());
    }
    if (!this.options.collectionName) this.options.collectionName = MongoService.DEFAULT_COLLECTION_NAME;

    this.client = await MongoClient.connect(this.options.dbUri, clientOptions);
    this.db = this.client.db(this.options.dbName);

    return this;
  }
  isConnected(dbName?: string): boolean {
    const targetDbName: string | undefined = dbName || this.options.dbName;
    if (!targetDbName || !this.client) {
      return false;
    }

    return this.client.isConnected(targetDbName);
  }
  getDbName(): string | undefined {
    return this.options.dbName;
  }
  getCollectionName(): string | undefined {
    return this.options.collectionName;
  }
  async add(user: User): Promise<T> {
    console.log(user);
    throw new Error('Method not implemented.');
  }
  delete(/* user: User<TMetadata> */): MaybeAsync<T> {
    throw new Error('Method not implemented.');
  }
  update(/* user: User<TMetadata> */): MaybeAsync<T> {
    throw new Error('Method not implemented.');
  }
  get(/* userPattern: User<TMetadata> */): MaybeAsync<T | undefined> {
    throw new Error('Method not implemented.');
  }
}
