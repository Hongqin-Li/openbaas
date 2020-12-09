curl -X POST \
  -H "X-Parse-Application-Id: myAppId" \
  -H "X-Parse-Revocable-Session: 1" \
  -H "Content-Type: application/json" \
  -d '{"username":"cooldude6","password":"p_n7!-e8","phone":"415-392-0202"}' \
  http://localhost:1337/parse/login
