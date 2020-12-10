import * as Parse from 'parse/node';

Parse.Cloud.define('hello', function (req: Parse.Cloud.FunctionRequest) {
  return req.params;
});

Parse.Cloud.beforeSaveFile(async (req) => {
  const { file, user } = req;
  console.log(file, user);
  if (!user) {
    // eslint-disable-next-line functional/no-throw-statement
    throw new Parse.Error(400, 'Please login to upload files');
  }
  return file;
});

Parse.Cloud.afterSaveFile(async (req) => {
  const { file, fileSize, user } = req;
  const fileObject = new Parse.Object('UserPage');
  fileObject.set('file', file);
  fileObject.set('fileSize', fileSize);
  fileObject.set('createdBy', user.id);
  const token = { sessionToken: user.getSessionToken() };
  await fileObject.save(null, token);

  const relation = user.relation('pages');
  relation.add(fileObject);
  user.save();
  console.log(user);
});
