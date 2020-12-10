import server from './server';

// cspell:disable-next
const mongo_user = 'openbaas';
// cspell:disable-next
const mongo_pwd = 'openbaas';
const mongo_db = 'dev';
const port = 1337;

server.start({
  databaseUri: `mongodb://${mongo_user}:${mongo_pwd}@localhost:27017/${mongo_db}`,
  port,
  masterKey: process.env.MASTER_KEY || '',
  appId: 'myAppId',
  serverUrl: `http://localhost:${port}/parse`,
});
