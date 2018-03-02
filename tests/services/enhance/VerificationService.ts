import genericTest, { RegisterContextual } from 'ava';
import DBMemoryServer from 'mongodb-memory-server';
import { IService, VerifiableUser, User, VerificationService, MongoService, WithId } from '../../../lib';

type AppUser = VerifiableUser & User;

const test = genericTest as RegisterContextual<{
  mongo: {
    getConnectionString(): Promise<string>;
    stop(): void;
  };
  service: MongoService<AppUser> & VerificationService<AppUser>;
}>;

test.beforeEach('Setup service', async t => {
  const mongo = new DBMemoryServer();
  const service = VerificationService.wrap(
    await new MongoService<AppUser>({
      dbUri: await mongo.getConnectionString(),
    }).connect(),
    32
  );
  t.context = {
    mongo,
    service,
  };
});

test('Added user has verification code', async t => {
  const service = t.context.service;

  const user = await service.add({
    email: 'vojtechstepancik@outlook.com',
    name: 'Vojtech Stepancik',
  });
  t.false(user.verified);
  t.truthy(user.verificationCode);
  console.log(user.verificationCode);

  const obtained = await service.get({ verificationCode: user.verificationCode });
  t.deepEqual(user, obtained);
});

test('Can verify a user', async t => {
  const service = t.context.service;

  const user = await service.add({
    email: 'vojtechstepancik@outlook.com',
    name: 'Vojtech Stepancik',
  });
  const verified = await service.verify({ verificationCode: user.verificationCode });
  t.notDeepEqual(user, verified);

  const byDeletedCode = await service.get({ verificationCode: user.verificationCode });
  t.falsy(byDeletedCode);
});

test.afterEach.always('Disconnect service', async t => {
  await t.context.service.close();
  t.context.mongo.stop();
});
