// Initialize MongoDB

let user = 'admin';
let pwd = 'admin';

db.createUser({
  user,
  pwd,
  roles:[
    { role: 'userAdminAnyDatabase', db: 'admin'},
    "readWriteAnyDatabase"
  ]
});

db.auth(user, pwd);

use dev;

db.createUser({
  user: 'openbaas',
  pwd: 'openbaas',
  roles: ['readWrite']
});



