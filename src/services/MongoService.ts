import { IBaseService } from './IBaseService';
import { User } from '../models/User';
import { MongoClient, MongoClientOptions, Db, InsertOneWriteOpResult } from 'mongodb';
import { InvalidOperationError, ArgumentError } from 'common-errors';

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

export class MongoService<TMetadata> implements IBaseService<TMetadata> {
  private static readonly dbNameExtractionRegex = /[\d\w](?:\/(?:([\d\w]+)(?:\?[\d\w]+=[\d\w]+(?:&[\d\w]+=[\d\w]+)*)?)?)?$/;
  static readonly DEFAULT_COLLECTION_NAME = 'users';
  private readonly options: MongoServiceConnectionOptions = {};
  private client?: MongoClient;
  private db?: Db;

  constructor(options?: MongoServiceConnectionOptions) {
    this.options = options || {};
  }
  async connect(
    serviceOptions?: MongoServiceConnectionOptions,
    clientOptions?: MongoClientOptions
  ): Promise<MongoService<TMetadata>> {
    if (serviceOptions) {
      let serviceOptionKey: keyof MongoServiceConnectionOptions;
      for (serviceOptionKey in serviceOptions) {
        if (!serviceOptions.hasOwnProperty(serviceOptionKey)) continue;
        this.options[serviceOptionKey] = serviceOptions[serviceOptionKey];
      }
    }
    if (!this.options.dbUri) {
      // tslint:disable-next-line
      throw new ArgumentError(MongoServiceErrors.NO_DB_URI.toString());
    }
    if (!this.options.dbName) {
      const [, extracted] = this.options.dbUri.match(MongoService.dbNameExtractionRegex) as string[];
      if (extracted) this.options.dbName = extracted;
    }
    if (!this.options.dbName) {
      // tslint:disable-next-line
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
  async addUser(user: User<TMetadata>): Promise<void> {
    console.log(user);
    if (!this.isConnected()) {
      throw new InvalidOperationError(MongoServiceErrors.NOT_CONNNECTED.toString());
    }
    try {
      const result: InsertOneWriteOpResult = await this.db!.collection(this.options.collectionName!).insertOne(user);
      console.log(result);
    } catch (err) {
      console.log(err);
    }
  }
  verify(/* user: User<TMetadata> */): void {
    throw new Error('Method not implemented.');
  }
  changePassword(/* user: User<TMetadata> */): void {
    throw new Error('Method not implemented.');
  }
  delete(/* user: User<TMetadata> */): void {
    throw new Error('Method not implemented.');
  }
  exists(/* user: User<TMetadata> */): boolean {
    throw new Error('Method not implemented.');
  }
  isVerified(/* user: User<TMetadata> */): boolean {
    throw new Error('Method not implemented.');
  }
  async getUser(/* userPattern: User<TMetadata> */): Promise<User<TMetadata> | undefined> {
    throw new Error('Method not implemented.');
  }
  getUsers(/* userPattern: User<TMetadata> */): User<TMetadata>[] {
    throw new Error('Method not implemented.');
  }
}
