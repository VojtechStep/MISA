import generalTest, { RegisterContextual } from 'ava';
import DBMemoryServer from 'mongodb-memory-server';
import { BaseService, IService, User, MongoService } from '../../lib';

const sampleUser: User = {
  name: 'Vojtech Stepancik',
  email: 'vojtechstepancik@outlook.com',
};

const test = generalTest as RegisterContextual<{
  mongo: {
    stop(): void;
    getConnectionString(): Promise<string>;
  };
  service: IService<User>;
}>;

class TransparentService extends BaseService<User, IService<User>> {}

test.beforeEach('Setup service', async t => {
  const mongo = new DBMemoryServer();
  const service = TransparentService.wrap(
    await new MongoService({
      dbUri: await mongo.getConnectionString(),
    }).connect()
  );
  t.context = {
    mongo,
    service,
  };
});

test('Add is passed through', async t => {
  const service = t.context.service as MongoService;

  const addPromise = service.add(sampleUser);
  await t.notThrows(addPromise);
  const user = await addPromise;
  t.true('_id' in user);
});

test('Get is passed through', async t => {
  const service = t.context.service as MongoService;
  const user = await service.add(sampleUser);

  const getPromise = service.get(user._id);
  await t.notThrows(getPromise);
  const obtained = await getPromise;
  t.deepEqual(user, obtained);
});

test('Delete is passed through', async t => {
  const service = t.context.service as MongoService;
  const user = await service.add(sampleUser);

  const deletePromise = service.delete(user._id);
  await t.notThrows(deletePromise);
  const deleted = await deletePromise;
  t.deepEqual(user, deleted);
  t.is(await service.count(), 0);
});

test('Update is passed through', async t => {
  const service = t.context.service as MongoService;
  const user = await service.add(sampleUser);

  const updatePromise = service.update(user._id, {
    name: 'Tony Stark',
  });
  await t.notThrows(updatePromise);
  const updated = await updatePromise;
  const obtained = await service.get(user._id);
  t.deepEqual(obtained, updated);
});

test.afterEach.always('Disconnect service', async t => {
  await (t.context.service as MongoService).close();
  t.context.mongo.stop();
});
