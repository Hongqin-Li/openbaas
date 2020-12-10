import test from 'ava';

import { pretest } from '../test';

pretest();

test('hello', async (t) => {
  const params = { arg1: 'arg1', arg2: 'arg2' };
  const res = await Parse.Cloud.run('hello', params);
  t.true(res.arg1 === 'arg1' && res.arg2 == 'arg2');
});
