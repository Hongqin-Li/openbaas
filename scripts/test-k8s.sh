# https://kubernetes.io/zh/docs/tutorials/stateless-application/expose-external-ip-address/

# TODO: add scripts to start docker


# start minikube
minikube start

kubectl apply -f https://k8s.io/examples/service/load-balancer-example.yaml
