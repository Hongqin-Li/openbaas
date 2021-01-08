export async function beforeSavePrivate(req: Parse.Cloud.BeforeSaveRequest) {
  const acl = new Parse.ACL(req.user);
  req.object.setACL(acl);
}
