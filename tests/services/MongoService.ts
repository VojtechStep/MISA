import generalTest, { RegisterContextual } from 'ava';
import DBMemoryServer from 'mongodb-memory-server';

const test = generalTest as RegisterContextual<{
  mongo: {
    getConnectionString(db?: string): Promise<string>;
    stop(): void;
  };
}>;

test.beforeEach('Start in-memory mongod', async t => {
  t.context = {
    mongo: new DBMemoryServer(),
  };
});

test('Get connection', async t => {
  const db = await t.context.mongo.getConnectionString();
  t.truthy(db);
});

test.todo('Create user');
test.todo('Update user');
test.todo('Delete user');

test.afterEach.always('Tear down mongo', t => {
  t.context.mongo.stop();
});
