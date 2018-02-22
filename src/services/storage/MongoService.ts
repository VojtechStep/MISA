import { User } from '../../models/User';
import {
  MongoClient,
  MongoClientOptions,
  Db,
  ObjectId,
  InsertOneWriteOpResult,
  Collection,
  FindAndModifyWriteOpResultObject,
} from 'mongodb';
import { ArgumentError, InvalidOperationError, MongoError } from 'common-errors';
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

export type WithId<T = {}> = T & { _id: ObjectId };

export class MongoService<T extends User = User> implements IService<T> {
  private static readonly dbNameExtractionRegex = /[\d\w](?:\/(?:([\d-\w]+)(?:\?[\d\w]+=[\d\w]+(?:&[\d\w]+=[\d\w]+)*)?)?)?$/;
  static readonly DEFAULT_COLLECTION_NAME = 'users';
  private readonly options: MongoServiceConnectionOptions = {};
  private client?: MongoClient;
  private db?: Db;

  constructor(options?: MongoServiceConnectionOptions) {
    this.options = options || {};
  }
  isConnected(): boolean {
    return !!this.db;
  }
  throwIfNotConnected(): void {
    // tslint:disable-next-line no-unsafe-any
    if (!this.isConnected()) throw new InvalidOperationError('DB is not connected');
  }
  getDbName(): string | undefined {
    return this.options.dbName;
  }
  getCollectionName(): string | undefined {
    return this.options.collectionName;
  }
  private getCollection(): Collection {
    this.throwIfNotConnected();

    return this.db!.collection(this.getCollectionName()!);
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
  async close(): Promise<void> {
    if (this.client) await this.client.close();
    this.client = undefined;
    this.db = undefined;
  }
  throwIfNotOk(result: { ok?: number }, reason: string): void {
    // tslint:disable-next-line no-unsafe-any
    if (!result.ok) throw new MongoError(reason, result);
  }
  async add(user: T): Promise<WithId<T>> {
    const result: InsertOneWriteOpResult = await this.getCollection().insertOne(Object.assign({}, user));
    this.throwIfNotOk(result.result, 'Insert failed');

    return result.ops[0] as WithId<T>;
  }
  async delete(needle: ObjectId | WithId | Object): Promise<T> {
    const result: FindAndModifyWriteOpResultObject = await this.getCollection().findOneAndDelete(
      needle instanceof ObjectId ? { _id: needle } : '_id' in needle ? { _id: needle._id } : needle
    );
    this.throwIfNotOk(result, 'Delete failed');

    return result.value as T;
  }
  update(/* user: User<TMetadata> */): MaybeAsync<T> {
    throw new Error('Method not implemented.');
  }
  get(/* userPattern: User<TMetadata> */): MaybeAsync<T | undefined> {
    throw new Error('Method not implemented.');
  }
  async count(needle: Object = {}): Promise<number> {
    return this.getCollection().count(needle);
  }
}
