
# https://stackoverflow.com/questions/42564058/how-to-use-local-docker-images-with-minikube
eval $(minikube -p minikube docker-env)

yarn build
node build/main/index.js
