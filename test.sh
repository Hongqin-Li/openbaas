

cmd=$1

# curl -X POST \
#   -H "X-Parse-Application-Id: myAppId" \
#   -H "X-Parse-Revocable-Session: 1" \
#   -H "Content-Type: application/json" \
#   -d '{"username":"cooldude6","password":"p_n7!-e8","phone":"415-392-0202"}' \
#   http://localhost:1337/parse/login

# Usage: `sh test.sh GET classes/UserFile | python -m json.tool`
if [ "$1" = "GET" ]; then
  curl -X GET -H "X-Parse-Application-Id: myAppId" \
    http://localhost:1337/parse/$2
else
  curl -v -X POST \
    -H "X-Parse-Application-Id: myAppId" \
    --form file="@test.sh" \
    http://localhost:1337/parse/files/hello.txt
  echo "x"
fi

