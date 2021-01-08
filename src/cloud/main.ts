/* eslint-disable functional/no-throw-statement */

import logger from '../logger';

import { deployMyPageByUrl, getPageUrlByUserId } from './page';
import { beforeSavePrivate } from './utils';

// import * as Parse from 'parse/node';

Parse.Cloud.define('hello', function (req: Parse.Cloud.FunctionRequest) {
  return req.params;
});

// Pages
Parse.Cloud.beforeSave('UserPage', beforeSavePrivate); // FIXME: no used now
Parse.Cloud.define('page-url', getPageUrlByUserId);
Parse.Cloud.define('deploy-page', deployMyPageByUrl);

// Common setup
Parse.Cloud.beforeSaveFile(async (req) => {
  const { file, user } = req;
  if (!user) {
    throw new Parse.Error(400, 'Please login first');
  }
  file.setMetadata({ name: file.name(), createdBy: user.id });
  return file;
});

Parse.Cloud.afterSaveFile(async (req) => {
  const { file, fileSize, user } = req;
  const obj = new Parse.Object('UserFile');
  obj.set('file', file);
  obj.set('fileName', file.metadata().name);
  obj.set('fileSize', fileSize);
  obj.set('createdBy', user.id);
  const token = { sessionToken: user.getSessionToken() };
  await obj.save(null, token);
  logger.info('save file by user:', user);
});

// Parse.Cloud.beforeDeleteFile(async (req) => {
//   logger.info('before delete file', req.file.name());
//   // throw new Parse.Error(400, "refused");
// });

Parse.Cloud.define('delete-page', async (req) => {
  const { pageId } = req.params;
  const user = req.user;
  if (!user) {
    throw new Parse.Error(400, 'Please login first');
  }
  logger.info('delete file by page id', pageId);
  const query = new Parse.Query(Parse.Object.extend('UserFile'));
  // Should provide session token since the ACL is set to per-user R/W.
  const sessionToken = user.getSessionToken();
  const obj = await query.get(pageId, { sessionToken });

  logger.info('page created by', obj.get('createdBy'));
  if (obj.get('createdBy') !== user.id) {
    throw new Parse.Error(400, 'Unable to delete pages of other users');
  }

  const url = `${Parse.serverURL}/files/${obj.get('file')._name}`;
  logger.info('get by query', url);
  try {
    await Parse.Cloud.httpRequest({
      url,
      method: 'DELETE',
      headers: {
        'X-Parse-Master-Key': Parse.masterKey,
        'X-Parse-Application-Id': Parse.applicationId,
      },
    });
  } catch (err) {
    logger.warn('delete file error', err);
  }
  logger.info('delete page file finished');
  await obj.destroy({ sessionToken });
  logger.info('delete PageObject finished');
});

// Functions
Parse.Cloud.beforeSave('UserFunction', beforeSavePrivate);
