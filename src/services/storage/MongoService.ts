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
import { ArgumentError, InvalidOperationError, data as DataErrors } from 'common-errors';
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

export type MongoUpdater = {
  $set?: {
    [prop: string]: any;
  };
  $unset?: {
    [prop: string]: true;
  };
};

export type Needle = ObjectId | WithId | Object;

export class MongoService<T extends User = User> implements IService<T> {
  private static readonly dbNameExtractionRegex = /[\d\w](?:\/(?:([\d-\w]+)(?:\?[\d\w]+=[\d\w]+(?:&[\d\w]+=[\d\w]+)*)?)?)?$/;
  static readonly DEFAULT_COLLECTION_NAME = 'users';
  private readonly options: MongoServiceConnectionOptions = {};
  private client?: MongoClient;
  private db?: Db;

  constructor(options?: MongoServiceConnectionOptions) {
    this.options = options || {};
  }
  private static parseNeedle(needle: Needle): Object {
    return needle instanceof ObjectId ? { _id: needle } : '_id' in needle ? { _id: needle._id } : needle;
  }
  static objectToUpdater(obj: Object): MongoUpdater {
    return Object.entries(obj).reduce<MongoUpdater>((acc, [key, value]) => {
      const newAcc: MongoUpdater = {};
      if (acc.$set) newAcc.$set = { ...acc.$set };
      if (acc.$unset) newAcc.$unset = { ...acc.$unset };

      if (typeof value === 'undefined') {
        if (!newAcc.$unset) newAcc.$unset = {};
        newAcc.$unset[key] = true;
      } else {
        if (!newAcc.$set) newAcc.$set = {};
        newAcc.$set[key] = value;
      }

      return newAcc;
    }, {});
  }
  isConnected(): boolean {
    return !!this.db;
  }
  throwIfNotConnected(): void {
    // tslint:disable-next-line no-unsafe-any
    if (!this.isConnected()) throw new InvalidOperationError('DB is not connected');
  }
  throwIfNotOk(result: { ok?: number }, reason: string): void {
    // tslint:disable-next-line no-unsafe-any
    if (!result.ok) throw new DataErrors.MongoDBError(reason, result);
  }
  getDbName(): string | undefined {
    return this.options.dbName;
  }
  getCollectionName(): string | undefined {
    return this.options.collectionName;
  }
  private getCollection(): Collection<WithId<T>> {
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
  async add(user: T): Promise<WithId<T>> {
    // tslint:disable-next-line prefer-object-spread
    const result: InsertOneWriteOpResult = await this.getCollection().insertOne(Object.assign({}, user));
    this.throwIfNotOk(result.result, 'Insert failed');

    return result.ops[0] as WithId<T>;
  }
  async delete(needle: Needle): Promise<WithId<T>> {
    const result: FindAndModifyWriteOpResultObject = await this.getCollection().findOneAndDelete(
      MongoService.parseNeedle(needle)
    );
    this.throwIfNotOk(result, 'Delete failed');

    return result.value as WithId<T>;
  }
  async update(needle: Needle, delta: Partial<T>): Promise<WithId<T>> {
    const result: FindAndModifyWriteOpResultObject = await this.getCollection().findOneAndUpdate(
      MongoService.parseNeedle(needle),
      MongoService.objectToUpdater(delta),
      { returnOriginal: false }
    );
    this.throwIfNotOk(result, 'Update failed');

    return result.value as WithId<T>;
  }
  async get(needle: Needle): Promise<WithId<T> | undefined> {
    const result: WithId<T> | null = await this.getCollection().findOne(MongoService.parseNeedle(needle));

    return result === null ? undefined : result;
  }
  async count(needle: Object = {}): Promise<number> {
    return this.getCollection().count(needle);
  }
}
