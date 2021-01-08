docker start mongo
docker run -itd --name mongo -p 27017:27017 mongo --auth
docker exec -i mongo mongo admin < scripts/initdb.js
