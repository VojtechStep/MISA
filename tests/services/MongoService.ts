import genericTest, { RegisterContextual } from 'ava';
import { MongoService, User } from '../../lib';

const test = genericTest as RegisterContextual<{
  service: MongoService;
}>;

test.beforeEach('Add Mongo service', async t => {
  t.context = {
    service: await new MongoService().connect({
      dbUri: 'mongodb://localhost/testing',
    }),
  };
});

test('Add user', async t => {
  const service = t.context.service;
  await t.throws(service.add(new User('vojtechstepancik@outlook.com', 'Vojtech Stepancik')));
});
