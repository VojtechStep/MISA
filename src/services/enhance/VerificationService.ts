import { IService, BaseService } from '..';
import { User } from '../../models/User';

export type VerifiableUser = User & {
  verificationCode?: string;
  verified: boolean;
};

export class VerificationService<U extends User & VerifiableUser, T extends IService<U>> extends BaseService<U, T> {
  async verify(...parameters: any[]): Promise<void> {
    const user: VerifiableUser = await (this.get(...parameters) as Promise<VerifiableUser>);
    user.verificationCode = undefined;
    user.verified = true;
    this.update(user);
  }
}
