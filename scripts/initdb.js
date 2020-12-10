// Initialize MongoDB

let user = 'admin';
let pwd = 'admin';

db.createUser({
  user,
  pwd,
  roles:[
    { role: 'userAdminAnyDatabase', db: 'admin' },
    "readWriteAnyDatabase"
  ]
});


use admin

db.auth(user, pwd);
db.grantRolesToUser("admin", ["root"]);
// Now that admin can drop databases by
// use dabaseToDrop
// db.dropDatabase()

use dev;

db.createUser({
  user: 'openbaas',
  pwd: 'openbaas',
  roles: ['readWrite']
});



