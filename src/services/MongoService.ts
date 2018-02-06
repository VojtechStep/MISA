import IBaseService from './IBaseService';
import { User } from '../models/User';

export default class MongoService<TMetadata> implements IBaseService<TMetadata> {
  addUser(/* user: User<TMetadata> */): void {
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
  getUser(/* userPattern: User<TMetadata> */): User<TMetadata> | undefined {
    throw new Error('Method not implemented.');
  }
  getUsers(/* userPattern: User<TMetadata> */): User<TMetadata>[] {
    throw new Error('Method not implemented.');
  }
}
