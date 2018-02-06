import genericTest, { RegisterContextual } from 'ava';
import { User } from '../lib/index';

const test: RegisterContextual<{
  userData: {
    name: string;
    email: string;
  };
}> = genericTest;

test.beforeEach('Set user info', t => {
  t.context = {
    userData: {
      name: 'Vojtech Stepancik',
      email: 'vojtechstepancik@outlook.com',
    },
  };
});

test('User created', t => {
  const { email, name } = t.context.userData;
  const user = new User(email, name);
  t.is(user.email, email);
  t.is(user.name, name);
});
