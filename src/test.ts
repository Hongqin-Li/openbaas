import test from 'ava';
import { MongoDBServer } from 'mongomem';

import server from './server';

export function pretest() {
  test.before('start server', async (t) => {
    await MongoDBServer.start();
    const databaseUri = await MongoDBServer.getConnectionString();
    t.log(`database uri: ${databaseUri}`);
    const masterKey = '';
    const appId = 'myapp';
    const port = 1338;
    const serverUrl = `http://localhost:${port}/parse`;

    await server.start({
      databaseUri,
      appId,
      masterKey,
      port,
      serverUrl,
    });
    Parse.initialize(appId, '', masterKey);
    // eslint-disable-next-line functional/immutable-data
    Parse.serverURL = serverUrl;
  });

  test.after.always('cleanup', (t) => {
    t.log('after clean up');
    MongoDBServer.tearDown(); // Cleans up temporary file storage
  });
}
