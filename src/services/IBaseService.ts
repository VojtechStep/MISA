import { User } from '../models/User';

export default interface IBaseService<TMetadata> {
  // Mutation
  addUser(user: User<TMetadata>): void;
  verify(user: User<TMetadata>): void;
  changePassword(user: User<TMetadata>): void;
  delete(user: User<TMetadata>): void;
  // Checks
  exists(user: User<TMetadata>): boolean;
  isVerified(user: User<TMetadata>): boolean;

  // Queries
  getUser(userPattern: User<TMetadata>): User<TMetadata> | undefined;
  getUsers(userPattern: User<TMetadata>): User<TMetadata>[];
};
