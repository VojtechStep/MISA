import generalTest, { RegisterContextual } from 'ava';
import DBMemoryServer from 'mongodb-memory-server';
import { MongoService, User, MongoServiceErrors } from '../../lib';
import { ArgumentError } from 'common-errors';

const dbName = 'testing';
const colName = 'userCollection';
const connectionWithDB = `mongodb://localhost/${dbName}`;
const connectionWithoutDB = 'mongodb://localhost';
const connectionInvalid = 'asdf';

const override = 'override';

interface UserMetadata {}

const test = generalTest as RegisterContextual<{
  mongo: {
    getConnectionString(db?: string): Promise<string>;
    stop(): void;
  };
}>;

test.beforeEach('Start in-memory mongod', t => {
  t.context = {
    mongo: new DBMemoryServer(),
  };
});

test('Error with no connection string', async t => {
  t.plan(5);
  const service = new MongoService();
  const error = await t.throws(service.connect());
  t.true(error instanceof ArgumentError);
  t.is(error.argumentName, MongoServiceErrors.NO_DB_URI.toString());
  t.false(service.isConnected());
  t.not(service.getDbName(), dbName);
});

test('No error with dbUri in constructor', async t => {
  t.plan(3);
  const service = new MongoService({
    dbUri: connectionWithDB,
  });
  await t.notThrows(service.connect());
  t.true(service.isConnected());
  t.is(service.getDbName(), dbName);
});

test('No error with dbUri in connect', async t => {
  t.plan(3);
  const service = new MongoService();
  await t.notThrows(
    service.connect({
      dbUri: connectionWithDB,
    })
  );
  t.true(service.isConnected());
  t.is(service.getDbName(), dbName);
});

test('Error with no dbName', async t => {
  t.plan(5);
  const service = new MongoService();
  const error = await t.throws(
    service.connect({
      dbUri: connectionWithoutDB,
    })
  );
  t.true(error instanceof ArgumentError);
  t.is(error.argumentName, MongoServiceErrors.NO_DB_NAME.toString());
  t.false(service.isConnected());
  t.not(service.getDbName(), dbName);
});

test('No error with dbName', async t => {
  t.plan(3);
  const service = new MongoService();
  await t.notThrows(
    service.connect({
      dbUri: connectionWithoutDB,
      dbName,
    })
  );
  t.true(service.isConnected());
  t.is(service.getDbName(), dbName);
});

test('Explicit dbName overrides the one in dbUri', async t => {
  t.plan(3);
  const service = new MongoService();
  await t.notThrows(
    service.connect({
      dbUri: connectionWithDB,
      dbName: override,
    })
  );
  t.true(service.isConnected());
  t.is(service.getDbName(), override);
});

test(`Default collection is '${MongoService.DEFAULT_COLLECTION_NAME}'`, async t => {
  t.plan(3);
  const service = new MongoService();
  await t.notThrows(
    service.connect({
      dbUri: connectionWithDB,
    })
  );
  t.true(service.isConnected());
  t.is(service.getCollectionName(), MongoService.DEFAULT_COLLECTION_NAME);
});

test('Can override collection name', async t => {
  t.plan(3);
  const service = new MongoService();
  await t.notThrows(
    service.connect({
      dbUri: connectionWithDB,
      collectionName: colName,
    })
  );
  t.true(service.isConnected());
  t.is(service.getCollectionName(), colName);
});

test('Connect parameters override constructor', async t => {
  t.plan(4);
  let service = new MongoService({
    dbUri: connectionWithoutDB,
    collectionName: colName,
    dbName,
  });
  await t.notThrows(
    service.connect({
      dbName: override,
      collectionName: override,
    })
  );
  t.true(service.isConnected());
  t.is(service.getDbName(), override);
  t.is(service.getCollectionName(), override);
});

test.afterEach.always('Tear down mongo', t => {
  t.context.mongo.stop();
});
