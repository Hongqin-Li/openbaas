import { createServer } from 'http';
import * as path from 'path';

import express from 'express';
import { ParseServer } from 'parse-server';

const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

// cspell:disable-next
const mongo_user = 'openbaas';
// cspell:disable-next
const mongo_pwd = 'openbaas';
const mongo_db = 'dev';

const api = new ParseServer({
  databaseURI:
    databaseUri ||
    `mongodb://${mongo_user}:${mongo_pwd}@localhost:27017/${mongo_db}`,
  cloud:
    process.env.CLOUD_CODE_MAIN || path.resolve(__dirname, './cloud/main.js'),
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse', // Don't forget to change to https if needed
  liveQuery: {
    classNames: ['Posts', 'Comments'], // List of classes to support for query subscriptions
  },
  allowClientClassCreation: false,
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

const app = express();

// Serve static assets from the /public folder
// app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
const mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function (_, res) {
  res
    .status(200)
    .send(
      'I dream of being a website.  Please star the parse-server repo on GitHub!'
    );
});

const port = process.env.PORT || 1337;
const httpServer = createServer(app);
httpServer.listen(port, function () {
  console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
