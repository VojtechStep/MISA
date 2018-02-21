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
  const returnedUser = await service.add(sampleUser);
  t.true('_id' in returnedUser);
});

test('Delete user by Id', async t => {
  const service = t.context.service;
  const returnedUser = await service.add(sampleUser);
  await t.notThrows(service.delete(returnedUser._id));
});

test.afterEach.always('Disconnect service', async t => {
  // console.log('Service', t.context.service);
  await t.context.service.close();
});

test.afterEach.always('Tear down mongo', t => {
  // console.log('Mongo', t.context.mongo);
  t.context.mongo.stop();
});
