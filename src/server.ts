import { createServer } from 'http';
import * as path from 'path';

import express from 'express';
import { ParseServer } from 'parse-server';

type ServerOption = {
  readonly databaseUri: string;
  readonly port: number;
  readonly masterKey: string;
  readonly appId: string;
  readonly serverUrl: string;
};

function start(opt: ServerOption) {
  return new Promise((resolve) => {
    const api = new ParseServer({
      databaseURI: opt.databaseUri,
      cloud: './build/main/cloud/main.js',
      appId: opt.appId,
      masterKey: opt.masterKey,
      serverURL: opt.serverUrl, // Don't forget to change to https if needed
      liveQuery: {
        classNames: ['Posts', 'Comments'], // List of classes to support for query subscriptions
      },
      // FIXME: security
      allowClientClassCreation: true,
    });
    // Client-keys like the javascript key or the .NET key are not necessary with parse-server
    // If you wish you require them, you can set them as options in the initialization above:
    // javascriptKey, restAPIKey, dotNetKey, clientKey
    const app = express();

    // Serve static assets from the /public folder
    // app.use('/public', express.static(path.join(__dirname, '/public')));

    // Serve the Parse API on the /parse URL prefix
    app.use('/parse', api);

    // Parse Server plays nicely with the rest of your web routes
    app.get('/', function (_, res) {
      res
        .status(200)
        .send(
          'I dream of being a website.  Please star the parse-server repo on GitHub!'
        );
    });

    const httpServer = createServer(app);
    httpServer.listen(opt.port, function () {
      console.log(`parse-server-example running on port ${opt.port}.`);
      // This will enable the Live Query real-time server
      ParseServer.createLiveQueryServer(httpServer);
      resolve(httpServer);
    });
  });
}

export default { start };
