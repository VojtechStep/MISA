import { IBaseService } from './IBaseService';
import { User } from '../models/User';
import { MongoClient, MongoClientOptions } from 'mongodb';
import { InvalidOperationError } from 'node-common-errors';

export class MongoService<TMetadata> implements IBaseService<TMetadata> {
  private client?: MongoClient;
  private dbUri?: string;
  constructor(dbUri?: string) {
    this.dbUri = dbUri;
  }
  async connect(dbUri?: string, options?: MongoClientOptions): Promise<MongoService<TMetadata>> {
    if (dbUri) this.dbUri = dbUri;
    if (!this.dbUri) {
      throw new InvalidOperationError(
        'No database URI provided. Pass one to either the constructor or the `connect` function'
      );
    }
    this.client = await MongoClient.connect(this.dbUri, options);

    return this;
  }
  isConnected(db: string): boolean {
    return !!(this.client && this.client.isConnected(db));
  }
  async addUser(/* user: User<TMetadata> */): Promise<void> {
    throw new Error('Method not implemented.');
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
