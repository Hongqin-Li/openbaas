# Delete the cluster first
# kind delete cluster

kind_version="v0.9.0"
kind_bin_path=/usr/local/bin/kind

if [ ! -f ${kind_bin_path} ]; then
  echo "- kind not installed, start downloading to '${kind_bin_path}'..."
  curl -Lo ./kind "https://kind.sigs.k8s.io/dl/${kind_version}/kind-$(uname)-amd64"
  chmod +x ./kind
  sudo mv ./kind ${kind_bin_path}
else
  echo "- found kind at '${kind_bin_path}'"
fi

cat <<EOF | kind create cluster --config -
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
- role: worker
- role: worker
EOF

# Now check
kubectl get nodes

