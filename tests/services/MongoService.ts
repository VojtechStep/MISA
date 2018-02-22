import genericTest, { RegisterContextual } from 'ava';
import DBMemoryServer from 'mongodb-memory-server';
import { MongoService, User } from '../../lib';

const sampleUser: User = {
  name: 'Vojtech Stepancik',
  email: 'vojtechstepancik@outlook.com',
};

const test = genericTest as RegisterContextual<{
  service: MongoService;
  mongo: {
    getConnectionString(db?: string): Promise<string>;
    stop(): void;
  };
}>;

test.beforeEach('Add Mongo service', async t => {
  const mongo = new DBMemoryServer();
  t.context = {
    service: await new MongoService({
      dbUri: await mongo.getConnectionString(),
    }).connect(),
    mongo,
  };
});

test('Add user', async t => {
  const service = t.context.service;
  const user = await service.add(sampleUser);
  t.true('_id' in user);
  t.is(await service.count(), 1);
});

test('Delete user by Id', async t => {
  const service = t.context.service;
  const user = await service.add(sampleUser);
  t.is(await service.count(), 1);
  await t.notThrows(service.delete(user._id));
  t.is(await service.count(), 0);
});

test('Delete user by instance', async t => {
  const service = t.context.service;
  const user = await service.add(sampleUser);
  t.is(await service.count(), 1);
  await t.notThrows(service.delete(user));
  t.is(await service.count(), 0);
});

test('Delete user by property', async t => {
  const service = t.context.service;
  await service.add(sampleUser);
  t.is(await service.count(), 1);
  await t.notThrows(service.delete(sampleUser));
  t.is(await service.count(), 0);
});

test.afterEach.always('Disconnect service', async t => {
  // console.log('Service', t.context.service);
  await t.context.service.close();
});

test.afterEach.always('Tear down mongo', t => {
  // console.log('Mongo', t.context.mongo);
  t.context.mongo.stop();
});
