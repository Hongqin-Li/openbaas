import * as Parse from 'parse/node';

Parse.Cloud.define('hello', function (req: any) {
  return req;
});
