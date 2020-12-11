/* eslint-disable functional/no-throw-statement */
import { exec as child_process_exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import util from 'util';

// import k8s from '@kubernetes/client-node';
import { ensureFileSync }  from 'fs-extra';
import * as Parse from 'parse/node';
import tmp from 'tmp';

import logger from '../logger';

const exec1 = util.promisify(child_process_exec);

Parse.Cloud.define('hello', function (req: Parse.Cloud.FunctionRequest) {
  return req.params;
});

Parse.Cloud.define('deploy-page', async (req: Parse.Cloud.FunctionRequest) => {
  const { user } = req;
  const userid = user.id;
  if (!user) {
    throw new Parse.Error(400, 'Please login to upload files');
  }
  const dir = tmp.dirSync();
  async function exec(cmd: string) {
    return await exec1(cmd, {cwd: dir.name});
  }

  logger.info('userid:', userid);

  const zip_file = path.resolve(dir.name, 'public', 'index.zip');
  const dockerfile = path.resolve(dir.name, 'Dockerfile');
  const deploy_file = path.resolve(dir.name, 'deploy.yml');


  const docker_image_name = `openbaas-test`;

  ensureFileSync(zip_file);
  
  logger.info('files', zip_file, dockerfile, deploy_file);

  // Retrieve index.zip
  const resp = await Parse.Cloud.httpRequest({ url: req.params.url });
  await fs.writeFile(zip_file, resp.buffer, 'binary');

  // Unzip index.zip
  await exec(`unzip -o ${zip_file} -d public`);

  logger.info('Create Dockerfile and build');
  await fs.writeFile(dockerfile, `
FROM nginx:1.13.0-alpine
COPY ./public /usr/share/nginx/html
`);

  // https://stackoverflow.com/questions/42564058/how-to-use-local-docker-images-with-minikube
  await exec('eval $(minikube -p minikube docker-env)');
  await exec('docker build -t openbaas-test .');

  // NOTE: use local docker images by `imagePullPolicy: Never`
  // Create Deployment file and and deploy to k8s
  await fs.writeFile(deploy_file, `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
    openbaas-page-uid: ${userid}
spec:
  replicas: 2
  selector:
    matchLabels:
      openbaas-page-uid: ${userid}
  template:
    metadata:
      labels:
        openbaas-page-uid: ${userid}
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        imagePullPolicy: Never
        ports:
        - containerPort: 80
`);

  // Deploy to k8s, run pod
  await exec(`kubectl run ${docker_image_name} --image=${docker_image_name} --image-pull-policy=Never`);

  return true;
});

Parse.Cloud.beforeSaveFile(async (req) => {
  const { file, fileSize, user } = req;
  logger.info('file', file.name(), fileSize, user);
  if (!user) {
    throw new Parse.Error(400, 'Please login to upload files');
  }
  return file;
});

Parse.Cloud.afterSaveFile(async (req) => {
  const { file, fileSize, user } = req;
  const fileObject = new Parse.Object('UserPage');
  fileObject.set('file', file);
  fileObject.set('fileSize', fileSize);
  fileObject.set('createdBy', user.id);
  const token = { sessionToken: user.getSessionToken() };
  await fileObject.save(null, token);
  logger.info('user %s', user);
});
