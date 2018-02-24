import genericTest, { RegisterContextual } from 'ava';
import DBMemoryServer from 'mongodb-memory-server';
import { MongoService, User } from '../../../lib';

const sampleUser: User = {
  name: 'Vojtech Stepancik',
  email: 'vojtechstepancik@outlook.com',
};

const sampleUserDelta: Partial<User> = {
  name: 'Tony Stark',
};

const sampleUserDeltaFull: Partial<User> = {
  name: 'Tony Stark',
  email: 'tonyboi@starkindustries.com',
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
  const addPromise = service.add(sampleUser);

  await t.notThrows(addPromise);
  const user = await addPromise;
  t.true('_id' in user);
  t.is(await service.count(), 1);
});

test('Get user by Id', async t => {
  const service = t.context.service;
  const user = await service.add(sampleUser);

  const getPromise = service.get(user._id);
  await t.notThrows(getPromise);
  const obtained = await getPromise;
  t.deepEqual(user, obtained);
});

test('Get user by instance', async t => {
  const service = t.context.service;
  const user = await service.add(sampleUser);

  const getPromise = service.get(user);
  await t.notThrows(getPromise);
  const obtained = await getPromise;
  t.deepEqual(user, obtained);
});

test('Get user by property', async t => {
  const service = t.context.service;
  const user = await service.add(sampleUser);

  const getPromise = service.get(sampleUser);
  await t.notThrows(getPromise);
  const obtained = await getPromise;
  t.deepEqual(user, obtained);
});

test('Get non existing user', async t => {
  const service = t.context.service;

  const getPromise = service.get({});
  await t.notThrows(getPromise);
  const obtained = await getPromise;
  t.is(obtained, undefined);
});

test('Delete user by Id', async t => {
  const service = t.context.service;
  const user = await service.add(sampleUser);

  t.is(await service.count(), 1);
  const deletePromise = service.delete(user._id);
  await t.notThrows(deletePromise);
  const deleted = await deletePromise;
  t.is(await service.count(), 0);
  t.deepEqual(user, deleted);
});

test('Delete user by instance', async t => {
  const service = t.context.service;
  const user = await service.add(sampleUser);

  const deletePromise = service.delete(user);
  await t.notThrows(deletePromise);
  const deleted = await deletePromise;
  t.is(await service.count(), 0);
  t.deepEqual(user, deleted);
});

test('Delete user by property', async t => {
  const service = t.context.service;
  const user = await service.add(sampleUser);

  const deletePromise = service.delete(sampleUser);
  await t.notThrows(deletePromise);
  const deleted = await deletePromise;
  t.is(await service.count(), 0);
  t.deepEqual(user, deleted);
});

test('Update user by Id', async t => {
  const service = t.context.service;
  const user = await service.add(sampleUser);

  const updatePromise = service.update(user._id, sampleUserDelta);
  await t.notThrows(updatePromise);
  const updated = await updatePromise;
  const obtained = await service.get(user._id);
  t.deepEqual(obtained, updated);
});

test('Update user by instance', async t => {
  const service = t.context.service;
  const user = await service.add(sampleUser);

  const updatePromise = service.update(user, sampleUserDelta);
  await t.notThrows(updatePromise);
  const updated = await updatePromise;
  const obtained = await service.get(user._id);
  t.deepEqual(obtained, updated);
});

test('Update user by property', async t => {
  const service = t.context.service;
  const user = await service.add(sampleUser);

  const updatePromise = service.update(sampleUser, sampleUserDelta);
  await t.notThrows(updatePromise);
  const updated = await updatePromise;
  const obtained = await service.get(user._id);
  t.deepEqual(obtained, updated);
});

test('Update multiple properties', async t => {
  const service = t.context.service;
  const user = await service.add(sampleUser);

  const updatePromise = service.update(sampleUser, sampleUserDeltaFull);
  await t.notThrows(updatePromise);
  const updated = await updatePromise;
  const obtained = await service.get(user._id);
  t.deepEqual(obtained, updated);
});

test('Remove a property', async t => {
  const service = t.context.service;
  const user = await service.add(sampleUser);

  const updatePromise = service.update(sampleUser, {
    email: undefined,
  });
  await t.notThrows(updatePromise);
  const updated = await updatePromise;
  const obtained = await service.get(user._id);
  t.deepEqual(obtained, updated);
});

test('Remove multiple properties', async t => {
  const service = t.context.service;
  const user = await service.add(sampleUser);

  const updatePromise = service.update(sampleUser, {
    email: undefined,
    name: undefined,
  });
  await t.notThrows(updatePromise);
  const updated = await updatePromise;
  const obtained = await service.get(user._id);
  t.deepEqual(obtained, updated);
});

test.afterEach.always('Disconnect service', async t => {
  await t.context.service.close();
  t.context.mongo.stop();
});
