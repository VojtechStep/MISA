import { randomBytes } from 'crypto';
import { ArgumentError } from 'common-errors';
import { IService, BaseService } from '..';
import { User } from '../../models/User';

const HEX_CHARS_PER_BYTE: 2 = 2;

export interface VerifiableUser {
  verificationCode?: string;
  verified: boolean;
}

export class VerificationService<
  U extends User & VerifiableUser = User & VerifiableUser
> extends BaseService<U> {
  constructor(origin: IService<U>, private readonly codeStringLength: number) {
    super(origin);
    if (!codeStringLength) {
      throw new ArgumentError('Verification code length must be provided and greater than 0');
    }
  }
  async verify(identifier: any, ...parameters: any[]): Promise<U> {
    const user: VerifiableUser = await (this.get(identifier, ...parameters) as Promise<VerifiableUser>);
    user.verificationCode = undefined;
    user.verified = true;

    return this.update(identifier, user) as U;
  }
  async add(user: User, ...params: any[]): Promise<U> {
    const newUser: User & VerifiableUser = { verified: false, ...user };

    if (!newUser.verified) {
      const code: string = (await new Promise<Buffer>((resolve, reject) => {
        randomBytes(this.codeStringLength / HEX_CHARS_PER_BYTE, (err, buf) => {
          if (err) reject(err);
          resolve(buf);
        });
      })).toString('hex');
      newUser.verificationCode = code;
    }

    return this.origin.add(newUser as U, ...params);
  }
}
