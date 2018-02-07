import { User } from '../models/User';

export interface IBaseService<TMetadata = {}> {
  // Mutation
  addUser(user: User<TMetadata>): MaybeAsync<void>;
  verify(user: User<TMetadata>): MaybeAsync<void>;
  changePassword(user: User<TMetadata>): MaybeAsync<void>;
  delete(user: User<TMetadata>): MaybeAsync<void>;
  // Checks
  exists(user: User<TMetadata>): MaybeAsync<boolean>;
  isVerified(user: User<TMetadata>): MaybeAsync<boolean>;

  // Queries
  getUser(userPattern: User<TMetadata>): MaybeAsync<User<TMetadata> | undefined>;
  getUsers(userPattern: User<TMetadata>): MaybeAsync<User<TMetadata>[]>;
}
