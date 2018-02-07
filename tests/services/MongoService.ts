import generalTest, { RegisterContextual } from 'ava';
import DBMemoryServer from 'mongodb-memory-server';
import { MongoService } from '../../lib';

interface UserMetadata {}

const test = generalTest as RegisterContextual<{
  mongo: {
    getConnectionString(db?: string): Promise<string>;
    stop(): void;
  };
  userService?: MongoService<UserMetadata>;
}>;

test.beforeEach('Start in-memory mongod', t => {
  t.context = {
    mongo: new DBMemoryServer(),
  };
});

test.beforeEach('Connect service to MongoDB instance', async t => {
  const uri = await t.context.mongo.getConnectionString();
  t.context.userService = await new MongoService(uri).connect();
});

test('Get connection', async t => {
  t.true(t.context.userService!.isConnected(''));
});

test.todo('Create user');
test.todo('Update user');
test.todo('Delete user');

test.afterEach.always('Tear down mongo', t => {
  t.context.mongo.stop();
});
